// src/components/Documents/GenerateDocumentModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, FileText, Copy, Printer, Check, 
  Sparkles, Save, Loader2, Settings2, Upload,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Trash2
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
  const [painelConfigAberto, setPainelConfigAberto] = useState(false);
  
  // Alinhamento manual de texto
  const [textAlign, setTextAlign] = useState<'justify' | 'left' | 'center' | 'right'>('justify');

  // Timbrado em imagem (Base64)
  const [timbradoImage, setTimbradoImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configurações da Página A4
  const [pageSettings, setPageSettings] = useState({
    fontFamily: 'Times New Roman' as 'Times New Roman' | 'Arial' | 'Calibri',
    fontSize: '12pt',
    lineHeight: '1.5',
    exibirCabecalho: true,
    exibirRodape: true,
    posicaoLogo: 'split' as 'left' | 'center' | 'split',
    marcaDaguaTexto: '',
    escritorioNome: 'SILVA ADVOCACIA & CONSULTORIA JURÍDICA',
    escritorioOab: 'OAB/BA nº 12.345',
    escritorioEndereco: 'Av. Tancredo Neves, Salvador/BA',
    escritorioContato: 'Tel: (71) 3333-4444 • contato@silvaadvocacia.com.br'
  });

  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  // Carrega os modelos cadastrados
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

  // Busca dados completos do cliente
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

  // Upload local de imagem de timbrado
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem do timbrado deve ter até 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setTimbradoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar na Pasta Digital
  const saveDocumentMutation = useMutation({
    mutationFn: async () => {
      const tpl = templates.find((t: any) => t.id === selectedTemplateId);
      const title = `${tpl?.title || 'Documento'} - ${process.number}`;

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

  // Motor de Impressão Direta A4 com Timbrado e Alinhamento
  const handlePrint = () => {
    const win = window.open('', '', 'width=850,height=950');
    if (!win) return;

    let cabecalhoHtml = '';
    if (pageSettings.exibirCabecalho) {
      if (pageSettings.posicaoLogo === 'center' && timbradoImage) {
        cabecalhoHtml = `
          <div class="print-header" style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px;">
            <img src="${timbradoImage}" style="max-height: 70px; margin-bottom: 6px;" />
            <h1 style="font-size: 12pt; font-weight: bold; margin: 0; color: #0f172a;">${pageSettings.escritorioNome}</h1>
            <p style="font-size: 9pt; color: #475569; margin: 2px 0 0 0;">${pageSettings.escritorioOab}</p>
          </div>
        `;
      } else {
        cabecalhoHtml = `
          <div class="print-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              ${timbradoImage ? `<img src="${timbradoImage}" style="max-height: 55px; max-width: 140px; object-fit: contain;" />` : ''}
              <div>
                <h1 style="font-size: 12pt; font-weight: bold; margin: 0; color: #0f172a; letter-spacing: 0.5px;">${pageSettings.escritorioNome}</h1>
                <p style="font-size: 9pt; color: #475569; margin: 2px 0 0 0;">${pageSettings.escritorioOab}</p>
              </div>
            </div>
            <div style="font-size: 8pt; font-family: monospace; color: #64748b; text-align: right;">
              Autos nº ${process.number}
            </div>
          </div>
        `;
      }
    }

    const rodapeHtml = pageSettings.exibirRodape ? `
      <div class="print-footer" style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 32px; font-size: 8pt; color: #64748b; text-align: center; line-height: 1.4;">
        <p style="margin: 0;">${pageSettings.escritorioEndereco} • ${pageSettings.escritorioContato}</p>
      </div>
    ` : '';

    const marcaDaguaHtml = pageSettings.marcaDaguaTexto ? `
      <div class="watermark">${pageSettings.marcaDaguaTexto}</div>
    ` : '';

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templates.find((t: any) => t.id === selectedTemplateId)?.title || 'Documento Judicial'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 25mm 20mm 20mm 25mm;
            }
            body {
              font-family: '${pageSettings.fontFamily}', serif;
              font-size: ${pageSettings.fontSize};
              line-height: ${pageSettings.lineHeight};
              color: #0f172a;
              margin: 0;
              padding: 0;
              position: relative;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
              font-size: inherit;
              line-height: inherit;
              margin: 0;
              text-align: ${textAlign};
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 55pt;
              color: rgba(148, 163, 184, 0.15);
              font-weight: bold;
              pointer-events: none;
              z-index: -1;
              white-space: nowrap;
              letter-spacing: 4px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${marcaDaguaHtml}
          ${cabecalhoHtml}
          <pre>${renderedContent}</pre>
          ${rodapeHtml}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden text-xs">
        
        {/* Cabeçalho Superior */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Emissão de Minutas e Papel Timbrado
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Autos: {process.number} • Parte: {clientData?.name || process.plaintiff || 'Vinculada'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPainelConfigAberto(!painelConfigAberto)}
              className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs ${
                painelConfigAberto
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Configurar Timbrado & Folha</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Painel de Configurações e Upload */}
        {painelConfigAberto && (
          <div className="bg-slate-900 text-slate-200 p-4 border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 shrink-0 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Upload de Imagem */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Logo / Imagem do Timbrado
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png,image/jpeg,image/svg+xml" 
                  className="hidden" 
                />
                {timbradoImage ? (
                  <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded border border-slate-700">
                    <img src={timbradoImage} alt="Timbrado" className="h-7 w-auto max-w-[80px] object-contain rounded bg-white p-0.5" />
                    <button
                      type="button"
                      onClick={() => setTimbradoImage(null)}
                      className="text-rose-400 hover:text-rose-300 p-1 ml-auto"
                      title="Remover logo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-slate-800 border border-dashed border-slate-700 hover:border-slate-500 rounded text-slate-300 flex items-center justify-center gap-1.5 transition text-[11px]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Carregar Brasão / Logo</span>
                  </button>
                )}
              </div>

              {/* Tipografia */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipografia</label>
                <select
                  value={pageSettings.fontFamily}
                  onChange={(e) => setPageSettings({ ...pageSettings, fontFamily: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-hidden"
                >
                  <option value="Times New Roman">Times New Roman (Forense Padrão)</option>
                  <option value="Arial">Arial (Moderna)</option>
                  <option value="Calibri">Calibri</option>
                </select>
              </div>

              {/* Tamanho e Entrelinhas */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tamanho & Entrelinhas</label>
                <div className="flex gap-2">
                  <select
                    value={pageSettings.fontSize}
                    onChange={(e) => setPageSettings({ ...pageSettings, fontSize: e.target.value })}
                    className="w-1/2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="11pt">11 pt</option>
                    <option value="12pt">12 pt (Padrão)</option>
                    <option value="13pt">13 pt</option>
                  </select>
                  <select
                    value={pageSettings.lineHeight}
                    onChange={(e) => setPageSettings({ ...pageSettings, lineHeight: e.target.value })}
                    className="w-1/2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="1.2">1.2 (Simples)</option>
                    <option value="1.5">1.5 (CPC/ABNT)</option>
                    <option value="1.8">1.8 (Espaçado)</option>
                  </select>
                </div>
              </div>

              {/* Marca D'Água */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Marca d'Água Central</label>
                <input
                  type="text"
                  placeholder="Ex: MINUTA, CONFIDENCIAL"
                  value={pageSettings.marcaDaguaTexto}
                  onChange={(e) => setPageSettings({ ...pageSettings, marcaDaguaTexto: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 uppercase font-mono text-[11px]"
                />
              </div>

            </div>

            {/* Segunda linha de opções */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800 text-[11px]">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageSettings.exibirCabecalho}
                    onChange={(e) => setPageSettings({ ...pageSettings, exibirCabecalho: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-500"
                  />
                  <span>Cabeçalho Ativo</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageSettings.exibirRodape}
                    onChange={(e) => setPageSettings({ ...pageSettings, exibirRodape: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-500"
                  />
                  <span>Rodapé Institucional</span>
                </label>
              </div>

              {timbradoImage && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Posição do Timbrado:</span>
                  <button
                    type="button"
                    onClick={() => setPageSettings({ ...pageSettings, posicaoLogo: 'split' })}
                    className={`px-2 py-0.5 rounded ${pageSettings.posicaoLogo === 'split' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    Lateral
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSettings({ ...pageSettings, posicaoLogo: 'center' })}
                    className={`px-2 py-0.5 rounded ${pageSettings.posicaoLogo === 'center' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    Topo Central
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Corpo com Split: Modelos à Esquerda, Folha A4 à Direita */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-200/70">
          
          {/* Coluna Esquerda: Modelos */}
          <div className="w-full md:w-60 border-r border-slate-200 bg-white p-3 overflow-y-auto space-y-1.5 shrink-0">
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

          {/* Coluna Direita: Folha A4 e Barra de Alinhamento */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 items-center">
            
            {/* Barra de Ferramentas da Folha (Alinhamento & Impressão) */}
            <div className="w-full max-w-[210mm] flex items-center justify-between pb-3 mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-300 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Alinhamento:</span>
                <button
                  type="button"
                  onClick={() => setTextAlign('justify')}
                  className={`p-1 rounded ${textAlign === 'justify' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  title="Justificar Texto"
                >
                  <AlignJustify className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('left')}
                  className={`p-1 rounded ${textAlign === 'left' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  title="Alinhar à Esquerda"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('center')}
                  className={`p-1 rounded ${textAlign === 'center' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  title="Centralizar Texto"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('right')}
                  className={`p-1 rounded ${textAlign === 'right' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  title="Alinhar à Direita"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center gap-1 shadow-2xs"
                  title="Copiar texto"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                  title="Imprimir com Papel Timbrado"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir em A4</span>
                </button>
              </div>
            </div>

            {/* Simulação da Folha A4 */}
            <div 
              className="w-full max-w-[210mm] min-h-[297mm] bg-white border border-slate-300 rounded shadow-md p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden"
              style={{
                fontFamily: pageSettings.fontFamily,
                fontSize: pageSettings.fontSize,
                lineHeight: pageSettings.lineHeight
              }}
            >
              {/* Marca D'Água */}
              {pageSettings.marcaDaguaTexto && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <span className="text-slate-200 font-bold text-6xl tracking-widest uppercase transform -rotate-45">
                    {pageSettings.marcaDaguaTexto}
                  </span>
                </div>
              )}

              {/* Cabeçalho da Folha */}
              {pageSettings.exibirCabecalho && (
                <div className={`border-b-2 border-slate-900 pb-3 mb-6 relative z-10 ${
                  pageSettings.posicaoLogo === 'center' && timbradoImage ? 'text-center' : 'flex justify-between items-end'
                }`}>
                  <div className={pageSettings.posicaoLogo === 'split' ? 'flex items-center gap-3.5' : ''}>
                    {timbradoImage && (
                      <img 
                        src={timbradoImage} 
                        alt="Logo" 
                        className={`object-contain ${pageSettings.posicaoLogo === 'center' ? 'max-h-16 mx-auto mb-2' : 'max-h-12 max-w-[140px]'}`} 
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 tracking-wide text-sm">{pageSettings.escritorioNome}</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{pageSettings.escritorioOab}</p>
                    </div>
                  </div>
                  {pageSettings.posicaoLogo !== 'center' && (
                    <div className="text-[9px] font-mono text-slate-400 text-right">
                      Processo: {process.number}
                    </div>
                  )}
                </div>
              )}

              {/* Corpo da Peça (com alinhamento dinâmico) */}
              <textarea
                value={renderedContent}
                onChange={(e) => setRenderedContent(e.target.value)}
                className="w-full flex-1 border-none focus:outline-hidden resize-none bg-transparent text-slate-900 relative z-10 p-0 leading-relaxed"
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                  textAlign: textAlign
                }}
              />

              {/* Rodapé da Folha */}
              {pageSettings.exibirRodape && (
                <div className="border-t border-slate-200 pt-3 mt-8 text-center text-[9px] text-slate-400 font-mono relative z-10">
                  <p>{pageSettings.escritorioEndereco} • {pageSettings.escritorioContato}</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Utilize a barra superior para alinhar o texto (justificado, centralizado ou esquerda) antes de imprimir.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
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
              <span>Salvar nos Autos</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
