import React, { useState } from 'react';
import { 
  BarChart3, Download, Calendar, Filter, FileText, 
  TrendingUp, Users, Scale, DollarSign, Clock,
  PieChart, Activity, Target
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ReportData {
  processesPorStatus: Array<{ name: string; value: number; color: string }>;
  processesPorMes: Array<{ month: string; processos: number; receita: number }>;
  produtividadeAdvogados: Array<{ name: string; processos: number; tarefas: number; receita: number }>;
  clientesPorTipo: Array<{ name: string; value: number }>;
  despesasPorCategoria: Array<{ name: string; value: number }>;
  prazosVencimento: Array<{ prazo: string; quantidade: number; urgencia: 'normal' | 'atencao' | 'critico' }>;
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'processes' | 'financial' | 'productivity' | 'clients'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isGenerating, setIsGenerating] = useState(false);

  // Dados mockados para demonstração
  const reportData: ReportData = {
    processesPorStatus: [
      { name: 'Ativos', value: 120, color: '#10B981' },
      { name: 'Suspensos', value: 15, color: '#F59E0B' },
      { name: 'Arquivados', value: 12, color: '#6B7280' },
      { name: 'Baixados', value: 3, color: '#3B82F6' }
    ],
    processesPorMes: [
      { month: 'Jul', processos: 45, receita: 75000 },
      { month: 'Ago', processos: 52, receita: 82000 },
      { month: 'Set', processos: 48, receita: 78000 },
      { month: 'Out', processos: 55, receita: 85000 },
      { month: 'Nov', processos: 61, receita: 92000 },
      { month: 'Dez', processos: 58, receita: 88000 }
    ],
    produtividadeAdvogados: [
      { name: 'Dr. João Silva', processos: 45, tarefas: 128, receita: 180000 },
      { name: 'Maria Santos', processos: 32, tarefas: 95, receita: 95000 },
      { name: 'Carlos Oliveira', processos: 28, tarefas: 87, receita: 120000 }
    ],
    clientesPorTipo: [
      { name: 'Pessoa Física', value: 65 },
      { name: 'Pessoa Jurídica', value: 24 }
    ],
    despesasPorCategoria: [
      { name: 'Custas Processuais', value: 15000 },
      { name: 'Diligências', value: 8500 },
      { name: 'Perícias', value: 12000 },
      { name: 'Outros', value: 4500 }
    ],
    prazosVencimento: [
      { prazo: 'Próximos 7 dias', quantidade: 8, urgencia: 'critico' },
      { prazo: '8-15 dias', quantidade: 15, urgencia: 'atencao' },
      { prazo: '16-30 dias', quantidade: 23, urgencia: 'normal' },
      { prazo: 'Mais de 30 dias', quantidade: 45, urgencia: 'normal' }
    ]
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const generateReport = async () => {
    setIsGenerating(true);
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // Aqui seria feito o download do PDF
    alert('Relatório gerado com sucesso!');
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

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Processos</p>
              <p className="text-2xl font-bold text-blue-600">150</p>
            </div>
            <Scale className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">+12% vs mês anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">R$ 500K</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">+8% vs mês anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-purple-600">89</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">+5% vs mês anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prazos Críticos</p>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Próximos 7 dias</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processos por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={reportData.processesPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.processesPorStatus.map((entry, index) => (
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
            <LineChart data={reportData.processesPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="processos" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderProductivityReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtividade por Advogado</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportData.produtividadeAdvogados}>
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
        {reportData.produtividadeAdvogados.map((advogado, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">{advogado.name}</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processos</span>
                <span className="font-medium">{advogado.processos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tarefas</span>
                <span className="font-medium">{advogado.tarefas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Receita</span>
                <span className="font-medium text-green-600">R$ {advogado.receita.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita vs Processos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.processesPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="receita" fill="#10B981" name="Receita (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={reportData.despesasPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.despesasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const reportTypes = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'processes', name: 'Processos', icon: Scale },
    { id: 'financial', name: 'Financeiro', icon: DollarSign },
    { id: 'productivity', name: 'Produtividade', icon: TrendingUp },
    { id: 'clients', name: 'Clientes', icon: Users }
  ];

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
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
      {selectedReport === 'overview' && renderOverviewReport()}
      {selectedReport === 'productivity' && renderProductivityReport()}
      {selectedReport === 'financial' && renderFinancialReport()}
      
      {(selectedReport === 'processes' || selectedReport === 'clients') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Relatório de {reportTypes.find(t => t.id === selectedReport)?.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Este relatório está em desenvolvimento e será disponibilizado em breve.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Solicitar Desenvolvimento
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;