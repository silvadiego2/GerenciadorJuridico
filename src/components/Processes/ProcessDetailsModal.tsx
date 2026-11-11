// src/components/Processes/ProcessDetailsModal.tsx
import React, { useState } from 'react';
import { 
  X, Scale, User, Building2, Calendar, FileText, 
  Clock, DollarSign, Bell, Download, Eye, 
  CheckCircle2, Copy, Check, Sparkles, Edit, Save, Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GenerateDocumentModal } from '../Documents/GenerateDocumentModal';
import { useNotifications } from '../../hooks/useNotifications';

interface ProcessDetailsModalProps {
  process: any;
  onClose: () => void;
  onEdit: (process: any) => void;
}

export const ProcessDetailsModal: React.FC<ProcessDetailsModalProps> = ({ 
  process, 
  onClose, 
  onEdit 
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'publicacoes' | 'tarefas' | 'documentos' | 'financeiro'>('geral');
  const [cnjCopiado, setCnjCopiado] = useState(false);
  const [modalGerarDocAberto, setModalGerarDocAberto] = useState(false);
  
  // Estado para Visualizar / Editar documento já salvo na Pasta Digital
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [editDocText, setEditDocText] = useState<string>('');

  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotifications();

  // 1. Busca Publicações
  const { data: publicacoes = [], isLoading: loadingPubs } = useQuery({
    queryKey: ['process-publications', process.id, process.number],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .or(`process_id.eq.${process.id},process_number.eq.${process.number}`)
        .order('publication_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Busca Tarefas
  const { data: tarefas = [], isLoading: loadingTarefas } = useQuery({
    queryKey: ['process-tasks', process.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, assigned_user:users(id, name)')
        .eq('process_id', process.id)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // 3. Busca Documentos da Pasta Digital
  const { data: documentos = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['process-documents', process.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('process_id', process.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 4. Busca Lançamentos Financeiros
  const { data: lancamentos = [], isLoading: loadingFin } = useQuery({
    queryKey: ['process-financial', process.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_entries')
        .select('*')
        .eq('process_id', process.id)
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Salvar edições feitas em um documento já gravado
  const updateDocMutation = useMutation({
    mutationFn: async () => {
      if (!viewingDoc) return;
      const { error } = await supabase
        .from('documents')
        .update({
          content: editDocText,
          description: editDocText.substring(0, 300),
          updated_at: new Date().toISOString()
        })
        .eq('id', viewingDoc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-documents', process.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Atualizado', 'Alterações salvas no documento.');
      setViewingDoc(null);
    },
    onError: (err: any) => notifyError('Erro ao atualizar', err.message)
  });

  const handleAbrirDoc = (doc: any) => {
    setViewingDoc(doc);
    setEditDocText(doc.content || doc.description || '');
  };

  const handleCopiarCnj = () => {
    navigator.clipboard.writeText(process.number);
    setCnjCopiado(true);
    setTimeout(() => setCnjCopiado(false), 2000);
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
      return format(d, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const tabs = [
    { id: 'geral', label: 'Dados dos Autos', icon: Scale, count: null },
    { id: 'publicacoes', label: 'Intimações & DJE', icon: Bell, count: publicacoes.length },
    { id: 'tarefas', label: 'Prazos & Audiências', icon: Clock, count: tarefas.filter((t: any) => t.status !== 'concluida').length },
    { id: 'documentos', label: 'Pasta Digital', icon: FileText, count: documentos.length },
    { id: 'financeiro', label: 'Honorários & Custas', icon: DollarSign, count: lancamentos.length },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-xl border border-slate-200 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        
        {/* Topo Institucional */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                  {process.number}
                </span>
                <button
                  type="button"
                  onClick={handleCopiarCnj}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                  title="Copiar número CNJ"
                >
                  {cnjCopiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="px-2 py-0.5 text-[10px] font-semibold border rounded-sm uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                  {process.status || 'Ativo'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {process.subject || process.title || 'Ação Judicial'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                onClose();
                onEdit(process);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md transition shadow-2xs"
            >
              Editar Autos
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="px-5 border-b border-slate-200 bg-white flex gap-1 overflow-x-auto shrink-0 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-50/40 text-xs">
          
          {/* ABA GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Promovente (Cliente)
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {process.client?.name || process.plaintiff || 'Não informado'}
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Promovido (Réu)
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {process.defendant || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA DOCUMENTOS / PASTA DIGITAL */}
          {activeTab === 'documentos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Peças e Pasta Digital</h4>
                  <p className="text-[11px] text-slate-500">Minutas salvas, procurações e documentos probatórios</p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalGerarDocAberto(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gerar Peça por Modelo</span>
                </button>
              </div>

              {loadingDocs ? (
                <div className="py-12 text-center text-slate-400">Carregando documentos...</div>
              ) : documentos.length === 0 ? (
                <div className="py-12 text-center bg-white border border-slate-200 rounded-lg p-6">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum documento salvo nos autos</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gere procurações ou minutas no botão acima para salvar na Pasta Digital.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden">
                  {documentos.map((doc: any) => (
                    <div key={doc.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{doc.name || doc.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleAbrirDoc(doc)}
                          className="px-2 py-1 text-slate-700 hover:bg-slate-200/70 border border-slate-200 rounded flex items-center gap-1 text-[11px] font-medium"
                          title="Visualizar e Editar Texto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir / Editar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEMAIS ABAS */}
          {activeTab === 'publicacoes' && (
            <div className="space-y-2">
              {publicacoes.map((pub: any) => (
                <div key={pub.id} className="p-3 bg-white border rounded">
                  <p className="text-[11px] text-slate-700 font-mono">{pub.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tarefas' && (
            <div className="space-y-2">
              {tarefas.map((tar: any) => (
                <div key={tar.id} className="p-3 bg-white border rounded flex justify-between">
                  <span>{tar.title}</span>
                  <span className="font-mono text-slate-400">{formatDate(tar.due_date)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-2">
              {lancamentos.map((l: any) => (
                <div key={l.id} className="p-3 bg-white border rounded flex justify-between">
                  <span>{l.description}</span>
                  <span className="font-mono font-bold text-emerald-700">R$ {Number(l.value).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition shadow-2xs"
          >
            Fechar Ficha
          </button>
        </div>

      </div>

      {/* MODAL DE LEITURA E EDIÇÃO DO DOCUMENTO JÁ GRAVADO */}
      {viewingDoc && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm truncate max-w-md">{viewingDoc.name || viewingDoc.title}</h3>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-hidden bg-slate-100 flex flex-col">
              <textarea
                value={editDocText}
                onChange={(e) => setEditDocText(e.target.value)}
                className="w-full flex-1 p-4 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-900 leading-relaxed resize-none focus:outline-none shadow-inner overflow-y-auto"
                placeholder="Conteúdo do documento..."
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Edite o texto acima e clique em Salvar Alterações.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => updateDocMutation.mutate()}
                  disabled={updateDocMutation.isPending}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  {updateDocMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerador */}
      {modalGerarDocAberto && (
        <GenerateDocumentModal
          process={process}
          onClose={() => setModalGerarDocAberto(false)}
        />
      )}
    </div>
  );
};

export default ProcessDetailsModal;
