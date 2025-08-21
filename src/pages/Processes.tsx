import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Scale, Clock, DollarSign, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processesService } from '../lib/api';
import { Process } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProcessModal from '../components/Processes/ProcessModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Processes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativo' | 'suspenso' | 'arquivado' | 'baixado'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query para buscar processos
  const { data: processesData, isLoading, error: queryError } = useQuery({
    queryKey: ['processes', debouncedSearchTerm, selectedStatus],
    queryFn: () => processesService.getAll({
      search: debouncedSearchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const processes = processesData?.processes || [];

  // Mutation para criar processo
  const createProcessMutation = useMutation({
    mutationFn: processesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo criado com sucesso!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao criar processo');
    },
  });

  // Mutation para atualizar processo
  const updateProcessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Process> }) =>
      processesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingProcess(null);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao atualizar processo');
    },
  });

  // Mutation para deletar processo
  const deleteProcessMutation = useMutation({
    mutationFn: processesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo excluído com sucesso!');
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao excluir processo');
    },
  });

  const handleCreateProcess = () => {
    setEditingProcess(null);
    setIsModalOpen(true);
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  const handleDeleteProcess = (processId: string, processNumber: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o processo "${processNumber}"?`)) {
      deleteProcessMutation.mutate(processId);
    }
  };

  const handleSaveProcess = (processData: Partial<Process>) => {
    if (editingProcess) {
      updateProcessMutation.mutate({ id: editingProcess.id, data: processData });
    } else {
      createProcessMutation.mutate(processData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800';
      case 'arquivado':
        return 'bg-gray-100 text-gray-800';
      case 'baixado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case 'conhecimento':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'execução':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'recurso':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (queryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar processos: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          <p className="text-gray-600">Gerencie seus processos judiciais</p>
        </div>
        <button 
          onClick={handleCreateProcess}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Processo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por número, assunto ou cliente..."
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
            <option value="ativo">Ativo</option>
            <option value="suspenso">Suspenso</option>
            <option value="arquivado">Arquivado</option>
            <option value="baixado">Baixado</option>
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Carregando...' : `${processes.length} processo${processes.length !== 1 ? 's' : ''} encontrado${processes.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando processos...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {processes.map((process) => (
              <div key={process.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Scale className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {process.subject}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(process.status)}`}>
                          {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="font-mono text-sm text-gray-600 mb-1">{process.number}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Cliente:</strong> {process.client?.name || 'Cliente não encontrado'}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {process.class && <span><strong>Classe:</strong> {process.class}</span>}
                        {process.court && <span><strong>Vara:</strong> {process.court}</span>}
                        {process.phase && (
                          <span className={`px-2 py-1 rounded-md border text-xs ${getPhaseColor(process.phase)}`}>
                            {process.phase}
                          </span>
                        )}
                      </div>
                      
                      {process.value && (
                        <div className="flex items-center space-x-1 mt-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            R$ {process.value.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right text-sm text-gray-600 hidden sm:block">
                      <p>Atualizado em</p>
                      <p className="font-medium">
                        {format(new Date(process.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProcess(process)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProcess(process.id, process.number)}
                        disabled={deleteProcessMutation.isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleteProcessMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Estatísticas do Processo */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Andamentos</p>
                    <p className="text-lg font-semibold text-gray-900">0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tarefas</p>
                    <p className="text-lg font-semibold text-gray-900">0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Documentos</p>
                    <p className="text-lg font-semibold text-gray-900">0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Dias ativo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.floor((new Date().getTime() - new Date(process.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {processes.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhum processo encontrado com os filtros aplicados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Processo */}
      {isModalOpen && (
        <ProcessModal
          process={editingProcess}
          onSave={handleSaveProcess}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProcess(null);
          }}
          isLoading={createProcessMutation.isPending || updateProcessMutation.isPending}
        />
      )}
    </div>
  );
};

export default Processes;