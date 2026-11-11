// src/components/Documents/GenerateDocumentModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Copy, Printer, Check, 
  Sparkles, Save, Loader2, ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { interpolateTemplate } from '../../lib/templateEngine';
import { useNotifications } from '../../hooks/useNotifications';

interface GenerateDocumentModalProps {
  process: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({
  process,
  onClose,
  onSuccess
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  // 1. Carrega os Modelos Cadastrados
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('title', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Busca dados completos do cliente vinculado ao processo
  const { data: clientData } = useQuery({
    queryKey: ['client-for-template', process?.client_id || process?.clientId],
    queryFn: async () => {
      const clientId = process?.client_id || process?.clientId;
      if (!clientId) return null;
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      return data || null;
    },
    enabled: Boolean(process?.client_id || process?.clientId)
  });

  // 3. Aplica o template quando selecionado
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    const tpl = templates.find((t: any) => t.id === selectedTemplateId);
    if (tpl) {
      const interpolated = interpolateTemplate(tpl.content, {
        process,
        client: clientData || process.client
      });
      setRenderedContent(interpolated);
    }
  }, [selectedTemplateId, templates, process, clientData]);

  // 4. Salva o documento gerado na Pasta Digital do Processo
  const saveDocumentMutation = useMutation({
    mutationFn: async () => {
      const tpl = templates.find((t: any) => t.id === selectedTemplateId);
      const title = `${tpl?.title || 'Documento'} - ${process.number}`;

      // Cria um Blob de texto simples como arquivo simulado
      const blob = new Blob([renderedContent], { type: 'text/plain;charset=utf-8' });
      
      const payload = {
        name: `${title}.txt`,
        type: 'text/plain',
        size: blob.size,
        process_id: process.id,
        client_id: process.client_id || process.clientId || null,
        description: `Gerado via Template Inteligente: ${tpl?.title}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertErr } = await supabase.from('documents').insert([payload]);
      if (insertErr) throw insertErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process-documents', process.id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Salvo na Pasta Digital', 'A peça foi registrada nos documentos deste processo.');
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => error('Erro ao salvar', err.message)
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const win = window.open('', '', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${templates.find((t: any) => t.id === selectedTemplateId)?.title || 'Documento'}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.6; padding: 40px; color: #111; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${renderedContent}</pre>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden text-xs">
        
        {/* Cabeçalho */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Gerador de Peças a partir de Modelos
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Autos: {process.number} • Cliente: {clientData?.name || process.plaintiff || 'Vinculado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo com Split: Modelos à Esquerda, Preview à Direita */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100/50">
          
          {/* Coluna Esquerda: Lista de Modelos */}
          <div className="w-full md:w-64 border-r border-slate-200 bg-white p-3 overflow-y-auto space-y-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Modelos do Escritório
            </span>

            {loadingTemplates ? (
              <div className="p-4 text-center text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                Carregando modelos...
              </div>
            ) : (
              templates.map((tpl: any) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="font-semibold text-xs leading-snug">{tpl.title}</p>
                    <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {tpl.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Coluna Direita: Editor / Preview do Documento Gerado */}
          <div className="flex-1 flex flex-col overflow-hidden p-3.5 bg-slate-50">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700">
                Pré-visualização da Peça Gerada (Pode editar diretamente abaixo):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium flex items-center gap-1 shadow-2xs"
                  title="Copiar texto formatado"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium flex items-center gap-1 shadow-2xs"
                  title="Imprimir ou Salvar em PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>

            {/* Editor de Texto Simples da Peça */}
            <textarea
              value={renderedContent}
              onChange={(e) => setRenderedContent(e.target.value)}
              className="flex-1 w-full p-4 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 bg-white leading-relaxed focus:outline-hidden focus:border-slate-400 shadow-2xs resize-none overflow-y-auto"
              placeholder="O conteúdo do modelo aparecerá aqui..."
            />
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            As variáveis dinâmicas foram substituídas automaticamente com os dados do processo e do cliente.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => saveDocumentMutation.mutate()}
              disabled={saveDocumentMutation.isPending || !renderedContent}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 font-medium shadow-2xs"
            >
              {saveDocumentMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Salvar na Pasta Digital</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
