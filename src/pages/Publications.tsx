// src/pages/Publications.tsx
import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, Eye, CheckCircle, Clock, 
  AlertTriangle, Bell, Calendar, User,
  ExternalLink, RefreshCw, Loader2, Scale
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsService } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Publications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'nao_lida' | 'lida' | 'nao_ciente' | 'ciente'>('all');
  const [viewingPub, setViewingPub] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const { data: publicationsData, isLoading, isFetching, error: queryError } = useQuery({
    queryKey: ['publications', debouncedSearchTerm, selectedStatus],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedStatus === 'nao_lida') params.read = 'false';
      else if (selectedStatus === 'lida') params.read = 'true';
      else if (selectedStatus === 'nao_ciente') params.acknowledged = 'false';
      else if (selectedStatus === 'ciente') params.acknowledged = 'true';
      return publicationsService.getAll(params);
    },
    staleTime: 2 * 60 * 1000,
  });

  const publications = publicationsData?.publications || [];

  const acknowledgeMutation = useMutation({
    mutationFn: publicationsService.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      success('Sucesso', 'Ciência processual registrada');
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao registrar ciência')
  });

  const markAsReadMutation = useMutation({
    mutationFn: publicationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    }
  });

  const handleOpenPub = (pub: any) => {
    setViewingPub(pub);
    if (!pub.read) {
      markAsReadMutation.mutate(pub.id);
    }
  };

  const unreadCount = publications.filter(p => !p.read).length;
  const unacknowledgedCount = publications.filter(p => !p.acknowledged).length;

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-800">
          Erro ao carregar publicações: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Publicações e Intimações</h1>
          <p className="text-xs text-slate-500 mt-0.5">Leitura automática de diários oficiais e e-mails processuais</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['publications'] })}
            disabled={isFetching}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Indicadores Compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Recebidas</span>
          <p className="mt-1 text-xl font-bold font-mono text-slate-900">{publications.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Não Lidas</span>
          <p className={`mt-1 text-xl font-bold font-mono ${unreadCount > 0 ? 'text-sky-700' : 'text-slate-900'}`}>{unreadCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Aguardando Ciência</span>
          <p className={`mt-1 text-xl font-bold font-mono ${unacknowledgedCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{unacknowledgedCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Origem do Monitoramento</span>
          <p className="mt-1 text-xs font-medium text-slate-700">Gmail Script / Projudi</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por teor da publicação ou número de processo..."
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
          <option value="nao_lida">Não lidas</option>
          <option value="lida">Lidas</option>
          <option value="nao_ciente">Sem ciência</option>
          <option value="ciente">Com ciência</option>
        </select>
      </div>

      {/* Lista de Publicações */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 mx-auto mb-2" />
            Carregando publicações...
          </div>
        ) : publications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">Nenhuma publicação registrada</p>
            <p className="text-[11px] text-slate-400 mt-0.5">As notificações do tribunal recebidas por e-mail aparecerão aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {publications.map((pub: any) => {
              const numProcesso = pub.process_number || pub.process?.number || 'Processo não identificado';
              const dataPub = pub.publication_date || pub.date || pub.created_at;

              return (
                <div 
                  key={pub.id}
                  onClick={() => handleOpenPub(pub)}
                  className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    !pub.read ? 'bg-sky-50/40 border-l-2 border-l-sky-600' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {numProcesso}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {pub.court || 'TJ-BA'}
                        </span>
                        {!pub.acknowledged ? (
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Sem ciência
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Ciência registrada
                          </span>
                        )}
                        {!pub.read && (
                          <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded">
                            Nova
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                        {pub.content}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Publicado em: {dataPub ? format(new Date(dataPub), "dd/MM/yyyy", { locale: ptBR }) : '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {!pub.acknowledged && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeMutation.mutate(pub.id);
                          }}
                          disabled={acknowledgeMutation.isPending}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                        >
                          Dar Ciência
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPub(pub);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                        title="Ver conteúdo completo"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Leitura Integral do Despacho/Publicação */}
      {viewingPub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Intimação Judicial</span>
                <p className="font-mono text-xs font-bold text-slate-900">{viewingPub.process_number || 'Sem autos vinculados'}</p>
              </div>
              <button 
                onClick={() => setViewingPub(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 space-y-1">
                <p><strong>Tribunal / Diário:</strong> {viewingPub.court || 'TJ-BA'}</p>
                <p><strong>Data de Notificação:</strong> {viewingPub.publication_date ? format(new Date(viewingPub.publication_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}</p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Teor do Despacho / Publicação</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingPub.content}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div>
                {!viewingPub.acknowledged && (
                  <button
                    onClick={() => {
                      acknowledgeMutation.mutate(viewingPub.id);
                      setViewingPub({ ...viewingPub, acknowledged: true });
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                  >
                    Registrar Ciência
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewingPub(null)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-700 rounded bg-white hover:bg-slate-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publications;
