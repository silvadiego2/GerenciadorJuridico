// src/components/ModalImportarProcessos.tsx
import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Copy, 
  Layers, 
  X,
  FileText,
  Gavel,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthContext } from '../contexts/AuthContext';

interface ProcessoImportado {
  numero_cnj: string;
  titulo_polo_ativo: string;
  titulo_polo_passivo: string;
  vara?: string;
  classe?: string;
}

interface ModalImportarProps {
  isOpen: boolean;
  onClose: () => void;
  onSucesso: () => void;
}

export const ModalImportarProcessos: React.FC<ModalImportarProps> = ({ isOpen, onClose, onSucesso }) => {
  const { user } = useAuthContext();
  const [textoEntrada, setTextoEntrada] = useState('');
  const [processosExtraidos, setProcessosExtraidos] = useState<ProcessoImportado[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  // Analisa o texto colado (seja JSON do Bookmarklet ou cópia de tabela)
  const processarTexto = () => {
    setErro(null);
    if (!textoEntrada.trim()) {
      setErro('Cole o conteúdo copiado do PJe ou do Extrator.');
      return;
    }

    try {
      // 1. Tenta interpretar como JSON gerado pelo Bookmarklet
      if (textoEntrada.trim().startsWith('[') && textoEntrada.trim().endsWith(']')) {
        const dados = JSON.parse(textoEntrada);
        if (Array.isArray(dados) && dados.length > 0) {
          setProcessosExtraidos(dados);
          return;
        }
      }

      // 2. Fallback: Parser de texto copiado comum de tabela (Ctrl+A, Ctrl+C no PJe)
      const padraoCnj = /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g;
      const cnjsEncontrados = Array.from(new Set(textoEntrada.match(padraoCnj) || []));

      if (cnjsEncontrados.length === 0) {
        setErro('Nenhum número de processo no padrão CNJ (0000000-00.0000.0.00.0000) foi identificado.');
        return;
      }

      const lista = cnjsEncontrados.map(cnj => ({
        numero_cnj: cnj,
        titulo_polo_ativo: 'Polo Ativo (Consultar Autos)',
        titulo_polo_passivo: 'Polo Passivo (Consultar Autos)',
        vara: 'Vara Judicial',
        classe: 'Procedimento Comum',
      }));

      setProcessosExtraidos(lista);
    } catch (e: any) {
      setErro('Erro ao processar dados. Certifique-se de colar o JSON copiado pelo Extrator.');
    }
  };

  // Salva os processos em lote no Supabase
  const handleSalvarNoBanco = async () => {
    if (processosExtraidos.length === 0) return;
    setSalvando(true);
    setErro(null);

    try {
      const registrosParaInserir = processosExtraidos.map(p => ({
        numero_processo: p.numero_cnj,
        process_number: p.numero_cnj,
        title: `${p.titulo_polo_ativo} x ${p.titulo_polo_passivo}`,
        subject: p.classe || 'Procedimento Judicial',
        status: 'active',
        user_id: user?.id,
        created_at: new Date().toISOString(),
      }));

      // Inserção no Supabase na tabela processes
      const { error: insertError } = await supabase
        .from('processes')
        .upsert(registrosParaInserir, { onConflict: 'numero_processo' });

      if (insertError) {
        // Se a coluna única for process_number
        const { error: fallbackError } = await supabase
          .from('processes')
          .upsert(registrosParaInserir);
        if (fallbackError) throw fallbackError;
      }

      alert(`Sucesso! ${processosExtraidos.length} processos foram cadastrados no seu sistema.`);
      onSucesso();
      onClose();
    } catch (e: any) {
      setErro(`Erro ao gravar no Supabase: ${e.message || 'Verifique sua conexão.'}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Importador de Processos em Lote (PJe / Tribunais)
              </h3>
              <p className="text-xs text-slate-500">
                Cadastre dezenas ou centenas de processos de uma só vez sem precisar de API.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {processosExtraidos.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Como usar:</strong> No PJe ou PROJUDI logado com seu certificado digital, clique no favorito <strong>⚡ Extrair Processos PJe</strong>. Depois de capturar todas as páginas, clique em <em>Copiar</em> e cole o resultado no campo abaixo.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cole aqui os dados copiados do PJe ou do Extrator:
                </label>
                <textarea
                  rows={9}
                  placeholder="Cole aqui o conteúdo copiado do Extrator..."
                  value={textoEntrada}
                  onChange={e => setTextoEntrada(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {erro && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{erro}</span>
                </div>
              )}

              <button
                type="button"
                onClick={processarTexto}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
              >
                Identificar Processos
              </button>
            </div>
          ) : (
            /* Visualização da Lista de Processos Extraídos */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ {processosExtraidos.length} processos identificados
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Revise os dados abaixo antes de confirmar o cadastro no banco:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProcessosExtraidos([])}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Colar novamente
                </button>
              </div>

              {/* Tabela de Pré-visualização */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Número CNJ</th>
                      <th className="px-3 py-2 text-left">Polo Ativo (Autor)</th>
                      <th className="px-3 py-2 text-left">Polo Passivo (Réu)</th>
                      <th className="px-3 py-2 text-left">Vara / Órgão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processosExtraidos.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">{p.numero_cnj}</td>
                        <td className="px-3 py-2 text-slate-700 truncate max-w-[150px]">{p.titulo_polo_ativo}</td>
                        <td className="px-3 py-2 text-slate-700 truncate max-w-[150px]">{p.titulo_polo_passivo}</td>
                        <td className="px-3 py-2 text-slate-500 truncate max-w-[150px]">{p.vara || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {erro && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{erro}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-100"
          >
            Cancelar
          </button>

          {processosExtraidos.length > 0 && (
            <button
              type="button"
              disabled={salvando}
              onClick={handleSalvarNoBanco}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm"
            >
              {salvando ? (
                <>Cadastrando no Banco...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Cadastrar {processosExtraidos.length} Processos no Sistema
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
