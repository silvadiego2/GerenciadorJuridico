// src/pages/Documents.tsx
import React, { useState } from 'react';
import { 
  Upload, Search, File, Folder, Download, 
  Trash2, Eye, ChevronRight, Loader2, Scale, 
  Sparkles, Plus, Edit, FileText, Check, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DocumentModal from '../components/Documents/DocumentModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
}

const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arquivos' | 'modelos'>('arquivos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para Gestão de Modelos
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    title: '',
    category: 'Procuração',
    content: ''
  });

  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  // 1. Consulta de Arquivos
  const { data: documentsData, isLoading: loadingDocs, error: queryError } = useQuery({
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

  // 2. Consulta de Modelos
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return (data || []) as DocumentTemplate[];
    }
  });

  const folders = [
    { id: 'folder1', name: 'Contratos e Procurações', count: 4 },
    { id: 'folder2', name: 'Petições Iniciais', count: 6 },
    { id: 'folder3', name: 'Documentos Probatórios', count: 9 },
  ];

  // Mutações de Arquivos
  const createDocumentMutation = useMutation({
    mutationFn: documentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Sucesso', 'Documento anexado com sucesso');
      setIsModalOpen(false);
    },
    onError: (err: any) => notifyError('Erro', err.message || 'Falha ao anexar documento')
  });

  // Mutações de Modelos (Templates)
  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!templateForm.title.trim() || !templateForm.content.trim()) {
        throw new Error('Título e Conteúdo são obrigatórios.');
      }

      if (editingTemplate) {
        const { error } = await supabase
          .from('document_templates')
          .update({
            title: templateForm.title,
            category: templateForm.category,
            content: templateForm.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('document_templates')
          .insert([{
            title: templateForm.title,
            category: templateForm.category,
            content: templateForm.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      success('Modelo Salvo', `O modelo "${templateForm.title}" foi gravado com sucesso.`);
      setIsTemplateModalOpen(false);
      setEditingTemplate(null);
      setTemplateForm({ title: '', category: 'Procuração', content: '' });
    },
    onError: (err: any) => notifyError('Erro ao Salvar Modelo', err.message)
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('document_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      success('Modelo Excluído', 'O modelo foi removido da biblioteca.');
    },
    onError: (err: any) => notifyError('Erro ao Excluir', err.message)
  });

  const handleEditTemplate = (tpl: DocumentTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      title: tpl.title,
      category: tpl.category,
      content: tpl.content
    });
    setIsTemplateModalOpen(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      title: '',
      category: 'Procuração',
      content: 'PROCURAÇÃO AD JUDICIA\n\nOUTORGANTE: {{cliente_nome}}, CPF {{cliente_documento}}, residente em {{cliente_endereco}}.\n\nOUTORGADO: SILVA ADVOCACIA...\n\nPODERES: Para propor ação em face de {{processo_reu}} perante a {{processo_vara}}.\n\n{{cidade_data}}\n\n_______________________\n{{cliente_nome}}'
    });
    setIsTemplateModalOpen(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Topo Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Módulo de Documentos & Minutas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Repositório de arquivos, peças anexadas e biblioteca de modelos inteligentes</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'arquivos' ? (
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload de Peça</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleNewTemplate}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Modelo</span>
            </button>
          )}
        </div>
      </div>

      {/* Seletor de Abas Principais */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('arquivos')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'arquivos'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <File className="h-3.5 w-3.5" />
          <span>Arquivos do Escritório</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('modelos')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'modelos'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Modelos & Minutas Inteligentes</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">
            {templates.length}
          </span>
        </button>
      </div>

      {/* Barra de Filtro e Busca Comum */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'arquivos' ? 'Filtrar por nome do arquivo ou processo vinculado...' : 'Buscar modelo por título ou categoria...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>
      </div>

      {/* ABA 1: REPOSITÓRIO DE ARQUIVOS */}
      {activeTab === 'arquivos' && (
        <div className="space-y-4">
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

          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {loadingDocs ? 'Carregando arquivos...' : `${documents.length} documento${documents.length !== 1 ? 's' : ''}`}
              </h2>
              {loadingDocs && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
            </div>

            {loadingDocs ? (
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
                      <button className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100" title="Visualizar">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100" title="Baixar">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: MODELOS E MINUTAS (TEMPLATES) */}
      {activeTab === 'modelos' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {loadingTemplates ? (
              <div className="col-span-3 p-12 text-center text-slate-400 text-xs">
                <Loader2 className="h-5 w-5 animate-spin text-slate-600 mx-auto mb-2" />
                Carregando biblioteca de modelos...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-white border border-slate-200 rounded-lg">
                <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">Nenhum modelo cadastrado</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Clique em "Novo Modelo" acima para criar sua primeira minuta reutilizável.</p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <div key={tpl.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {tpl.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEditTemplate(tpl)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          title="Editar Modelo"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Excluir o modelo "${tpl.title}"?`)) {
                              deleteTemplateMutation.mutate(tpl.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                          title="Excluir Modelo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">{tpl.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-3 mt-2 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                      {tpl.content}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Disponível na Ficha 360°</span>
                    <span>{tpl.created_at ? format(new Date(tpl.created_at), "dd/MM/yyyy") : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Modelo com Tags Inteligentes */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingTemplate ? 'Editar Modelo de Minuta' : 'Novo Modelo Reutilizável'}
                </h3>
              </div>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Título do Modelo *</label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400"
                    placeholder="Ex: Procuração Ad Judicia - Relação de Consumo"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoria</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400 bg-white"
                  >
                    <option value="Procuração">Procuração</option>
                    <option value="Contratos">Contratos e Honorários</option>
                    <option value="Declarações">Declarações (Hipossuficiência, Residência)</option>
                    <option value="Petições">Petições Iniciais e Peças</option>
                    <option value="Notificações">Notificações Extrajudiciais</option>
                  </select>
                </div>
              </div>

              {/* Guia Rápido de Variáveis */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Variáveis que o sistema substitui automaticamente:
                </span>
                <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{cliente_nome}}' })}>+ &#123;&#123;cliente_nome&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{cliente_documento}}' })}>+ &#123;&#123;cliente_documento&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{cliente_endereco}}' })}>+ &#123;&#123;cliente_endereco&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{processo_numero}}' })}>+ &#123;&#123;processo_numero&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{processo_vara}}' })}>+ &#123;&#123;processo_vara&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{processo_reu}}' })}>+ &#123;&#123;processo_reu&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{processo_valor}}' })}>+ &#123;&#123;processo_valor&#125;&#125;</span>
                  <span className="bg-white border px-1.5 py-0.5 rounded text-indigo-700 font-semibold cursor-pointer" onClick={() => setTemplateForm({ ...templateForm, content: templateForm.content + ' {{cidade_data}}' })}>+ &#123;&#123;cidade_data&#125;&#125;</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Texto Base da Minuta *</label>
                <textarea
                  rows={12}
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
                  placeholder="Digite o texto do modelo inserindo as variáveis acima..."
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => saveTemplateMutation.mutate()}
                disabled={saveTemplateMutation.isPending}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 font-medium shadow-2xs flex items-center gap-1.5"
              >
                {saveTemplateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Salvar Modelo</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
