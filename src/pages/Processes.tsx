import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Loader2, 
  DownloadCloud, 
  Layers,
  X,
  User,
  Calendar,
  Building2,
  FileText,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processesService } from '../lib/api';
import { Process } from '../types';
import ProcessModal from '../components/Processes/ProcessModal';
import { ImportOabModal } from '../components/Processes/ImportOabModal';
import { ModalImportarProcessos } from '../components/ModalImportarProcessos';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Processes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOabModalOpen, setIsOabModalOpen] = useState(false);
  const [isImportarPjeModalOpen, setIsImportarPjeModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [viewingProcess, setViewingProcess] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

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
      success('Sucesso', 'Processo cadastrado com sucesso');
      setIsModalOpen(false);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao cadastrar processo')
  });

  const updateProcessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Process> }) =>
      processesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo atualizado com sucesso');
      setIsModalOpen(false);
      setEditingProcess(null);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao atualizar processo')
  });

  const deleteProcessMutation = useMutation({
    mutationFn: processesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      success('Sucesso', 'Processo removido');
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao excluir processo')
  });

  const handleEditProcess = (p: Process) => {
    setEditingProcess(p);
    setIsModalOpen(true);
  };

  const handleDeleteProcess = (id: string, num: string) => {
    if (window.confirm(`Excluir permanentemente o processo ${num}?`)) {
      deleteProcessMutation.mutate(id);
    }
  };

  const handleSaveProcess = (data: Partial<Process>) => {
    if (editingProcess) {
      updateProcessMutation.mutate({ id: editingProcess.id, data });
    } else {
      createProcessMutation.mutate(data);
    }
  };

  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return '-';
    try {
      const str = String(dateVal);
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const [year, month, day] = str.slice(0, 10).split('-');
        return `${day}/${month}/${year}`;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'suspenso':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'arquivado':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'baixado':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Acervo Processual</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestão de autos, movimentações e partes cadastradas</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportarPjeModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Importar do</span> PJe / Projudi
          </button>

          <button
            type="button"
            onClick={() => setIsOabModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <DownloadCloud className="h-3.5 w-3.5 text-slate-500" />
            <span>Busca OAB</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditingProcess(null); setIsModalOpen(true); }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Processo</span>
          </button>
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por número CNJ, autor, réu ou assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400 transition-colors"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="suspenso">Suspenso</option>
          <option value="arquivado">Arquivado</option>
          <option value="baixado">Baixado</option>
        </select>
      </div>

      {/* Conteúdo: Tabela no Desktop, Cards no Mobile */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-600" />
            Carregando acervo...
          </div>
        ) : processes.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Nenhum processo localizado</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Utilize a extensão no tribunal ou cadastre manualmente.</p>
          </div>
        ) : (
          <>
            {/* 1. VISÃO DESKTOP (Tabela de Alta Densidade) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50/75 text-slate-500 font-semibold text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Processo / CNJ</th>
                    <th className="py-2.5 px-3">Autor (Cliente)</th>
                    <th className="py-2.5 px-3">Réu (Promovido)</th>
                    <th className="py-2.5 px-3">Vara / Tribunal</th>
                    <th className="py-2.5 px-3">Distribuição</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {processes.map((proc: any) => {
                    const clientName = proc.client?.name || proc.plaintiff || 'Não vinculado';
                    return (
                      <tr key={proc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-mono font-medium text-slate-900 text-xs">{proc.number}</p>
                          <span className="text-[10px] text-slate-400 truncate max-w-[200px] block" title={proc.class}>
                            {proc.class || proc.subject || 'Procedimento Comum'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-[180px]">
                          {clientName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">
                          {proc.defendant || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {proc.court || 'TJ-BA'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {formatDate(proc.distributionDate || proc.distribution_date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm capitalize ${getStatusBadge(proc.status)}`}>
                            {proc.status || 'Ativo'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingProcess(proc)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Visualizar Detalhes"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditProcess(proc)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProcess(proc.id, proc.number)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. VISÃO MOBILE / TABLET (Cards Verticais) */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {processes.map((proc: any) => {
                const clientName = proc.client?.name || proc.plaintiff || 'Não vinculado';
                return (
                  <div key={proc.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs font-semibold text-slate-900">{proc.number}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{proc.class || 'Procedimento Judicial'}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm capitalize ${getStatusBadge(proc.status)}`}>
                        {proc.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Autor:</span>
                        <span className="font-medium text-slate-800">{clientName}</span>
                      </div>
                      {proc.defendant && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[11px]">Réu:</span>
                          <span className="text-slate-700 truncate max-w-[200px]">{proc.defendant}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Distr: {formatDate(proc.distributionDate || proc.distribution_date)}</span>
                        <span>{proc.court || 'TJ-BA'}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setViewingProcess(proc)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detalhes
                      </button>
                      <button
                        onClick={() => handleEditProcess(proc)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes Sóbrio */}
      {viewingProcess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Registro Processual</span>
                <h3 className="font-mono text-sm font-bold text-slate-900">{viewingProcess.number}</h3>
              </div>
              <button 
                onClick={() => setViewingProcess(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Autor / Promovente</span>
                  <p className="font-semibold text-slate-800">{viewingProcess.client?.name || viewingProcess.plaintiff || 'Não informado'}</p>
                </div>
                <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Réu / Promovido</span>
                  <p className="font-semibold text-slate-800">{viewingProcess.defendant || 'Não informado'}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
                <div className="px-3.5 py-2.5 flex justify-between">
                  <span className="text-slate-500">Classe</span>
                  <span className="font-medium text-slate-800 text-right">{viewingProcess.class || '-'}</span>
                </div>
                <div className="px-3.5 py-2.5 flex justify-between">
                  <span className="text-slate-500">Data de Distribuição</span>
                  <span className="font-mono text-slate-800">{formatDate(viewingProcess.distributionDate || viewingProcess.distribution_date)}</span>
                </div>
                <div className="px-3.5 py-2.5 flex justify-between">
                  <span className="text-slate-500">Vara / Comarca</span>
                  <span className="text-slate-800">{viewingProcess.court || 'TJ-BA'}</span>
                </div>
                <div className="px-3.5 py-2.5 flex justify-between">
                  <span className="text-slate-500">Status / Fase</span>
                  <span className="capitalize font-medium text-slate-800">{viewingProcess.status} ({viewingProcess.phase || 'conhecimento'})</span>
                </div>
                {Boolean(viewingProcess.value && Number(viewingProcess.value) > 0) && (
                  <div className="px-3.5 py-2.5 flex justify-between">
                    <span className="text-slate-500">Valor da Causa</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      R$ {Number(viewingProcess.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingProcess(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Edição e Importação */}
      {isModalOpen && (
        <ProcessModal
          process={editingProcess}
          onSave={handleSaveProcess}
          onClose={() => { setIsModalOpen(false); setEditingProcess(null); }}
          isLoading={createProcessMutation.isPending || updateProcessMutation.isPending}
        />
      )}

      <ImportOabModal
        isOpen={isOabModalOpen}
        onClose={() => setIsOabModalOpen(false)}
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['processes'] }); }}
      />

      <ModalImportarProcessos
        isOpen={isImportarPjeModalOpen}
        onClose={() => setIsImportarPjeModalOpen(false)}
        onSucesso={() => { queryClient.invalidateQueries({ queryKey: ['processes'] }); }}
      />
    </div>
  );
};

export default Processes;
