import React, { useState } from 'react';
import { Plus, Search, CheckSquare, Clock, AlertTriangle, User, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../lib/api';
import { Task } from '../types';
import { format, isAfter, isBefore, addDays } from 'date-fns';
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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query para buscar tarefas
  const { data: tasksData, isLoading, error: queryError } = useQuery({
    queryKey: ['tasks', debouncedSearchTerm, selectedStatus, selectedPriority],
    queryFn: () => tasksService.getAll({
      search: debouncedSearchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const tasks = tasksData?.tasks || [];

  // Mutation para criar tarefa
  const createTaskMutation = useMutation({
    mutationFn: tasksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Tarefa criada com sucesso!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao criar tarefa');
    },
  });

  // Mutation para atualizar tarefa
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Tarefa atualizada com sucesso!');
      setIsModalOpen(false);
      setEditingTask(null);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao atualizar tarefa');
    },
  });

  // Mutation para deletar tarefa
  const deleteTaskMutation = useMutation({
    mutationFn: tasksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Tarefa excluída com sucesso!');
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao excluir tarefa');
    },
  });

  // Mutation para concluir tarefa
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      tasksService.update(taskId, { 
        status: 'concluida',
        completed_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success('Sucesso', 'Tarefa concluída!');
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao concluir tarefa');
    },
  });

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}"?`)) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'alta':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'media':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'baixa':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTaskUrgency = (task: Task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (isBefore(dueDate, now)) {
      return { type: 'overdue', label: 'Vencida', color: 'text-red-600' };
    } else if (isBefore(dueDate, addDays(now, 3))) {
      return { type: 'urgent', label: 'Vence em breve', color: 'text-orange-600' };
    } else {
      return { type: 'normal', label: 'No prazo', color: 'text-green-600' };
    }
  };

  if (queryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar tarefas: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600">Gerencie suas tarefas e prazos</p>
        </div>
        <button 
          onClick={handleCreateTask}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Carregando...' : `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''} encontrada${tasks.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando tarefas...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => {
              const urgency = getTaskUrgency(task);
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-md border text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Vence em {format(new Date(task.dueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            <span className={`ml-2 font-medium ${urgency.color}`}>
                              ({urgency.label})
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {task.assigned_user && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{task.assigned_user.name}</span>
                            </div>
                          )}
                          
                          {task.process && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Processo:</span>
                              <span className="font-mono text-xs">{task.process.number}</span>
                            </div>
                          )}
                          
                          {task.client && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Cliente:</span>
                              <span>{task.client.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {task.status !== 'concluida' && task.status !== 'cancelada' && (
                        <button 
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completeTaskMutation.isPending}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                        >
                          {completeTaskMutation.isPending ? 'Concluindo...' : 'Concluir'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        disabled={deleteTaskMutation.isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleteTaskMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Informações Adicionais */}
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Criada em {format(new Date(task.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      {task.completedAt && (
                        <>
                          <span>•</span>
                          <span>
                            Concluída em {format(new Date(task.completedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {tasks.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhuma tarefa encontrada com os filtros aplicados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Tarefa */}
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