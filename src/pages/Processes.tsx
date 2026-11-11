// src/pages/Processes.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Scale, 
  DollarSign, 
  Trash2, 
  Loader2, 
  DownloadCloud, 
  Layers,
  ChevronDown,
  Globe
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processesService } from '../lib/api';
import { Process } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProcessModal from '../components/Processes/ProcessModal';
import { ProcessDetailsModal } from '../components/Processes/ProcessDetailsModal';
import { ImportOabModal } from '../components/Processes/ImportOabModal';
import { ModalImportarProcessos } from '../components/ModalImportarProcessos';
import { ConsultaProcessosOAB } from '../components/ConsultaProcessosOAB';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Processes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativo' | 'suspenso' | 'arquivado' | 'baixado'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOabModalOpen, setIsOabModalOpen] = useState(false);
  const [isImportarPjeModalOpen, setIsImportarPjeModalOpen] = useState(false);
  const [isCentralOabAberta, setIsCentralOabAberta] = useState(false);
  const [menuImportarAberto, setMenuImportarAberto] = useState(false);
  
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [viewingProcess, setViewingProcess] = useState<any | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fecha o menu de importação ao clicar fora
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuImportarAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const { data: processesData, isLoading, error: queryError } = useQuery({
    queryKey: ['processes', debouncedSearchTerm, selectedStatus],
    queryFn: () => processesService.getAll({
      search: debouncedSearchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const processes = processesData?.processes || [];

  const createProcessMutation = useMutation({
    mutationFn: processesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo registado com sucesso!');
      setIsModalOpen(false);
    },
    onError: (err: any) => error('Erro', err.message || 'Erro ao criar processo')
  });

  const updateProcessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Process> }) =>
      processesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingProcess(null);
    },
    onError: (err: any) => error('Erro', err.message || 'Erro ao atualizar processo')
  });

  const deleteProcessMutation = useMutation({
    mutationFn: processesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo eliminado com sucesso!');
    },
    onError: (err: any) => error('Erro', err.message || 'Erro ao eliminar processo')
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
    if (window.confirm(`Tem a certeza de que deseja eliminar o processo "${processNumber}"?`)) {
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
          <p className="text-xs text-slate-500 mt-0.5">Gestão centralizada de autos, partes e movimentações judiciais</p>
        </div>

        {/* Botões de Ação Unificados */}
        <div className="flex items-center gap-2">
          {/* Dropdown de Captura / Importação */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuImportarAberto(!menuImportarAberto)}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-2xs"
            >
              <DownloadCloud className="h-3.5 w-3.5 text-slate-500" />
              <span>Importar / Capturar</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </button>

            {menuImportarAberto && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-30 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuImportarAberto(false);
                    setIsImportarPjeModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                >
                  <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Lote PJe / Projudi</p>
                    <span className="text-[10px] text-slate-400 block">Via texto colado ou extensão</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuImportarAberto(false);
                    setIsCentralOabAberta(true);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 border-t border-slate-100"
                >
                  <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Central OAB & Tribunais</p>
                    <span className="text-[10px] text-slate-400 block">Consulta online oficial por OAB</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuImportarAberto(false);
                    setIsOabModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 border-t border-slate-100"
                >
                  <DownloadCloud className="h-4 w-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Importação por API</p>
                    <span className="text-[10px] text-slate-400 block">Busca rápida via Conector</span>
                  </div>
                </button>
              </div>
            )}
          </div>

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
              placeholder="Pesquisar por número CNJ, assunto ou cliente..."
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
            <option value="all">Todos os estados</option>
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
            {isLoading ? 'A carregar acervo...' : `${processes.length} processo${processes.length !== 1 ? 's' : ''} registado${processes.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">A carregar processos judiciais...</p>
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
                          <span className="px-2 py-0.5 text-[10px] font-semibold border rounded-sm uppercase bg-emerald-50 text-emerald-800 border-emerald-200">
                            {process.status ? process.status.toUpperCase() : 'ATIVO'}
                          </span>
                        </div>
                        
                        <p className="font-mono text-xs font-medium text-slate-700 mb-1">{process.number}</p>
                        
                        <div className="text-xs text-slate-600 space-y-0.5 mb-2">
                          <p>
                            <strong className="text-slate-500 font-normal">Cliente:</strong>{' '}
                            <span className="text-slate-900 font-medium">{displayClient}</span>
                          </p>
                          {process.defendant && process.defendant !== 'Não informado' && (
                            <p>
                              <strong className="text-slate-500 font-normal">Parte Ré:</strong>{' '}
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
                        </div>
                        
                        {Boolean(process.value && Number(process.value) > 0) && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
      R$ {Number(process.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                      <button 
                        onClick={() => setViewingProcess(process)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Visualizar Ficha Completa do Processo"
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
                        title="Eliminar processo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                  Registe manualmente ou utilize a central de importação acima.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ficha Completa do Processo com Abas */}
      {viewingProcess && (
        <ProcessDetailsModal
          process={viewingProcess}
          onClose={() => setViewingProcess(null)}
          onEdit={(proc) => handleEditProcess(proc)}
        />
      )}

      {/* Modal da Central OAB Integrada */}
      {isCentralOabAberta && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-100 w-full max-w-5xl rounded-xl border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh] p-4 relative">
            <button
              onClick={() => setIsCentralOabAberta(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-md shadow-2xs z-10"
            >
              ✕ Fechar
            </button>
            <ConsultaProcessosOAB />
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição Manual */}
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

      {/* Modais de Importação */}
      <ImportOabModal
        isOpen={isOabModalOpen}
        onClose={() => setIsOabModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['processes'] })}
      />

      <ModalImportarProcessos
        isOpen={isImportarPjeModalOpen}
        onClose={() => setIsImportarPjeModalOpen(false)}
        onSucesso={() => queryClient.invalidateQueries({ queryKey: ['processes'] })}
      />
    </div>
  );
};

export default Processes;
