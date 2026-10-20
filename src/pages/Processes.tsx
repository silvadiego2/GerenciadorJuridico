// src/pages/Processes.tsx
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Scale, 
  Clock, 
  DollarSign, 
  Trash2, 
  Loader2, 
  DownloadCloud, 
  Layers 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processesService } from '../lib/api';
import { Process } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProcessModal from '../components/Processes/ProcessModal';
import { ImportOabModal } from '../components/Processes/ImportOabModal';
import { ModalImportarProcessos } from '../components/ModalImportarProcessos';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Processes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativo' | 'suspenso' | 'arquivado' | 'baixado'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOabModalOpen, setIsOabModalOpen] = useState(false);
  const [isImportarPjeModalOpen, setIsImportarPjeModalOpen] = useState(false);
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

  const handleOabImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['processes'] });
    success('Sucesso', 'Processos importados com sucesso!');
  };

  const handlePjeImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['processes'] });
    success('Sucesso', 'Processos do PJe/Tribunal importados com sucesso!');
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Processos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus processos judiciais e acompanhe andamentos</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Novo: Importar do PJe / Tribunais */}
          <button
            type="button"
            onClick={() => setIsImportarPjeModalOpen(true)}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold shadow-xs"
            title="Importar em lote através do Bookmarklet ou texto copiado do PJe"
          >
            <Layers className="h-4 w-4 text-blue-600" />
            <span>Importar do PJe</span>
          </button>

          {/* Botão Buscar por OAB */}
          <button
            type="button"
            onClick={() => setIsOabModalOpen(true)}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold shadow-xs"
          >
            <DownloadCloud className="h-4 w-4" />
            <span>Buscar por OAB</span>
          </button>

          {/* Botão Novo Processo Manual */}
          <button 
            type="button"
            onClick={handleCreateProcess}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Processo</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por número CNJ, assunto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-gray-800">
            {isLoading ? 'Carregando acervo...' : `${processes.length} processo${processes.length !== 1 ? 's' : ''} encontrado${processes.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Carregando processos judiciais...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {processes.map((process) => (
              <div key={process.id} className="p-5 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scale className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2.5 mb-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {process.subject || process.title || 'Processo Judicial'}
                        </h3>
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${getStatusColor(process.status)}`}>
                          {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="font-mono text-xs font-semibold text-gray-700 mb-1">{process.number}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Cliente / Interessado:</strong> {process.client?.name || 'Não vinculado'}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-600">
                        {process.class && <span><strong>Classe:</strong> {process.class}</span>}
                        {process.court && <span><strong>Vara:</strong> {process.court}</span>}
                        {process.phase && (
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${getPhaseColor(process.phase)}`}>
                            {process.phase}
                          </span>
                        )}
                      </div>
                      
                      {process.value && (
                        <div className="flex items-center space-x-1 mt-2">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">
                            R$ {process.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                    <div className="text-right text-xs text-gray-500 hidden sm:block">
                      <p>Atualizado em</p>
                      <p className="font-semibold text-gray-700">
                        {process.updatedAt ? format(new Date(process.updatedAt), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProcess(process)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar processo"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProcess(process.id, process.number)}
                        disabled={deleteProcessMutation.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir processo"
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
              </div>
            ))}
            
            {processes.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Nenhum processo localizado</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Você pode cadastrar manualmente ou clicar em <strong>"Importar do PJe"</strong> para puxar seu acervo com o Bookmarklet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Processo (Manual) */}
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

      {/* Modal de Busca por OAB */}
      <ImportOabModal
        isOpen={isOabModalOpen}
        onClose={() => setIsOabModalOpen(false)}
        onSuccess={handleOabImportSuccess}
      />

      {/* Modal de Importação em Lote do PJe / Bookmarklet */}
      <ModalImportarProcessos
        isOpen={isImportarPjeModalOpen}
        onClose={() => setIsImportarPjeModalOpen(false)}
        onSucesso={handlePjeImportSuccess}
      />
    </div>
  );
};

export default Processes;
