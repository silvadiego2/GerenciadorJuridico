// src/components/Layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Clock, FileWarning, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { format, addDays, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Busca intimações sem ciência e prazos urgentes em tempo real
  const { data: alertsData } = useQuery({
    queryKey: ['header-notifications'],
    queryFn: async () => {
      const limitDate = addDays(new Date(), 3).toISOString();

      const [pubsRes, tasksRes] = await Promise.all([
        supabase
          .from('publications')
          .select('id, process_number, court, publication_date, content')
          .eq('acknowledged', false)
          .order('publication_date', { ascending: false })
          .limit(5),
        supabase
          .from('tasks')
          .select('id, title, due_date, priority, process:processes(number)')
          .neq('status', 'concluida')
          .lte('due_date', limitDate)
          .order('due_date', { ascending: true })
          .limit(5)
      ]);

      return {
        publications: pubsRes.data || [],
        tasks: tasksRes.data || []
      };
    },
    refetchInterval: 2 * 60 * 1000, // Atualiza a cada 2 minutos
    staleTime: 60 * 1000
  });

  // Dar ciência rápida direto do sininho
  const ackPubMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('publications')
        .update({ acknowledged: true, read: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent-publications'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    }
  });

  const publications = alertsData?.publications || [];
  const tasks = alertsData?.tasks || [];
  const totalAlerts = publications.length + tasks.length;

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/processos?search=${encodeURIComponent(globalSearch.trim())}`);
    setGlobalSearch('');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3 select-none relative z-30">
      <div className="flex items-center justify-between gap-3">
        {/* Esquerda: Botão Menu e Busca Global */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-md">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Alternar barra lateral"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <form onSubmit={handleGlobalSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar CNJ, parte ou assunto (Enter)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:border-slate-400 text-slate-800 transition-colors"
            />
          </form>
        </div>

        {/* Direita: Notificações e Perfil do Usuário */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          
          {/* Container do Sininho + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-1.5 rounded-md transition-colors ${
                isNotificationsOpen 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Intimações e Prazos Fatais"
            >
              <Bell className="h-4 w-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[9px] font-bold font-mono rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-2xs">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Dropdown de Alertas Forenses */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Central de Alertas
                  </span>
                  <span className="text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
                    {totalAlerts} pendente{totalAlerts !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                  {totalAlerts === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                      <p className="font-medium text-slate-600">Tudo em dia!</p>
                      <p className="text-[11px] mt-0.5">Nenhuma intimação sem ciência ou prazo crítico.</p>
                    </div>
                  ) : (
                    <>
                      {/* Seção: Intimações sem ciência */}
                      {publications.map((pub: any) => (
                        <div key={pub.id} className="p-3 hover:bg-slate-50 transition-colors text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                              <FileWarning className="h-3 w-3" /> Intimação {pub.court || 'DJE'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {pub.publication_date ? format(new Date(pub.publication_date), "dd/MM HH:mm", { locale: ptBR }) : ''}
                            </span>
                          </div>
                          
                          <p className="font-mono font-bold text-slate-800 text-[11px]">
                            {pub.process_number}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {pub.content}
                          </p>

                          <div className="pt-1 flex items-center justify-between">
                            <Link 
                              to="/publicacoes" 
                              onClick={() => setIsNotificationsOpen(false)}
                              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                            >
                              Abrir módulo →
                            </Link>
                            <button
                              type="button"
                              onClick={() => ackPubMutation.mutate(pub.id)}
                              disabled={ackPubMutation.isPending}
                              className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition"
                            >
                              Dar Ciência
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Seção: Prazos Próximos ou Vencidos */}
                      {tasks.map((task: any) => {
                        const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date());
                        return (
                          <Link
                            key={task.id}
                            to="/tarefas"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="block p-3 hover:bg-slate-50 transition-colors text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                                isOverdue 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                <Clock className="h-3 w-3" /> {isOverdue ? 'Prazo Vencido' : 'Prazo Próximo'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {task.due_date ? format(new Date(task.due_date), "dd/MM HH:mm", { locale: ptBR }) : ''}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                            {task.process?.number && (
                              <p className="font-mono text-[10px] text-slate-400">Autos: {task.process.number}</p>
                            )}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Rodapé do Dropdown */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <Link 
                    to="/publicacoes" 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                  >
                    <span>Todas intimações</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link 
                    to="/tarefas" 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                  >
                    <span>Agenda de prazos</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Perfil do Usuário */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Operador'}</p>
              <p className="text-[10px] text-slate-400 capitalize font-mono">{user?.role || 'Advogado'}</p>
            </div>
            <div className="w-7 h-7 bg-slate-800 text-slate-100 rounded-md flex items-center justify-center text-xs font-semibold shadow-2xs">
              {user?.name?.charAt(0) || 'D'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
