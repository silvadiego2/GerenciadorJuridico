import React, { useState } from 'react';
import { 
  Upload, Search, Filter, Eye, Download, Share2, FileText, 
  Image, File, Folder, Plus, MoreVertical, Calendar, User,
  Tag, Clock, ChevronRight, Loader2, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DocumentModal from '../components/Documents/DocumentModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  process_id?: string;
  client_id?: string;
  folder_id?: string;
  uploaded_by: string;
  version: number;
  tags: string[];
  is_shared: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos vindos do backend
  process?: {
    id: string;
    number: string;
    subject: string;
  };
  client?: {
    id: string;
    name: string;
  };
  uploaded_by_user?: {
    id: string;
    name: string;
  };
}

interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  process_id?: string;
  client_id?: string;
  created_at: string;
  documents_count: number;
}

const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'image' | 'word'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query para buscar documentos
  const { data: documentsData, isLoading, error: queryError } = useQuery({
    queryKey: ['documents', debouncedSearchTerm, selectedType, selectedFolder],
    queryFn: () => {
      const params: Record<string, string> = {};
      
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedFolder) params.folder_id = selectedFolder;
      
      // Mapear tipo para filtro do backend
      if (selectedType !== 'all') {
        switch (selectedType) {
          case 'pdf':
            params.type = 'application/pdf';
            break;
          case 'image':
            params.type = 'image';
            break;
          case 'word':
            params.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        }
      }
      
      return documentsService.getAll(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const documents = documentsData?.documents || [];

  // Query para buscar pastas (mockadas por enquanto)
  const folders: Folder[] = [
    {
      id: 'folder1',
      name: 'Documentos Societários',
      client_id: '660e8400-e29b-41d4-a716-446655440002',
      created_at: '2024-11-01T00:00:00Z',
      documents_count: 5
    },
    {
      id: 'folder2',
      name: 'Petições e Manifestações',
      process_id: '770e8400-e29b-41d4-a716-446655440001',
      created_at: '2024-12-01T00:00:00Z',
      documents_count: 3
    }
  ];

  // Mutation para criar documento
  const createDocumentMutation = useMutation({
    mutationFn: documentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Sucesso', 'Documento enviado com sucesso!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao enviar documento');
    },
  });

  const handleCreateDocument = () => {
    setEditingDocument(null);
    setIsModalOpen(true);
  };

  const handleSaveDocument = (documentData: Partial<Document>) => {
    createDocumentMutation.mutate(documentData);
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return FileText;
    if (type.startsWith('image/')) return Image;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'application/pdf': return 'PDF';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'Word';
      case 'application/msword': return 'Word';
      default:
        if (type.startsWith('image/')) return 'Imagem';
        return 'Arquivo';
    }
  };

  if (queryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar documentos: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600">Gerencie documentos por processo ou cliente</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <Folder className="h-4 w-4" />
            <span>Nova Pasta</span>
          </button>
          <button 
            onClick={handleCreateDocument}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar documentos, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="pdf">PDF</option>
            <option value="image">Imagens</option>
            <option value="word">Word</option>
          </select>
          <select
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as pastas</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pastas */}
      {!selectedFolder && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pastas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Folder className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{folder.name}</h4>
                    <p className="text-sm text-gray-600">{folder.documents_count} documentos</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      {selectedFolder && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button 
            onClick={() => setSelectedFolder(null)}
            className="hover:text-blue-600"
          >
            Documentos
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium">
            {folders.find(f => f.id === selectedFolder)?.name}
          </span>
        </div>
      )}

      {/* Lista de Documentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Carregando...' : `${documents.length} documento${documents.length !== 1 ? 's' : ''} encontrado${documents.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando documentos...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => {
              const FileIcon = getFileIcon(document.type);
              return (
                <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {document.name}
                        </h3>
                        {document.description && (
                          <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {getTypeDisplayName(document.type)}
                          </span>
                          <span>{formatFileSize(document.size || 0)}</span>
                          <span>v{document.version}</span>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{document.uploaded_by_user?.name || 'Usuário desconhecido'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(document.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          {document.is_shared && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <Share2 className="h-4 w-4" />
                              <span>Compartilhado</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Relacionamentos */}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {document.process && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Processo:</span>
                              <span className="font-mono text-xs">{document.process.number}</span>
                            </div>
                          )}
                          {document.client && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Cliente:</span>
                              <span>{document.client.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <div className="flex space-x-1">
                              {document.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {documents.length === 0 && !isLoading && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhum documento encontrado</p>
                <p className="text-gray-400 text-sm mt-2">
                  Faça upload de documentos para começar a organizar seus arquivos
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {isModalOpen && (
        <DocumentModal
          document={editingDocument}
          onSave={handleSaveDocument}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDocument(null);
          }}
          isLoading={createDocumentMutation.isPending}
        />
      )}
    </div>
  );
};

export default Documents;