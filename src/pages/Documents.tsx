// src/pages/Documents.tsx
import React, { useState } from 'react';
import { 
  Upload, Search, File, Folder, Download, Share2, 
  Trash2, Eye, ChevronRight, Loader2, Scale, User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DocumentModal from '../components/Documents/DocumentModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const { data: documentsData, isLoading, error: queryError } = useQuery({
    queryKey: ['documents', debouncedSearchTerm, selectedFolder],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedFolder) params.folder_id = selectedFolder;
      return documentsService.getAll(params);
    },
    staleTime: 5 * 60 * 1000,
  });

  const documents = documentsData?.documents || [];

  const folders = [
    { id: 'folder1', name: 'Contratos e Procurações', count: 4 },
    { id: 'folder2', name: 'Petições Iniciais', count: 6 },
    { id: 'folder3', name: 'Documentos Probatórios', count: 9 },
  ];

  const createDocumentMutation = useMutation({
    mutationFn: documentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Sucesso', 'Documento anexado com sucesso');
      setIsModalOpen(false);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao anexar documento')
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-800">
          Erro ao carregar documentos: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Repositório de Documentos</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestão centralizada de petições, procurações e peças processuais</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload de Peça</span>
          </button>
        </div>
      </div>

      {/* Pastas Rápidas */}
      {!selectedFolder && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-left transition-colors shadow-2xs flex items-center gap-3"
            >
              <div className="p-2 rounded bg-slate-50 text-slate-700 border border-slate-200">
                <Folder className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{f.name}</p>
                <span className="text-[10px] text-slate-400 font-mono">{f.count} itens arquivados</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedFolder && (
        <div className="flex items-center gap-1 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
          <button onClick={() => setSelectedFolder(null)} className="text-indigo-600 hover:underline">
            Todas as pastas
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-800">
            {folders.find(f => f.id === selectedFolder)?.name}
          </span>
        </div>
      )}

      {/* Busca */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nome do arquivo ou processo vinculado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isLoading ? 'Carregando arquivos...' : `${documents.length} documento${documents.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 mx-auto mb-2" />
            Carregando repositório...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <File className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">Nenhum documento anexado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc: any) => (
              <div key={doc.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-slate-100 text-slate-600 shrink-0">
                    <File className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{doc.created_at ? format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR }) : '-'}</span>
                      {doc.process?.number && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-600">{doc.process.number}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1 text-slate-400 hover:text-slate-800 rounded" title="Visualizar">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-800 rounded" title="Baixar">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <DocumentModal
          document={null}
          onSave={(data) => createDocumentMutation.mutate(data)}
          onClose={() => setIsModalOpen(false)}
          isLoading={createDocumentMutation.isPending}
        />
      )}
    </div>
  );
};

export default Documents;
