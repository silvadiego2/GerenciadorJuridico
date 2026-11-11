// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Scale, 
  Clock, 
  DollarSign, 
  Bell, 
  Users, 
  ArrowUpRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Eye,
  FileText,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { format, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProcessDetailsModal } from '../components/Processes/ProcessDetailsModal';
import { useNotifications } from '../hooks/useNotifications';

const Dashboard: React.FC = () => {
  const [viewingProcess, setViewingProcess] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  // 1. Resumo Quantitativo
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['dashboard-metrics-summary'],
    queryFn: async () => {
      const [
        { count: totalProcesses },
        { count: activeProcesses },
        { count: pendingTasks },
        { count: pendingPublications },
        { count: totalClients }
      ] = await Promise.all([
        supabase.from('processes').select('*', { count: 'exact', head: true }),
        supabase.from('processes').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'concluida'),
        supabase.from('publications').select('*', { count: 'exact', head: true }).eq('acknowledged', false),
        supabase.from('clients').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalProcesses: totalProcesses || 0,
        activeProcesses: activeProcesses || 0,
        pendingTasks: pendingTasks || 0,
        pendingPublications: pendingPublications || 0,
        totalClients: totalClients || 0
      };
    },
    staleTime: 60 * 1000
  });

  // 2. Prazos Imediatos da Semana (Tarefas pendentes)
  const { data: urgentTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['dashboard-urgent-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, process:processes(id, number, subject), assigned_user:users(id, name)')
        .neq('status', 'concluida')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000
  });

  // 3. Últimas Intimações / Publicações Capturadas (DJE e Gmail)
  const { data: recentPubs = [], isLoading: loadingPubs } = useQuery({
    queryKey: ['dashboard-recent-publications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('publication_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000
  });

  // 4. Fluxo Financeiro Resumido
  const { data: financialFlow } = useQuery({
    queryKey: ['dashboard-financial-flow'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('financial_entries')
        .select('value, type, status');

      if (error) return { totalReceitas: 0, pendentes: 0 };

      const totalReceitas = entries
        ?.filter(e => (e.type === 'honorario' || e.type === 'receita') && e.status === 'pago')
        .reduce((acc, curr) => acc + Number(curr.value || 0), 0) || 0;

      const pendentes = entries
        ?.filter(e => e.status === 'pendente')
        .reduce((acc, curr) => acc + Number(curr.value || 0), 0) || 0;

      return { totalReceitas, pendentes };
    },
    staleTime: 2 * 60 * 1000
  });

  // Mutation para dar baixa rápida em Tarefa
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'concluida', updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-urgent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Prazo Cumprido', 'Tarefa marcada como concluída.');
    },
    onError: (err: any) => notifyError('Erro', err.message || 'Falha ao concluir tarefa.')
  });

  // Mutation para dar ciência rápida em Intimação
  const acknowledgePubMutation = useMutation({
    mutationFn: async (pubId: string) => {
      const { error } = await supabase
        .from('publications')
        .update({ acknowledged: true, read: true, updated_at: new Date().toISOString() })
        .eq('id', pubId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-publications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      success('Ciência Registada', 'Publicação marcada com ciência formal.');
    },
    onError: (err: any) => notifyError('Erro', err.message || 'Falha ao registar ciência.')
  });

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-urgent-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-recent-publications'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-financial-flow'] });
  };

  const getTaskUrgency = (dueDateStr?: string) => {
    if (!dueDateStr) return { label: 'Sem data', color: 'text-slate-400' };
    const now = new Date();
    const due = new Date(dueDateStr);

    if (isBefore(due, now)) {
      return { label: 'Prazo Vencido', color: 'text-rose-700 font-semibold' };
    } else if (isBefore(due, addDays(now, 3))) {
      return { label: 'Termo Fatal Próximo', color: 'text-amber-700 font-semibold' };
    }
    return { label: 'No prazo', color: 'text-slate-500' };
  };

  return (
    <div className="space-y-4">
      {/* Topo Executivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Central Matinal Forense</h1>
          <p className="text-xs text-slate-500 mt-0.5">Visão geral do acervo, intimações pendentes e prazos fatais</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Atualizar Painel</span>
          </button>
        </div>
      </div>

      {/* Indicadores Principais (KPIs em Slate) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Acervo Ativo */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Acervo Ativo</span>
            <Scale className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">
              {loadingMetrics ? '-' : metrics?.activeProcesses}
            </span>
            <span className="text-[11px] text-slate-400">Total: {metrics?.totalProcesses}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/processos" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Consultar autos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2. Prazos Fatais */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Prazos e Audiências</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-bold font-mono ${(metrics?.pendingTasks || 0) > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {loadingMetrics ? '-' : metrics?.pendingTasks}
            </span>
            <span className="text-[11px] text-slate-400">A cumprir</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/tarefas" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Abrir agenda <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 3. Intimações Sem Ciência */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Intimações DJE</span>
            <Bell className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-bold font-mono ${(metrics?.pendingPublications || 0) > 0 ? 'text-sky-700' : 'text-slate-900'}`}>
              {loadingMetrics ? '-' : metrics?.pendingPublications}
            </span>
            <span className="text-[11px] text-slate-400">Sem ciência</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/publicacoes" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Rever despachos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 4. Honorários e Caixa */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Honorários Realizados</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-emerald-700">
              R$ {Number(financialFlow?.totalReceitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/financeiro" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Extrato financeiro <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grade Principal: Prazos Críticos + Intimações Recebidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Coluna 1: Prazos Fatais e Audiências Imediatas */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Prazos Fatais Imediatos (CPC/15)
              </h2>
            </div>
            <Link to="/tarefas" className="text-[11px] font-medium text-indigo-600 hover:underline">
              Ver todos →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loadingTasks ? (
              <div className="p-8 text-center text-xs text-slate-400">A carregar prazos prioritários...</div>
            ) : urgentTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                Nenhum prazo pendente para os próximos dias.
              </div>
            ) : (
              urgentTasks.map((t: any) => {
                const urgency = getTaskUrgency(t.due_date);
                return (
                  <div key={t.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                        <span className={`text-[10px] ${urgency.color}`}>({urgency.label})</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>Termo: {t.due_date ? format(new Date(t.due_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}</span>
                        {t.process?.number && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => setViewingProcess(t.process)}
                              className="text-slate-700 hover:text-indigo-600 underline font-medium"
                              title="Abrir Ficha do Processo"
                            >
                              {t.process.number}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => completeTaskMutation.mutate(t.id)}
                      disabled={completeTaskMutation.isPending}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                      title="Cumprir prazo"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Cumprir</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 2: Novas Intimações Capturadas (DJE / Gmail) */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-sky-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Intimações do DJE / Robô de E-mails
              </h2>
            </div>
            <Link to="/publicacoes" className="text-[11px] font-medium text-indigo-600 hover:underline">
              Ver todas →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loadingPubs ? (
              <div className="p-8 text-center text-xs text-slate-400">A carregar publicações recentes...</div>
            ) : recentPubs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Bell className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                Nenhuma notificação capturada recentemente.
              </div>
            ) : (
              recentPubs.map((pub: any) => (
                <div key={pub.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">
                        {pub.process_number || 'Sem autos identificados'}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {pub.court || 'TJ-BA'}
                      </span>
                      {!pub.acknowledged && (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          Sem ciência
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                      {pub.content}
                    </p>

                    <span className="text-[10px] text-slate-400 font-mono block">
                      Recebido em: {pub.publication_date ? format(new Date(pub.publication_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                    </span>
                  </div>

                  {!pub.acknowledged && (
                    <button
                      onClick={() => acknowledgePubMutation.mutate(pub.id)}
                      disabled={acknowledgePubMutation.isPending}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors shrink-0 shadow-2xs"
                    >
                      Dar Ciência
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Ficha 360° do Processo (caso acionada a partir dos autos do prazo) */}
      {viewingProcess && (
        <ProcessDetailsModal
          process={viewingProcess}
          onClose={() => setViewingProcess(null)}
          onEdit={() => {}}
        />
      )}
    </div>
  );
};

export default Dashboard;
