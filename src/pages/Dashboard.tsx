import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../lib/api';
import { Dashboard as DashboardType } from '../types';
import { 
  Scale, 
  Clock, 
  DollarSign, 
  Bell, 
  Users, 
  ArrowUpRight, 
  RefreshCw, 
  AlertCircle, 
  Loader2,
  Calendar,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Normalização estrita dos dados
  const data: DashboardType = {
    totalProcesses: dashboardData?.totalProcesses ?? 0,
    activeProcesses: dashboardData?.activeProcesses ?? 0,
    overdueTasks: dashboardData?.overdueTasks ?? 0,
    pendingPublications: dashboardData?.pendingPublications ?? 0,
    monthlyRevenue: dashboardData?.monthlyRevenue ?? 0,
    clientsCount: dashboardData?.clientsCount ?? 0,
    processesByStatus: Array.isArray(dashboardData?.processesByStatus) ? dashboardData.processesByStatus : [],
    tasksByPriority: Array.isArray(dashboardData?.tasksByPriority) ? dashboardData.tasksByPriority : [],
    revenueByMonth: Array.isArray(dashboardData?.revenueByMonth) ? dashboardData.revenueByMonth : [],
    recentActivities: Array.isArray(dashboardData?.recentActivities) ? dashboardData.recentActivities : []
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white border border-rose-200 rounded-lg p-6 text-center max-w-lg mx-auto shadow-2xs">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Falha na sincronização do painel</h3>
          <p className="text-xs text-slate-500 mb-4">{(error as Error).message}</p>
          <button
            onClick={handleRefresh}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Título Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Painel de Controlo</h1>
          <p className="text-xs text-slate-500 mt-0.5">Indicadores operacionais, prazos fatais e saúde do acervo</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Atualizar Indicadores</span>
          </button>
        </div>
      </div>

      {/* Indicadores Principais (KPIs Executivos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Processos Ativos */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Acervo Ativo</span>
            <Scale className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-6 w-12 bg-slate-100 rounded animate-pulse" />
            ) : (
              <span className="text-xl font-bold font-mono text-slate-900">{data.activeProcesses}</span>
            )}
            <span className="text-[11px] text-slate-400">Total: {data.totalProcesses}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/processos" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Aceder acervo <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Prazos / Tarefas Pendentes */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Prazos e Tarefas</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-6 w-12 bg-slate-100 rounded animate-pulse" />
            ) : (
              <span className={`text-xl font-bold font-mono ${data.overdueTasks > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {data.overdueTasks}
              </span>
            )}
            <span className="text-[11px] text-slate-400">Pendentes</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/tarefas" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Ver agenda <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Intimações / Publicações DJE */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Publicações DJE</span>
            <Bell className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-6 w-12 bg-slate-100 rounded animate-pulse" />
            ) : (
              <span className="text-xl font-bold font-mono text-slate-900">{data.pendingPublications}</span>
            )}
            <span className="text-[11px] text-slate-400">Novos despachos</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/publicacoes" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Ler intimações <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Clientes */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Clientes Cadastrados</span>
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-6 w-12 bg-slate-100 rounded animate-pulse" />
            ) : (
              <span className="text-xl font-bold font-mono text-slate-900">{data.clientsCount}</span>
            )}
            <span className="text-[11px] text-slate-400">Pessoas / Empresas</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Link to="/clientes" className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-0.5">
              Gestão de clientes <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grelha de Produtividade: Resumo de Prazos e Status do Acervo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bloco 1: Distribuição de Processos por Status */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Diagnóstico do Acervo</h2>
              <p className="text-[11px] text-slate-500">Distribuição processual por fase e andamento</p>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-500">Total: {data.totalProcesses}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Fase de Conhecimento</span>
              <p className="text-lg font-bold font-mono text-slate-800 mt-1">{data.activeProcesses}</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full" 
                  style={{ width: `${data.totalProcesses > 0 ? (data.activeProcesses / data.totalProcesses) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Fase Recursal</span>
              <p className="text-lg font-bold font-mono text-slate-800 mt-1">0</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Execução / Cumprimento</span>
              <p className="text-lg font-bold font-mono text-slate-800 mt-1">0</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-md border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Sincronização com Projudi/PJe ativa via extensão de navegador</span>
            </div>
            <Link to="/processos" className="text-slate-900 font-semibold hover:underline text-[11px]">
              Ver processos importados →
            </Link>
          </div>
        </div>

        {/* Bloco 2: Ações Imediatas / Alertas Rápidos */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ações Imediatas</h2>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-md border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-slate-800">Contagem de Prazos</p>
                  <p className="text-[11px] text-slate-500">Configurada conforme CPC/15 (dias úteis).</p>
                </div>
              </div>

              <div className="p-2.5 rounded-md border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                <Bell className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-slate-800">Varredura de E-mails</p>
                  <p className="text-[11px] text-slate-500">Monitorização automática de intimações via script.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <Link
              to="/configuracoes"
              className="w-full block text-center py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              Configurar Regras de Notificação
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
