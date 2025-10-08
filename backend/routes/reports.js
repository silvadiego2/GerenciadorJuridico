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

// Função para calcular data de início baseada no período
const getStartDate = (range) => {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

// GET /api/reports/data - Buscar dados para relatórios
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const { type, range = '30d' } = req.query;
    const startDate = getStartDate(range);

    // Buscar dados básicos
    const [
      { count: totalProcesses },
      { count: totalClients },
      { count: totalTasks },
      { count: completedTasks },
      { count: overdueTasks },
      { count: pendingPublications }
    ] = await Promise.all([
      supabase.from('processes').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'concluida'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString()).eq('status', 'pendente'),
      supabase.from('publications').select('*', { count: 'exact', head: true }).eq('acknowledged', false)
    ]);

    // Buscar receita total no período
    const { data: revenueData } = await supabase
      .from('financial_entries')
      .select('value, type, status')
      .eq('status', 'pago')
      .gte('paid_at', startDate.toISOString());

    const totalRevenue = revenueData?.filter(entry => ['honorario', 'receita'].includes(entry.type))
      .reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;

    // Processos por status
    const { data: processesData } = await supabase
      .from('processes')
      .select('status');

    const processesByStatus = [
      { name: 'Ativo', value: processesData?.filter(p => p.status === 'ativo').length || 0, color: '#10B981' },
      { name: 'Suspenso', value: processesData?.filter(p => p.status === 'suspenso').length || 0, color: '#F59E0B' },
      { name: 'Arquivado', value: processesData?.filter(p => p.status === 'arquivado').length || 0, color: '#6B7280' },
      { name: 'Baixado', value: processesData?.filter(p => p.status === 'baixado').length || 0, color: '#3B82F6' }
    ];

    // Tarefas por prioridade
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('priority')
      .neq('status', 'concluida');

    const tasksByPriority = [
      { priority: 'Urgente', count: tasksData?.filter(t => t.priority === 'urgente').length || 0, color: '#EF4444' },
      { priority: 'Alta', count: tasksData?.filter(t => t.priority === 'alta').length || 0, color: '#F59E0B' },
      { priority: 'Média', count: tasksData?.filter(t => t.priority === 'media').length || 0, color: '#10B981' },
      { priority: 'Baixa', count: tasksData?.filter(t => t.priority === 'baixa').length || 0, color: '#6B7280' }
    ];

    // Clientes por tipo
    const { data: clientsData } = await supabase
      .from('clients')
      .select('type')
      .eq('status', 'ativo');

    const clientsByType = [
      { name: 'Pessoa Física', value: clientsData?.filter(c => c.type === 'fisica').length || 0 },
      { name: 'Pessoa Jurídica', value: clientsData?.filter(c => c.type === 'juridica').length || 0 }
    ];

    // Produtividade por usuário
    const { data: usersData } = await supabase
      .from('users')
      .select(`
        id,
        name,
        role
      `)
      .in('role', ['admin', 'advogado', 'estagiario']);

    const productivityByUser = [];
    for (const user of usersData || []) {
      const [
        { count: userProcesses },
        { count: userTasks },
        { data: userRevenue }
      ] = await Promise.all([
        supabase.from('processes').select('*', { count: 'exact', head: true }).eq('responsible_id', user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id),
        supabase.from('financial_entries').select('value').eq('responsible_id', user.id).eq('status', 'pago').in('type', ['honorario', 'receita'])
      ]);

      const userRevenueTotal = userRevenue?.reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;

      productivityByUser.push({
        name: user.name,
        processos: userProcesses || 0,
        tarefas: userTasks || 0,
        receita: userRevenueTotal
      });
    }

    // Despesas por categoria
    const { data: expensesData } = await supabase
      .from('financial_entries')
      .select('category, value')
      .eq('type', 'despesa')
      .eq('status', 'pago')
      .gte('paid_at', startDate.toISOString());

    const expensesByCategory = {};
    expensesData?.forEach(expense => {
      const category = expense.category || 'Outros';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.value;
    });

    const expensesByCategoryArray = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));

    // Receita por mês (últimos 6 meses)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0, 23, 59, 59);
      
      const [
        { data: monthRevenue },
        { data: monthExpenses }
      ] = await Promise.all([
        supabase.from('financial_entries').select('value').eq('status', 'pago').in('type', ['honorario', 'receita']).gte('paid_at', monthStart.toISOString()).lte('paid_at', monthEnd.toISOString()),
        supabase.from('financial_entries').select('value').eq('status', 'pago').eq('type', 'despesa').gte('paid_at', monthStart.toISOString()).lte('paid_at', monthEnd.toISOString())
      ]);

      const receitas = monthRevenue?.reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;
      const despesas = monthExpenses?.reduce((sum, entry) => sum + (entry.value || 0), 0) || 0;
      
      revenueByMonth.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        receitas,
        despesas,
        liquido: receitas - despesas
      });
    }

    // Processos por mês
    const processesByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0, 23, 59, 59);
      
      const { count: monthProcesses } = await supabase
        .from('processes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      const monthRevenue = revenueByMonth.find(r => r.month === monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));
      
      processesByMonth.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        processos: monthProcesses || 0,
        receita: monthRevenue?.receitas || 0
      });
    }

    // Prazos por urgência
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('due_date, status')
      .neq('status', 'concluida');

    const now = new Date();
    const deadlinesByUrgency = [
      { 
        prazo: 'Próximos 7 dias', 
        quantidade: allTasks?.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate >= now && dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }).length || 0,
        urgencia: 'critico' as const
      },
      { 
        prazo: '8-15 dias', 
        quantidade: allTasks?.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) && 
                 dueDate <= new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        }).length || 0,
        urgencia: 'atencao' as const
      },
      { 
        prazo: '16-30 dias', 
        quantidade: allTasks?.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate > new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) && 
                 dueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }).length || 0,
        urgencia: 'normal' as const
      },
      { 
        prazo: 'Mais de 30 dias', 
        quantidade: allTasks?.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate > new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }).length || 0,
        urgencia: 'normal' as const
      }
    ];

    const reportData = {
      overview: {
        totalProcesses: totalProcesses || 0,
        totalClients: totalClients || 0,
        totalRevenue,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        overdueTasks: overdueTasks || 0,
        pendingPublications: pendingPublications || 0
      },
      processesByStatus,
      processesByMonth,
      tasksByPriority,
      productivityByUser,
      clientsByType,
      expensesByCategory: expensesByCategoryArray,
      deadlinesByUrgency,
      revenueByMonth
    };

    res.json(reportData);
  } catch (error) {
    console.error('Erro ao buscar dados do relatório:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados do relatório'
    });
  }
});

