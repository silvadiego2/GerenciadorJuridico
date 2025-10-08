import React, { useState } from 'react';
import { 
  BarChart3, Download, Calendar, Filter, FileText, 
  TrendingUp, Users, Scale, DollarSign, Clock,
  PieChart, Activity, Target, Loader2, AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { reportsService } from '../lib/api';
import { useNotifications } from '../hooks/useNotifications';

interface ReportData {
  overview: {
    totalProcesses: number;
    totalClients: number;
    totalRevenue: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    pendingPublications: number;
  };
  processesByStatus: Array<{ name: string; value: number; color: string }>;
  processesByMonth: Array<{ month: string; processos: number; receita: number }>;
  tasksByPriority: Array<{ priority: string; count: number; color: string }>;
  productivityByUser: Array<{ name: string; processos: number; tarefas: number; receita: number }>;
  clientsByType: Array<{ name: string; value: number }>;
  expensesByCategory: Array<{ name: string; value: number }>;
  deadlinesByUrgency: Array<{ prazo: string; quantidade: number; urgencia: 'normal' | 'atencao' | 'critico' }>;
  revenueByMonth: Array<{ month: string; receitas: number; despesas: number; liquido: number }>;
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'processes' | 'financial' | 'productivity' | 'clients'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { success, error } = useNotifications();

  // Query para buscar dados dos relatórios
  const { data: reportData, isLoading, error: queryError } = useQuery({
    queryKey: ['reports', selectedReport, dateRange],
    queryFn: () => reportsService.getData(selectedReport, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const blob = await reportsService.exportPDF(selectedReport, dateRange);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${selectedReport}-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      success('Sucesso', 'Relatório exportado com sucesso!');
    } catch (err) {
      error('Erro', 'Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      case '1y': return 'Último ano';
      default: return 'Período selecionado';
    }
  };

  const renderOverviewReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Processos</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.overview.totalProcesses}</p>
              </div>
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Todos os processos cadastrados</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">R$ {reportData.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Receitas no período</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.overview.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Clientes cadastrados</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tarefas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{reportData.overview.overdueTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Requer atenção imediata</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processos por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.processesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.processesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.processesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="processos" stroke="#3B82F6" strokeWidth={2} name="Processos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tarefas por Prioridade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Prioridade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderProductivityReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtividade por Usuário</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.productivityByUser}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="processos" fill="#3B82F6" name="Processos" />
              <Bar dataKey="tarefas" fill="#10B981" name="Tarefas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportData.productivityByUser.map((user, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">{user.name}</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Processos</span>
                  <span className="font-medium">{user.processos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tarefas</span>
                  <span className="font-medium">{user.tarefas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Receita</span>
                  <span className="font-medium text-green-600">R$ {user.receita.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas vs Despesas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro - {getDateRangeLabel()}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportData.revenueByMonth.map((month, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{month.month}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="font-medium text-green-600">R$ {month.receitas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Despesas:</span>
                    <span className="font-medium text-red-600">R$ {month.despesas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium text-gray-900">Líquido:</span>
                    <span className={`font-bold ${month.liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {month.liquido.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessesReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.processesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.processesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Temporal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.processesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="processos" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prazos por Urgência */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prazos por Urgência</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reportData.deadlinesByUrgency.map((deadline, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                deadline.urgencia === 'critico' ? 'border-red-200 bg-red-50' :
                deadline.urgencia === 'atencao' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  deadline.urgencia === 'critico' ? 'text-red-800' :
                  deadline.urgencia === 'atencao' ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                  {deadline.prazo}
                </h4>
                <p className={`text-2xl font-bold ${
                  deadline.urgencia === 'critico' ? 'text-red-600' :
                  deadline.urgencia === 'atencao' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {deadline.quantidade}
                </p>
                <p className="text-xs text-gray-600 mt-1">tarefas</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderClientsReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clientes por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.clientsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.clientsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Clientes</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total de Clientes</span>
                <span className="font-bold text-gray-900">{reportData.overview.totalClients}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700">Pessoa Física</span>
                <span className="font-bold text-blue-900">
                  {reportData.clientsByType.find(c => c.name === 'Pessoa Física')?.value || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Pessoa Jurídica</span>
                <span className="font-bold text-green-900">
                  {reportData.clientsByType.find(c => c.name === 'Pessoa Jurídica')?.value || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const reportTypes = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'processes', name: 'Processos', icon: Scale },
    { id: 'financial', name: 'Financeiro', icon: DollarSign },
    { id: 'productivity', name: 'Produtividade', icon: TrendingUp },
    { id: 'clients', name: 'Clientes', icon: Users }
  ];

  if (queryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar relatórios</h3>
          <p className="text-red-600">{(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e estatísticas do escritório</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button
            onClick={generateReport}
            disabled={isGenerating || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Gerando...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Seletor de Tipo de Relatório */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-1">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedReport === type.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <type.icon className="h-4 w-4" />
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Período Selecionado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">
            Relatório: {reportTypes.find(t => t.id === selectedReport)?.name} - {getDateRangeLabel()}
          </span>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do relatório...</p>
        </div>
      ) : (
        <>
          {selectedReport === 'overview' && renderOverviewReport()}
          {selectedReport === 'productivity' && renderProductivityReport()}
          {selectedReport === 'financial' && renderFinancialReport()}
          {selectedReport === 'processes' && renderProcessesReport()}
          {selectedReport === 'clients' && renderClientsReport()}
        </>
      )}
    </div>
  );
};

export default Reports;