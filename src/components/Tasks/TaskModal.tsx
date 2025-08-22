import React, { useState, useEffect } from 'react';
import { X, CheckSquare, User, Calendar, AlertTriangle, FileText, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Task, Client, Process, User as UserType } from '../../types';
import { clientsService, processesService, usersService } from '../../lib/api';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task | null;
  onSave: (taskData: Partial<Task>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    processId: '',
    clientId: '',
    assignedTo: '',
    priority: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
    status: 'pendente' as 'pendente' | 'em_andamento' | 'concluida' | 'cancelada',
    dueDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar dados para os dropdowns
  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getAll(),
  });

  const { data: processesData, isLoading: loadingProcesses } = useQuery({
    queryKey: ['processes'],
    queryFn: () => processesService.getAll(),
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });

  const clients = clientsData?.clients || [];
  const processes = processesData?.processes || [];
  const users = usersData || [];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        processId: task.processId || '',
        clientId: task.clientId || '',
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        dueDate: format(task.dueDate, 'yyyy-MM-dd\'T\'HH:mm'),
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Responsável é obrigatório';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const taskData = {
        ...formData,
        due_date: new Date(formData.dueDate).toISOString(),
        process_id: formData.processId || null,
        client_id: formData.clientId || null,
        assigned_to: formData.assignedTo,
      };
      onSave(taskData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600';
      case 'alta': return 'text-orange-600';
      case 'media': return 'text-yellow-600';
      case 'baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Tarefa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <div className="relative">
                  <CheckSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Apresentar contestação, Agendar audiência..."
                  />
                </div>
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descreva os detalhes da tarefa..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Relacionamentos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Relacionamentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processo (Opcional)
                </label>
                <select
                  value={formData.processId}
                  onChange={(e) => handleChange('processId', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingProcesses}
                >
                  <option value="">Selecione um processo</option>
                  {processes.map((process: Process) => (
                    <option key={process.id} value={process.id}>
                      {process.number} - {process.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente (Opcional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingClients}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client: Client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => handleChange('assignedTo', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.assignedTo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loadingUsers}
                  >
                    <option value="">Selecione um responsável</option>
                    {users.filter((user: UserType) => ['admin', 'advogado', 'estagiario'].includes(user.role)).map((user: UserType) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.assignedTo && <p className="text-red-600 text-sm mt-1">{errors.assignedTo}</p>}
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade *
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div className="mt-1 flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    formData.priority === 'urgente' ? 'bg-red-500' :
                    formData.priority === 'alta' ? 'bg-orange-500' :
                    formData.priority === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className={`text-xs ${getPriorityColor(formData.priority)}`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {formData.dueDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Prazo: {format(new Date(formData.dueDate), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                {new Date(formData.dueDate) < new Date() ? 
                  'Atenção: Esta data já passou!' : 
                  `Faltam ${Math.ceil((new Date(formData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias`
                }
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingClients || loadingProcesses || loadingUsers}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Salvando...' : (task ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;