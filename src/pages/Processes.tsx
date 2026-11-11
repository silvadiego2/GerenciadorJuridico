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
  Layers,
  X,
  User,
  Calendar,
  Building2,
  FileText
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
  
  // Estado para controlar o modal de visualização de detalhes (ao clicar no olho)
  const [viewingProcess, setViewingProcess] = useState<any | null>(null);

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
    staleTime: 5 * 60 * 1000,
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
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'suspenso':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'arquivado':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'baixado':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case 'conhecimento':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'execução':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'recurso':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatNullableDate = (dateVal?: string | Date) => {
    if (!dateVal) return '-';
    try {
      if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
        const [year, month, day] = dateVal.slice(0, 10).split('-');
        return `${day}/${month}/${year}`;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      const userOffset = d.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(d.getTime() + userOffset);
      return format(adjustedDate, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return '-';
    }
  };

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Erro ao carregar processos: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Acervo Processual</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie seus processos judiciais, partes e andamentos</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportarPjeModalOpen(true)}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-2xs"
            title="Importar em lote através do Bookmarklet ou texto copiado do PJe"
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>Importar do PJe</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOabModalOpen(true)}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-2xs"
          >
            <DownloadCloud className="h-3.5 w-3.5 text-slate-500" />
            <span>Buscar por OAB</span>
          </button>

          <button 
            type="button"
            onClick={handleCreateProcess}
            className="bg-slate-900 text-white px-3.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Processo</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-2xs border border-slate-200 p-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Buscar por número CNJ, assunto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs focus:outline-hidden focus:border-slate-400"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
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
      <div className="bg-white rounded-lg shadow-2xs border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isLoading ? 'Carregando acervo...' : `${processes.length} processo${processes.length !== 1 ? 's' : ''} registrado${processes.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Carregando processos judiciais...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {processes.map((process: any) => {
              const displayClient = process.client?.name || process.plaintiff || 'Não vinculado';
              
              return (
                <div key={process.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-700">
                        <Scale className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {process.subject || process.title || 'Processo Judicial'}
                          </h3>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm ${getStatusColor(process.status)}`}>
                            {process.status ? process.status.toUpperCase() : 'ATIVO'}
                          </span>
                        </div>
                        
                        <p className="font-mono text-xs font-medium text-slate-700 mb-1">{process.number}</p>
                        
                        {/* Partes do Processo */}
                        <div className="text-xs text-slate-600 space-y-0.5 mb-2">
                          <p>
                            <strong className="text-slate-500 font-normal">Cliente / Interessado:</strong>{' '}
                            <span className="text-slate-900 font-medium">{displayClient}</span>
                          </p>
                          {process.defendant && process.defendant !== 'Não informado' && (
                            <p>
                              <strong className="text-slate-500 font-normal">Parte Ré / Promovido:</strong>{' '}
                              <span className="text-slate-800">{process.defendant}</span>
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          {process.class && <span><strong>Classe:</strong> {process.class}</span>}
                          {process.distributionDate && (
                            <span><strong>Distribuição:</strong> {formatNullableDate(process.distributionDate)}</span>
                          )}
                          {process.court && <span><strong>Vara/Tribunal:</strong> {process.court}</span>}
                          {process.phase && (
                            <span className={`px-1.5 py-0.2 rounded-sm border text-[10px] font-medium capitalize ${getPhaseColor(process.phase)}`}>
                              {process.phase}
                            </span>
                          )}
                        </div>
                        
                        {Boolean(process.value && Number(process.value) > 0) && (
                          <div className="flex items-center space-x-1 mt-2">
                            <DollarSign className="h-3 w-3 text-emerald-700" />
                            <span className="text-xs font-semibold font-mono text-emerald-800">
                              R$ {Number(process.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                      <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                        <p>Atualizado em</p>
                        <p className="font-medium text-slate-600">
                          {formatNullableDate(process.updatedAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setViewingProcess(process)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProcess(process)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar processo"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProcess(process.id, process.number)}
                          disabled={deleteProcessMutation.isPending}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
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
              );
            })}
            
            {processes.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800">Nenhum processo localizado</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Cadastre manualmente ou utilize a extensão no Projudi para sincronizar diretamente.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Processo (Ativado pelo botão do Olho) */}
      {viewingProcess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-slate-200/80 rounded-md flex items-center justify-center text-slate-700">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Registro Processual</h3>
                  <p className="font-mono text-xs text-slate-500">{viewingProcess.number}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingProcess(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">Assunto / Título</span>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">
                    {viewingProcess.subject || viewingProcess.title || 'Não informado'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">Status / Fase</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm border ${getStatusColor(viewingProcess.status)}`}>
                      {viewingProcess.status?.toUpperCase()}
                    </span>
                    <span className="text-slate-600 capitalize">
                      ({viewingProcess.phase || 'Fase não definida'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Partes do Processo */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Partes Processuais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-slate-200 bg-slate-50 rounded-md">
                    <div className="flex items-center space-x-1.5 text-slate-700 mb-1">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase">Promovente (Autor / Cliente)</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      {viewingProcess.client?.name || viewingProcess.plaintiff || 'Não informado'}
                    </p>
                    {viewingProcess.client?.document && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Doc: {viewingProcess.client.document}</p>
                    )}
                  </div>

                  <div className="p-3 border border-slate-200 bg-slate-50 rounded-md">
                    <div className="flex items-center space-x-1.5 text-slate-700 mb-1">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase">Promovido (Parte Ré)</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      {viewingProcess.defendant || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Judiciais */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dados da Ação</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border border-slate-200 p-3 rounded-md bg-slate-50">
                  <div>
                    <span className="text-slate-400 text-[11px]">Classe Processual</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {viewingProcess.class || 'Não informada'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Data de Distribuição</span>
                    <p className="font-mono text-slate-800 mt-0.5">
                      {formatNullableDate(viewingProcess.distributionDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Tribunal / Vara</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {viewingProcess.court || 'TJ-BA'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Valor da Causa</span>
                    <p className="font-mono font-medium text-emerald-800 mt-0.5">
                      {viewingProcess.value ? `R$ ${Number(viewingProcess.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não atribuído'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Cadastro</span>
                    <p className="text-slate-700 mt-0.5">
                      {formatNullableDate(viewingProcess.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Atualização</span>
                    <p className="text-slate-700 mt-0.5">
                      {formatNullableDate(viewingProcess.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingProcess(null)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
