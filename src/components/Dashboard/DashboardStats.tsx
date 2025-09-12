import React from 'react';
import { Users, FileText, AlertTriangle, DollarSign, CheckSquare, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { Dashboard } from '../../types';

interface DashboardStatsProps {
  data: Dashboard;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const stats = [
    {
      name: 'Processos Ativos',
      value: data.activeProcesses,
      total: data.totalProcesses,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: data.totalProcesses > 0 ? `${Math.round((data.activeProcesses / data.totalProcesses) * 100)}% ativos` : null,
    },
    {
      name: 'Clientes',
      value: data.clientsCount,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: null,
    },
    {
      name: 'Tarefas Vencidas',
      value: data.overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: data.overdueTasks > 0 ? 'Requer atenção' : 'Em dia',
      changeColor: data.overdueTasks > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      name: 'Receita Mensal',
      value: `R$ ${data.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: data.monthlyRevenue > 0 ? 'Mês atual' : 'Sem receitas',
    },
    {
      name: 'Publicações Pendentes',
      value: data.pendingPublications,
      icon: BookOpen,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: data.pendingPublications > 0 ? 'Aguardando ciência' : 'Todas em dia',
      changeColor: data.pendingPublications > 0 ? 'text-orange-600' : 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <div className="flex items-baseline justify-end">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                {stat.total && (
                  <p className="ml-2 text-sm text-gray-500">
                    / {stat.total}
                  </p>
                )}
              </div>
              {stat.change && (
                <p className={`text-xs mt-1 ${stat.changeColor || 'text-gray-500'}`}>
                  {stat.change}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;