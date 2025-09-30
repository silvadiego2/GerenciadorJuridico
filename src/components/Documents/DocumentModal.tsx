import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Tag, User, Folder, Link } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientsService, processesService } from '../../lib/api';
import { Client, Process } from '../../types';

interface DocumentModalProps {
  document: any | null;
  onSave: (documentData: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ document, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    processId: '',
    clientId: '',
    folderId: '',
    tags: '',
    isShared: false,
    file: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Buscar dados para os dropdowns
  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getAll(),
  });

  const { data: processesData, isLoading: loadingProcesses } = useQuery({
    queryKey: ['processes'],
    queryFn: () => processesService.getAll(),
  });

  const clients = clientsData?.clients || [];
  const processes = processesData?.processes || [];

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name,
        description: document.description || '',
        processId: document.process_id || '',
        clientId: document.client_id || '',
        folderId: document.folder_id || '',
        tags: document.tags?.join(', ') || '',
        isShared: document.is_shared || false,
        file: null,
      });
    }
  }, [document]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!document && !formData.file) {
      newErrors.file = 'Arquivo é obrigatório';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const documentData = {
        name: formData.name,
        description: formData.description || null,
        process_id: formData.processId || null,
        client_id: formData.clientId || null,
        folder_id: formData.folderId || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        is_shared: formData.isShared,
        // Para upload real, seria necessário implementar upload de arquivo
        // Por enquanto, simulamos com dados básicos
        type: formData.file?.type || 'application/pdf',
        size: formData.file?.size || 0,
        url: `/documents/${formData.name}`, // URL simulada
      };
      onSave(documentData);
    }
  };

  const handleChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleChange('file', file);
      if (!formData.name) {
        handleChange('name', file.name);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleChange('file', file);
      if (!formData.name) {
        handleChange('name', file.name);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {document ? 'Editar Documento' : 'Upload de Documento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Upload de Arquivo */}
          {!document && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : errors.file 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-600">
                    PDF, Word, Imagens até 10MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Selecionar Arquivo
                  </label>
                </div>
              </div>
              
              {formData.file && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{formData.file.name}</p>
                      <p className="text-sm text-green-600">
                        {formatFileSize(formData.file.size)} • {formData.file.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('file', null)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
            </div>
          )}

          {/* Informações do Documento */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Documento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Documento *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nome do documento"
                  />
                </div>
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Descrição opcional do documento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="petição, inicial, cobrança (separadas por vírgula)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Separe as tags com vírgulas para facilitar a busca
                </p>
              </div>
            </div>
          </div>

          {/* Relacionamentos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Relacionamentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processo (Opcional)
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.processId}
                    onChange={(e) => handleChange('processId', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingProcesses}
                  >
                    <option value="">Selecione um processo</option>
                    {processes.map((process: Process) => (
                      <option key={process.id} value={process.id}>
                        {process.number} - {process.subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente (Opcional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingClients}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client: Client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pasta (Opcional)
                </label>
                <div className="relative">
                  <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.folderId}
                    onChange={(e) => handleChange('folderId', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sem pasta</option>
                    <option value="folder1">Documentos Societários</option>
                    <option value="folder2">Petições e Manifestações</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => handleChange('isShared', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Compartilhar documento
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Informações do Arquivo */}
          {formData.file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Informações do Arquivo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Tipo:</span>
                  <span className="ml-2 font-medium">{formData.file.type}</span>
                </div>
                <div>
                  <span className="text-blue-700">Tamanho:</span>
                  <span className="ml-2 font-medium">{formatFileSize(formData.file.size)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Última modificação:</span>
                  <span className="ml-2 font-medium">
                    {new Date(formData.file.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingClients || loadingProcesses}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Enviando...' : (document ? 'Salvar' : 'Upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default DocumentModal;