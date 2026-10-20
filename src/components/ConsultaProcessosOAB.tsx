// src/components/ConsultaProcessosOAB.tsx
import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Key, 
  Building2, 
  Copy, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  User, 
  ExternalLink,
  Globe,
  Info,
  X,
  ShieldCheck,
  Gavel
} from 'lucide-react';
import { 
  consultarProcessosPorOab, 
  obterChaveApiSalva, 
  salvarChaveApi 
} from '../services/oabService';
import { ProcessoOabItem, AdvogadoOabInfo } from '../types/oab';

const UFS_BRASIL = [
  'BA', 'AC', 'AL', 'AM', 'AP', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

// 6 Tribunais balanceados em grade 3x2 (sem deixar buraco em branco na tela)
const TRIBUNAIS_GRATUITOS = [
  {
    nome: 'TJBA - PJe (1º e 2º Grau)',
    sigla: 'TJBA',
    descricao: 'Tribunal de Justiça da Bahia — Consulta Pública Processual Oficial',
    url: 'https://pje.tjba.jus.br/pje/ConsultaPublica/listView.seam',
  },
  {
    nome: 'TJBA - PROJUDI',
    sigla: 'PROJUDI',
    descricao: 'Juizados Especiais Cíveis, Consumidor e Fazenda Pública da Bahia',
    url: 'https://projudi.tjba.jus.br/projudi/consulta_publica.do',
  },
  {
    nome: 'TRF1 - Justiça Federal (BA)',
    sigla: 'TRF1',
    descricao: 'Tribunal Regional Federal da 1ª Região (Bahia e Distrito Federal)',
    url: 'https://pje1g.trf1.jus.br/consultapublica/ConsultaPublica/listView.seam',
  },
  {
    nome: 'TRT5 - Justiça do Trabalho',
    sigla: 'TRT5',
    descricao: 'Tribunal Regional do Trabalho da 5ª Região (Varas da Bahia)',
    url: 'https://pje.trt5.jus.br/consultapublica/ConsultaPublica/listView.seam',
  },
  {
    nome: 'CNA - Cadastro Nacional OAB',
    sigla: 'CFOAB',
    descricao: 'Consulta oficial de regularidade e cadastro do advogado no Conselho Federal',
    url: 'https://cna.oab.org.br/',
  },
  {
    nome: 'STJ - Tribunais Superiores',
    sigla: 'STJ',
    descricao: 'Superior Tribunal de Justiça — Consulta Pública Unificada de Processos',
    url: 'https://processo.stj.jus.br/processo/pesquisa/',
  },
];

export const ConsultaProcessosOAB: React.FC = () => {
  const [numeroOab, setNumeroOab] = useState('');
  const [ufOab, setUfOab] = useState('BA');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [advogado, setAdvogado] = useState<AdvogadoOabInfo | null>(null);
  const [processos, setProcessos] = useState<ProcessoOabItem[]>([]);
  const [buscaInterna, setBuscaInterna] = useState('');
  const [cnjCopiado, setCnjCopiado] = useState<string | null>(null);

  // Modal Chave API
  const [modalChaveAberto, setModalChaveAberto] = useState(false);
  const [chaveApiInput, setChaveApiInput] = useState('');
  const [possuiChave, setPossuiChave] = useState(false);

  useEffect(() => {
    const chave = obterChaveApiSalva();
    setPossuiChave(Boolean(chave));
    setChaveApiInput(chave);
  }, []);

  const handleSalvarChave = () => {
    salvarChaveApi(chaveApiInput);
    setPossuiChave(Boolean(chaveApiInput.trim()));
    setModalChaveAberto(false);
    alert('Chave de API salva com sucesso no navegador!');
  };

  const handlePesquisarAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!possuiChave) {
      setModalChaveAberto(true);
      return;
    }

    if (!numeroOab.trim()) {
      setErro('Informe o número da OAB.');
      return;
    }

    setCarregando(true);
    setAdvogado(null);
    setProcessos([]);

    const resultado = await consultarProcessosPorOab(numeroOab, ufOab);
    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.mensagem || 'Falha ao buscar processos.');
    } else {
      setAdvogado(resultado.advogado || null);
      setProcessos(resultado.processos);
    }
  };

  const handleCopiarCnj = (cnj: string) => {
    navigator.clipboard.writeText(cnj);
    setCnjCopiado(cnj);
    setTimeout(() => setCnjCopiado(null), 2000);
  };

  const processosFiltrados = processos.filter(p => {
    const termo = buscaInterna.toLowerCase();
    return (
      p.numero_cnj.toLowerCase().includes(termo) ||
      (p.titulo_polo_ativo && p.titulo_polo_ativo.toLowerCase().includes(termo)) ||
      (p.titulo_polo_passivo && p.titulo_polo_passivo.toLowerCase().includes(termo))
    );
  });

  return (
    // CONTAINER COM MARGENS E PADDING CORRIGIDOS
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Cabeçalho da Página com alinhamento refinado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm flex-shrink-0">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Consulta Processual por OAB
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Pesquise processos judiciais reais via API ou consulte gratuitamente pelos portais oficiais dos tribunais.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalChaveAberto(true)}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border shadow-xs flex-shrink-0 ${
            possuiChave 
              ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 ring-2 ring-amber-300/50'
          }`}
        >
          <Key className="w-4 h-4 text-amber-600" />
          {possuiChave ? 'Chave API Configurada' : 'Configurar Chave da API'}
        </button>
      </div>

      {/* Card 1: Formulário de Pesquisa via API */}
      <form onSubmit={handlePesquisarAPI} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            Pesquisa Automatizada nos Tribunais (API)
          </span>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {possuiChave ? '✓ Chave conectada' : 'Requer token gratuito do Escavador'}
          </span>
        </div>

        {/* Grade de Campos com Alturas Padronizadas (h-11) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Número da OAB *
            </label>
            <input
              type="text"
              placeholder="Ex: 54321 ou 12345"
              value={numeroOab}
              onChange={e => setNumeroOab(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Seccional (UF) *
            </label>
            <select
              value={ufOab}
              onChange={e => setUfOab(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition"
            >
              {UFS_BRASIL.map(uf => (
                <option key={uf} value={uf}>
                  {uf} {uf === 'BA' ? '(Bahia)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={carregando}
              className="w-full h-11 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {carregando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Pesquisar na API
                </>
              )}
            </button>
          </div>
        </div>

        {erro && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}
      </form>

      {/* Card 2: Consulta Gratuita Direta nos Tribunais (6 cards equilibrados) */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Consulta Gratuita Direta nos Tribunais (Sem Custo de API)
              </h3>
              <p className="text-xs text-slate-500">
                Acesse a consulta pública oficial e gratuita dos tribunais sem consumir créditos:
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
            100% Gratuito & Ilimitado
          </span>
        </div>

        {/* Grade 3x2 no desktop (perfeitamente preenchida) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {TRIBUNAIS_GRATUITOS.map((tribunal, idx) => (
            <a
              key={idx}
              href={tribunal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-2xl transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tribunal.nome}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors mt-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  {tribunal.descricao}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {tribunal.sigla}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Acesso Oficial
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Resultados da Pesquisa por API (caso pesquisado) */}
      {advogado && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold">{advogado.nome}</h3>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Inscrição: OAB/{advogado.oab.uf} nº {advogado.oab.numero}
            </p>
          </div>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-300 block uppercase font-medium">Processos Localizados</span>
            <span className="text-xl font-bold text-white">{advogado.quantidade_processos}</span>
          </div>
        </div>
      )}

      {/* Lista de Processos retornados da API */}
      {processos.length > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar processos por número CNJ, autor ou réu..."
              value={buscaInterna}
              onChange={e => setBuscaInterna(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="space-y-3">
            {processosFiltrados.map((proc, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-slate-900">{proc.numero_cnj}</span>
                    <button
                      type="button"
                      onClick={() => handleCopiarCnj(proc.numero_cnj)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                      title="Copiar CNJ"
                    >
                      {cnjCopiado === proc.numero_cnj ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {proc.fontes[0]?.sigla || 'TJ'}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">
                    {proc.data_inicio ? `Distribuído em: ${proc.data_inicio.split('-').reverse().join('/')}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-500 block text-[10px] uppercase">Autor / Polo Ativo:</strong>
                    <span className="text-slate-800 font-semibold">{proc.titulo_polo_ativo || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-500 block text-[10px] uppercase">Réu / Polo Passivo:</strong>
                    <span className="text-slate-800 font-semibold">{proc.titulo_polo_passivo || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Configuração de Chave API */}
      {modalChaveAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Configurar Chave da API (Escavador)
              </h3>
              <button
                type="button"
                onClick={() => setModalChaveAberto(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                Crie uma conta gratuita em <strong>[api.escavador.com](https://api.escavador.com)</strong> para receber créditos de teste e gerar seu token no menu <em>Tokens de Acesso</em>.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Personal Access Token (Bearer):
              </label>
              <input
                type="password"
                placeholder="Cole o token do Escavador aqui..."
                value={chaveApiInput}
                onChange={e => setChaveApiInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalChaveAberto(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSalvarChave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
