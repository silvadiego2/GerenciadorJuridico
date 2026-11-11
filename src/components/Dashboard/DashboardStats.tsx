// src/components/Dashboard/DashboardStats.tsx
import React from 'react';
import { 
  Users, 
  Clock, 
  DollarSign, 
  BookOpen,
  Scale
} from 'lucide-react';
import { Dashboard } from '../../types';

interface DashboardStatsProps {
  data: Dashboard;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const activeProcesses = data?.activeProcesses ?? 0;
  const totalProcesses = data?.totalProcesses ?? 0;
  const clientsCount = data?.clientsCount ?? 0;
  const overdueTasks = data?.overdueTasks ?? 0;
  const monthlyRevenue = data?.monthlyRevenue ?? 0;
  const pendingPublications = data?.pendingPublications ?? 0;

  const stats = [
    {
      name: 'Acervo Ativo',
      value: activeProcesses,
      total: totalProcesses,
      icon: Scale,
      hint: totalProcesses > 0 ? `${Math.round((activeProcesses / totalProcesses) * 100)}% em andamento` : 'Sem acervo',
      hintColor: 'text-slate-400',
    },
    {
      name: 'Clientes Registrados',
      value: clientsCount,
      icon: Users,
      hint: 'Pessoas e empresas',
      hintColor: 'text-slate-400',
    },
    {
      name: 'Prazos e Tarefas',
      value: overdueTasks,
      icon: Clock,
      hint: overdueTasks > 0 ? 'Aguardando cumprimento' : 'Rotina em dia',
      hintColor: overdueTasks > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600',
    },
    {
      name: 'Honorários do Mês',
      value: `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      hint: monthlyRevenue > 0 ? 'Competência atual' : 'Sem faturamento lançado',
      hintColor: 'text-slate-400',
    },
    {
      name: 'Publicações DJE',
      value: pendingPublications,
      icon: BookOpen,
      hint: pendingPublications > 0 ? 'Novas intimações' : 'Todas cientes',
      hintColor: pendingPublications > 0 ? 'text-sky-700 font-medium' : 'text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate mr-2">
                {stat.name}
              </span>
              <IconComponent className="h-4 w-4 text-slate-400 shrink-0" />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
                  {stat.value}
                </span>
                {Boolean(stat.total) && (
                  <span className="text-xs text-slate-400 font-mono">
                    /{stat.total}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px]">
              <span className={stat.hintColor}>
                {stat.hint}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
