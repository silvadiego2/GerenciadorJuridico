// src/pages/Reports.tsx
import React, { useState } from 'react';
import { 
  BarChart3, Download, Calendar, Scale, DollarSign, 
  Clock, Users, Loader2, TrendingUp 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { reportsService } from '../lib/api';
import { useNotifications } from '../hooks/useNotifications';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'processes' | 'financial' | 'productivity' | 'clients'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { success, error } = useNotifications();

  const { data: reportData, isLoading, error: queryError } = useQuery({
    queryKey: ['reports', selectedReport, dateRange],
    queryFn: () => reportsService.getData(selectedReport, dateRange),
    staleTime: 5 * 60 * 1000,
  });

  const PIE_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const blob = await reportsService.exportPDF(selectedReport, dateRange);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Sucesso', 'Relatório exportado em PDF');
    } catch {
      error('Erro', 'Falha ao exportar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-800">
          Erro ao carregar dados do relatório: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Relatórios Gerenciais</h1>
          <p className="text-xs text-slate-500 mt-0.5">Indicadores de produtividade, volumetria e finanças processuais</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Ano corrente</option>
          </select>
          <button
            onClick={generateReport}
            disabled={isGenerating || isLoading}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-slate-500" />}
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Menu de Abas */}
      <div className="flex gap-1 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'overview', name: 'Visão Geral' },
          { id: 'processes', name: 'Processos' },
          { id: 'financial', name: 'Financeiro' },
          { id: 'productivity', name: 'Produtividade' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id as any)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedReport === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-600" />
          Consolidando dados estatísticos...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total de Autos</span>
              <p className="mt-1 text-xl font-bold font-mono text-slate-900">{reportData?.overview?.totalProcesses || 0}</p>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Base de Clientes</span>
              <p className="mt-1 text-xl font-bold font-mono text-slate-900">{reportData?.overview?.totalClients || 0}</p>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Receitas Apuradas</span>
              <p className="mt-1 text-xl font-bold font-mono text-emerald-700">
                R$ {Number(reportData?.overview?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Prazos Fatais</span>
              <p className="mt-1 text-xl font-bold font-mono text-amber-700">{reportData?.overview?.overdueTasks || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-100">
              Distribuição e Andamento Processual
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.processesByMonth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: 12 }} />
                  <Bar dataKey="processos" fill="#0f172a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
