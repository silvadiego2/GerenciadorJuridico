// src/components/Tasks/TaskModal.tsx
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
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        processId: '',
        clientId: '',
        assignedTo: '',
        priority: 'media',
        status: 'pendente',
        dueDate: '',
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
        dueDate: new Date(formData.dueDate).toISOString(),
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {task ? 'Editar Prazo / Tarefa' : 'Novo Prazo Processual'}
              </h2>
              <p className="text-[11px] text-slate-400">Atribua prazos fatais, audiências ou diligências forenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário com rolagem */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Identificação */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Título do Prazo / Tarefa *
              </label>
              <div className="relative">
                <CheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs focus:outline-hidden focus:border-slate-400 ${
                    errors.title ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                  }`}
                  placeholder="Ex: Apresentar Réplica, Audiência de Instrução, Agravo de Instrumento..."
                />
              </div>
              {errors.title && <p className="text-rose-600 text-[11px] mt-0.5">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Orientações / Descrição
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-slate-400 h-3.5 w-3.5" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400 resize-none"
                  placeholder="Instruções ou apontamentos sobre o cumprimento do prazo..."
                />
              </div>
            </div>
          </div>

          {/* Vinculação Processual */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Vínculo & Responsabilidade
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Autos Vinculados (Opcional)
                </label>
                <select
                  value={formData.processId}
                  onChange={(e) => handleChange('processId', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400 font-mono"
                  disabled={loadingProcesses}
                >
                  <option value="">Nenhum processo vinculado</option>
                  {processes.map((p: Process) => (
                    <option key={p.id} value={p.id}>
                      {p.number} - {p.subject?.slice(0, 30)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Cliente (Opcional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                  disabled={loadingClients}
                >
                  <option value="">Nenhum cliente vinculado</option>
                  {clients.map((c: Client) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Responsável pelo Cumprimento *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => handleChange('assignedTo', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400 ${
                      errors.assignedTo ? 'border-rose-300' : 'border-slate-200'
                    }`}
                    disabled={loadingUsers}
                  >
                    <option value="">Selecione o advogado ou operador</option>
                    {users.map((u: UserType) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.assignedTo && <p className="text-rose-600 text-[11px] mt-0.5">{errors.assignedTo}</p>}
              </div>
            </div>
          </div>

          {/* Vencimento e Prioridade */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Vencimento & Gravidade
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Prioridade Forense
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value as any)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente (Fatal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as any)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Data e Hora Fatal *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.dueDate ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.dueDate && <p className="text-rose-600 text-[11px] mt-0.5">{errors.dueDate}</p>}
              </div>
            </div>
          </div>

          {/* Lembrete de Prazo */}
          {formData.dueDate && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 flex items-center gap-2 text-[11px] text-slate-600 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                Termo fatal: {format(new Date(formData.dueDate), "dd/MM/yyyy 'às' HH:mm")}
              </span>
            </div>
          )}

          {/* Rodapé fixo */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingClients || loadingProcesses || loadingUsers}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium shadow-2xs"
            >
              {isLoading ? 'Salvando...' : (task ? 'Salvar Alterações' : 'Agendar Prazo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
