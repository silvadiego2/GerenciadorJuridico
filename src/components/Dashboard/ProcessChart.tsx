// src/components/Dashboard/ProcessChart.tsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { FileText, CheckSquare, TrendingUp } from 'lucide-react';
import { Dashboard } from '../../types';

interface ProcessChartProps {
  data: Dashboard;
}

const ProcessChart: React.FC<ProcessChartProps> = ({ data }) => {
  // Paleta institucional corporativa
  const PIE_COLORS = ['#334155', '#475569', '#64748b', '#94a3b8'];

  const processStatusData = data.processesByStatus?.length > 0 ? data.processesByStatus : [
    { status: 'Ativo', count: data.activeProcesses || 0 },
    { status: 'Suspenso', count: 0 },
    { status: 'Arquivado', count: 0 },
    { status: 'Baixado', count: 0 }
  ];

  const taskPriorityData = data.tasksByPriority?.length > 0 ? data.tasksByPriority : [
    { priority: 'Urgente', count: 0 },
    { priority: 'Alta', count: 0 },
    { priority: 'Média', count: 0 },
    { priority: 'Baixa', count: 0 }
  ];

  const revenueData = data.revenueByMonth?.length > 0 ? data.revenueByMonth : [
    { month: 'Jul', value: 0 },
    { month: 'Ago', value: 0 },
    { month: 'Set', value: 0 },
    { month: 'Out', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dez', value: 0 }
  ];

  return (
    <div className="space-y-3.5">
      {/* 1. Evolução da Receita */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Fluxo de Faturamento</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Últimos 6 meses</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                labelStyle={{ color: '#0f172a', fontWeight: 600, fontSize: 12 }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  fontSize: 12
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0f172a" 
                strokeWidth={2}
                dot={{ fill: '#0f172a', strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5, stroke: '#0f172a', strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Gráficos Comparativos Lado a Lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Distribuição de Processos */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Processos por Status
          </h3>
          {processStatusData.every(item => item.count === 0) ? (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs">Nenhum processo com status atribuído</p>
              </div>
            </div>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {processStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: 12
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tarefas por Prioridade */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Fila de Prazos por Urgência
          </h3>
          {taskPriorityData.every(item => item.count === 0) ? (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <CheckSquare className="h-8 w-8 mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs">Nenhuma tarefa pendente</p>
              </div>
            </div>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskPriorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="priority" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Tarefas']}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: 12
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#334155"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessChart;
