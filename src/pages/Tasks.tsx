// src/pages/Tasks.tsx
import React, { useState } from 'react';
import { 
  Plus, Search, CheckSquare, Clock, AlertTriangle, User, 
  Edit2, Trash2, Loader2, Calendar, CheckCircle2, Scale
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../lib/api';
import { Task } from '../types';
import { format, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TaskModal from '../components/Tasks/TaskModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'baixa' | 'media' | 'alta' | 'urgente'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const { data: tasksData, isLoading, error: queryError } = useQuery({
    queryKey: ['tasks', debouncedSearchTerm, selectedStatus, selectedPriority],
    queryFn: () => tasksService.getAll({
      search: debouncedSearchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const tasks = tasksData?.tasks || [];

  const createTaskMutation = useMutation({
    mutationFn: tasksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Prazo/tarefa cadastrado com sucesso');
      setIsModalOpen(false);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao cadastrar tarefa')
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Tarefa atualizada');
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao atualizar tarefa')
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Tarefa excluída');
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao excluir tarefa')
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      tasksService.update(taskId, { 
        status: 'concluida',
        completed_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Prazo cumprido com sucesso!');
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao concluir')
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (window.confirm(`Excluir permanentemente o prazo "${taskTitle}"?`)) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'em_andamento': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'concluida': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelada': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'alta': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'media': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'baixa': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTaskUrgency = (task: Task) => {
    if (!task.dueDate) return null;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (isBefore(dueDate, now) && task.status !== 'concluida') {
      return { label: 'Prazo Vencido', color: 'text-rose-600 font-semibold' };
    } else if (isBefore(dueDate, addDays(now, 3)) && task.status !== 'concluida') {
      return { label: 'Vence em breve', color: 'text-amber-600 font-medium' };
    }
    return { label: 'No prazo', color: 'text-slate-500' };
  };

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-800">
          Erro ao carregar prazos: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Tarefas e Prazos</h1>
          <p className="text-xs text-slate-500 mt-0.5">Acompanhamento de prazos fatais, audiências e diligências</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Prazo</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descrição, processo ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
        >
          <option value="all">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as any)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
        >
          <option value="all">Todas as prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isLoading ? 'Carregando tarefas...' : `${tasks.length} prazo${tasks.length !== 1 ? 's' : ''} registrado${tasks.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 mx-auto mb-2" />
            Carregando agenda...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">Nenhum prazo pendente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task: any) => {
              const urgency = getTaskUrgency(task);
              const isDone = task.status === 'concluida';

              return (
                <div key={task.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm capitalize ${getStatusBadge(task.status)}`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm capitalize ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Vencimento: {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}</span>
                          {urgency && <span className={`ml-1 ${urgency.color}`}>({urgency.label})</span>}
                        </div>

                        {task.process?.number && (
                          <div className="flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-mono text-slate-700">{task.process.number}</span>
                          </div>
                        )}

                        {task.assignedUser?.name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>{task.assignedUser.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:self-center shrink-0">
                      {!isDone && (
                        <button
                          onClick={() => completeTaskMutation.mutate(task.id)}
                          disabled={completeTaskMutation.isPending}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Concluir</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      )}
    </div>
  );
};

export default Tasks;
