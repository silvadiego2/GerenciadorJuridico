const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET /api/dashboard/summary - Resumo completo do dashboard
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    // Buscar contadores principais
    const [
      { count: totalProcesses },
      { count: activeProcesses },
      { count: clientsCount },
      { count: overdueTasks },
      { count: pendingPublications }
    ] = await Promise.all([
      supabase.from('processes').select('*', { count: 'exact', head: true }),
      supabase.from('processes').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString()).eq('status', 'pendente'),
      supabase.from('publications').select('*', { count: 'exact', head: true }).eq('acknowledged', false)
    ]);

    // Buscar receita mensal (entradas pagas no mês atual)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const { data: monthlyRevenue } = await supabase
      .from('financial_entries')
      .select('value')
      .eq('status', 'pago')
      .in('type', ['honorario', 'receita'])
      .gte('paid_at', startOfMonth)
      .lte('paid_at', endOfMonth);

    const monthlyRevenueTotal = monthlyRevenue?.reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;

    // Buscar processos por status
    const { data: processesData } = await supabase
      .from('processes')
      .select('status');

    const processesByStatus = [
      { status: 'Ativo', count: processesData?.filter(p => p.status === 'ativo').length || 0 },
      { status: 'Suspenso', count: processesData?.filter(p => p.status === 'suspenso').length || 0 },
      { status: 'Arquivado', count: processesData?.filter(p => p.status === 'arquivado').length || 0 },
      { status: 'Baixado', count: processesData?.filter(p => p.status === 'baixado').length || 0 }
    ];

    // Buscar tarefas por prioridade
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('priority')
      .neq('status', 'concluida');

    const tasksByPriority = [
      { priority: 'Urgente', count: tasksData?.filter(t => t.priority === 'urgente').length || 0 },
      { priority: 'Alta', count: tasksData?.filter(t => t.priority === 'alta').length || 0 },
      { priority: 'Média', count: tasksData?.filter(t => t.priority === 'media').length || 0 },
      { priority: 'Baixa', count: tasksData?.filter(t => t.priority === 'baixa').length || 0 }
    ];

    // Buscar receita por mês (últimos 6 meses)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0, 23, 59, 59);
      
      const { data: monthData } = await supabase
        .from('financial_entries')
        .select('value')
        .eq('status', 'pago')
        .in('type', ['honorario', 'receita'])
        .gte('paid_at', monthStart.toISOString())
        .lte('paid_at', monthEnd.toISOString());

      const monthTotal = monthData?.reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;
      
      revenueByMonth.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        value: monthTotal
      });
    }

    // Buscar atividades recentes (últimas 10)
    const { data: recentActivities } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        status,
        updated_at,
        assigned_user:users!tasks_assigned_to_fkey(name),
        process:processes(number, subject),
        client:clients(name)
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    const formattedActivities = recentActivities?.map(activity => ({
      id: activity.id,
      type: 'task',
      title: activity.status === 'concluida' ? 'Tarefa concluída' : 'Tarefa atualizada',
      description: `${activity.title}${activity.process ? ` - ${activity.process.number}` : ''}`,
      time: activity.updated_at,
      user: activity.assigned_user?.name || 'Sistema'
    })) || [];

    const summary = {
      totalProcesses: totalProcesses || 0,
      activeProcesses: activeProcesses || 0,
      overdueTasks: overdueTasks || 0,
      pendingPublications: pendingPublications || 0,
      monthlyRevenue: monthlyRevenueTotal,
      clientsCount: clientsCount || 0,
      processesByStatus,
      tasksByPriority,
      revenueByMonth,
      recentActivities: formattedActivities
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    res.status(500).json({
      error: 'Erro ao buscar resumo do dashboard'
    });
  }
});

// GET /api/dashboard/stats - Estatísticas específicas
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calcular data de início baseada no período
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Buscar estatísticas do período
    const [
      { count: newProcesses },
      { count: completedTasks },
      { data: revenueData }
    ] = await Promise.all([
      supabase.from('processes').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'concluida').gte('completed_at', startDate.toISOString()),
      supabase.from('financial_entries').select('value, type').eq('status', 'pago').gte('paid_at', startDate.toISOString())
    ]);

    const totalRevenue = revenueData?.filter(entry => ['honorario', 'receita'].includes(entry.type))
      .reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;

    const totalExpenses = revenueData?.filter(entry => ['despesa'].includes(entry.type))
      .reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;

    res.json({
      period,
      newProcesses: newProcesses || 0,
      completedTasks: completedTasks || 0,
      totalRevenue,
      totalExpenses,
      netRevenue: totalRevenue - totalExpenses
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas'
    });
  }
});

module.exports = router;