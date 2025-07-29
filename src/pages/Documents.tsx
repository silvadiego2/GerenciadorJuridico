import React, { useState } from 'react';
import { 
  Upload, Search, Filter, Eye, Download, Share2, FileText, 
  Image, File, Folder, Plus, MoreVertical, Calendar, User,
  Tag, Clock, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  processId?: string;
  clientId?: string;
  folderId?: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
  isShared: boolean;
  description?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  processId?: string;
  clientId?: string;
  createdAt: Date;
  documentsCount: number;
}

const Documents: React.FC = () => {
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Petição Inicial - Ação de Cobrança.pdf',
      type: 'application/pdf',
      size: 1024000,
      url: '/documents/peticao-inicial.pdf',
      processId: '1',
      uploadedBy: '1',
      uploadedByName: 'Dr. João Silva',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01'),
      version: 1,
      tags: ['petição', 'inicial', 'cobrança'],
      isShared: false,
      description: 'Petição inicial da ação de cobrança contra João da Silva'
    },
    {
      id: '2',
      name: 'Contrato Social - Empresa ABC.pdf',
      type: 'application/pdf',
      size: 2048000,
      url: '/documents/contrato-social.pdf',
      clientId: '2',
      folderId: 'folder1',
      uploadedBy: '2',
      uploadedByName: 'Maria Santos',
      createdAt: new Date('2024-11-28'),
      updatedAt: new Date('2024-11-28'),
      version: 2,
      tags: ['contrato', 'social', 'empresa'],
      isShared: true,
      description: 'Contrato social atualizado da Empresa ABC Ltda'
    },
    {
      id: '3',
      name: 'Procuração - João Santos.pdf',
      type: 'application/pdf',
      size: 512000,
      url: '/documents/procuracao.pdf',
      clientId: '1',
      uploadedBy: '1',
      uploadedByName: 'Dr. João Silva',
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-05'),
      version: 1,
      tags: ['procuração', 'representação'],
      isShared: false
    }
  ]);

  const [folders] = useState<Folder[]>([
    {
      id: 'folder1',
      name: 'Documentos Societários',
      clientId: '2',
      createdAt: new Date('2024-11-01'),
      documentsCount: 5
    },
    {
      id: 'folder2',
      name: 'Petições e Manifestações',
      processId: '1',
      createdAt: new Date('2024-12-01'),
      documentsCount: 3
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'pdf' | 'image' | 'word'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'pdf' && doc.type === 'application/pdf') ||
                       (selectedType === 'image' && doc.type.startsWith('image/')) ||
                       (selectedType === 'word' && doc.type.includes('word'));
    const matchesFolder = !selectedFolder || doc.folderId === selectedFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
                    <p className="text-sm text-gray-600">{folder.documentsCount} documentos</p>
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
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredDocuments.map((document) => {
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
                        <span>{formatFileSize(document.size)}</span>
                        <span>v{document.version}</span>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{document.uploadedByName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(document.createdAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        {document.isShared && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Share2 className="h-4 w-4" />
                            <span>Compartilhado</span>
                          </div>
                        )}
                      </div>
                      
                      {document.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex space-x-1">
                            {document.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
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
          
          {filteredDocuments.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum documento encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;