// POST /api/reports/export - Exportar relatório em PDF
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { type, range } = req.body;
    
    // Buscar dados do relatório
    const reportData = await getReportData(type, range);
    
    // Simular geração de PDF
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Criar conteúdo PDF simulado
    const pdfContent = generatePDFContent(type, range, reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${type}-${range}-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Retornar PDF simulado (em produção seria um PDF real)
    res.send(Buffer.from(pdfContent));
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({
      error: 'Erro ao exportar relatório'
    });
  }
});

// Função auxiliar para buscar dados do relatório
const getReportData = async (type, range) => {
  const startDate = getStartDate(range);
  
  // Buscar dados básicos (reutilizar lógica do endpoint /data)
  const [
    { count: totalProcesses },
    { count: totalClients },
    { count: totalTasks },
    { count: completedTasks },
    { count: overdueTasks },
    { count: pendingPublications }
  ] = await Promise.all([
    supabase.from('processes').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'concluida'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString()).eq('status', 'pendente'),
    supabase.from('publications').select('*', { count: 'exact', head: true }).eq('acknowledged', false)
  ]);

  return {
    overview: {
      totalProcesses: totalProcesses || 0,
      totalClients: totalClients || 0,
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      overdueTasks: overdueTasks || 0,
      pendingPublications: pendingPublications || 0
    },
    period: range,
    generatedAt: new Date().toISOString()
  };
};

// Função auxiliar para gerar conteúdo PDF
const generatePDFContent = (type, range, data) => {
  const header = `RELATÓRIO ${type.toUpperCase()} - ${range.toUpperCase()}`;
  const timestamp = new Date().toLocaleString('pt-BR');
  
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(${header}) Tj
0 -20 Td
(Gerado em: ${timestamp}) Tj
0 -40 Td
(Total de Processos: ${data.overview.totalProcesses}) Tj
0 -20 Td
(Total de Clientes: ${data.overview.totalClients}) Tj
0 -20 Td
(Tarefas Concluidas: ${data.overview.completedTasks}) Tj
0 -20 Td
(Tarefas Vencidas: ${data.overview.overdueTasks}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
456
%%EOF`;
};

// POST /api/reports/custom - Relatório customizado
router.post('/custom', authenticateToken, async (req, res) => {
  try {
    const { filters, fields, groupBy } = req.body;
    
    // Implementar lógica de relatório customizado
    // Por enquanto, retornar dados básicos
    const customData = {
      filters,
      fields,
      groupBy,
      data: [],
      generatedAt: new Date().toISOString()
    };
    
    res.json(customData);
  } catch (error) {
    console.error('Erro ao gerar relatório customizado:', error);
    res.status(500).json({
      error: 'Erro ao gerar relatório customizado'
    });
  }
});

module.exports = router;