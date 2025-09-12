import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Dashboard } from '../../types';

interface ProcessChartProps {
  data: Dashboard;
}

const ProcessChart: React.FC<ProcessChartProps> = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const PRIORITY_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#6B7280'];

  // Dados para gráfico de processos por status
  const processStatusData = data.processesByStatus.length > 0 ? data.processesByStatus : [
    { status: 'Ativo', count: 0 },
    { status: 'Suspenso', count: 0 },
    { status: 'Arquivado', count: 0 },
    { status: 'Baixado', count: 0 }
  ];

  // Dados para gráfico de tarefas por prioridade
  const taskPriorityData = data.tasksByPriority.length > 0 ? data.tasksByPriority : [
    { priority: 'Urgente', count: 0 },
    { priority: 'Alta', count: 0 },
    { priority: 'Média', count: 0 },
    { priority: 'Baixa', count: 0 }
  ];

  // Dados para gráfico de receita por mês
  const revenueData = data.revenueByMonth.length > 0 ? data.revenueByMonth : [
    { month: 'Jul', value: 0 },
    { month: 'Ago', value: 0 },
    { month: 'Set', value: 0 },
    { month: 'Out', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dez', value: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Gráfico de Receita por Mês */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Evolução da Receita</h3>
          <span className="text-sm text-gray-500">Últimos 6 meses</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Receita']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos de Processos e Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processos por Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processos por Status</h3>
          {processStatusData.every(item => item.count === 0) ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Nenhum processo cadastrado</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={processStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {processStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tarefas por Prioridade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Prioridade</h3>
          {taskPriorityData.every(item => item.count === 0) ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <CheckSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Nenhuma tarefa cadastrada</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskPriorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="priority" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, 'Tarefas']}
                  labelFormatter={(label) => `Prioridade: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessChart;