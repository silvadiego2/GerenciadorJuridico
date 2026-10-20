// src/components/ConsultaProcessosOAB.tsx
import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Key, 
  Building2, 
  FileText, 
  Copy, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  User, 
  ExternalLink,
  Gavel,
  Globe,
  Info,
  X
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

// Links oficiais de consulta pública gratuita por OAB nos principais tribunais da Bahia e Federais
const TRIBUNAIS_GRATUITOS = [
  {
    nome: 'TJBA - PJe (1º e 2º Grau)',
    sigla: 'TJBA',
    descricao: 'Tribunal de Justiça da Bahia - Consulta Processual Pública',
    url: 'https://pje.tjba.jus.br/pje/ConsultaPublica/listView.seam',
  },
  {
    nome: 'TJBA - PROJUDI (Juizados Especiais)',
    sigla: 'PROJUDI',
    descricao: 'Juizados Especiais Cíveis e Fazenda Pública da Bahia',
    url: 'https://projudi.tjba.jus.br/projudi/consulta_publica.do',
  },
  {
    nome: 'TRF1 - Tribunal Regional Federal 1ª Região (BA)',
    sigla: 'TRF1',
    descricao: 'Justiça Federal da Bahia e Região Norte/Nordeste',
    url: 'https://pje1g.trf1.jus.br/consultapublica/ConsultaPublica/listView.seam',
  },
  {
    nome: 'TRT5 - Tribunal Regional do Trabalho da Bahia',
    sigla: 'TRT5',
    descricao: 'Justiça do Trabalho da Bahia',
    url: 'https://pje.trt5.jus.br/consultapublica/ConsultaPublica/listView.seam',
  },
  {
    nome: 'CNA - Cadastro Nacional dos Advogados (CFOAB)',
    sigla: 'CNA',
    descricao: 'Consulta oficial de regularidade do advogado no Conselho Federal',
    url: 'https://cna.oab.org.br/',
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
    alert('Chave salva com sucesso no navegador!');
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Consulta Processual por OAB
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pesquise processos judiciais reais via API ou consulte gratuitamente pelos portais oficiais dos tribunais.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalChaveAberto(true)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
            possuiChave 
              ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Key className="w-4 h-4 text-amber-600" />
          {possuiChave ? 'Chave de API Configurada' : 'Inserir Chave da API'}
        </button>
      </div>

      {/* Opção 1: Formulário via API */}
      <form onSubmit={handlePesquisarAPI} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-600" />
            Pesquisa Automatizada nos Tribunais (API)
          </span>
          <span className="text-[11px] text-slate-400">
            {possuiChave ? 'API pronta para consulta' : 'Requer token gratuito do Escavador'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número da OAB *
            </label>
            <input
              type="text"
              placeholder="Ex: 54321 ou 12345"
              value={numeroOab}
              onChange={e => setNumeroOab(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seccional (UF) *
            </label>
            <select
              value={ufOab}
              onChange={e => setUfOab(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              {UFS_BRASIL.map(uf => (
                <option key={uf} value={uf}>
                  {uf} {uf === 'BA' ? '(Bahia)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
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
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}
      </form>

      {/* Opção 2: Links Oficiais Gratuitos nos Tribunais */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Consulta Gratuita Direta nos Tribunais (Sem Custo de API)
            </h3>
            <p className="text-[11px] text-slate-500">
              Se não quiser utilizar créditos de API, acesse a consulta pública oficial e gratuita dos tribunais:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {TRIBUNAIS_GRATUITOS.map((tribunal, idx) => (
            <a
              key={idx}
              href={tribunal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl transition flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600">
                    {tribunal.nome}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  {tribunal.descricao}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start mt-2">
                100% Gratuito
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Resultados da Pesquisa por API (caso pesquisado) */}
      {advogado && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold">{advogado.nome}</h3>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Inscrição: OAB/{advogado.oab.uf} nº {advogado.oab.numero}
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-300 block uppercase">Processos Localizados</span>
            <span className="text-lg font-bold text-white">{advogado.quantidade_processos}</span>
          </div>
        </div>
      )}

      {/* Lista de processos retornados */}
      {processos.length > 0 && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Filtrar por número CNJ, autor ou réu..."
            value={buscaInterna}
            onChange={e => setBuscaInterna(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
          />

          <div className="space-y-3">
            {processosFiltrados.map((proc, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-400 transition space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{proc.numero_cnj}</span>
                    <button
                      type="button"
                      onClick={() => handleCopiarCnj(proc.numero_cnj)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition"
                      title="Copiar CNJ"
                    >
                      {cnjCopiado === proc.numero_cnj ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                      {proc.fontes[0]?.sigla || 'TJ'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {proc.data_inicio ? proc.data_inicio.split('-').reverse().join('/') : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Autor:</strong> {proc.titulo_polo_ativo || '-'}</div>
                  <div><strong>Réu:</strong> {proc.titulo_polo_passivo || '-'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Configuração de Chave da API */}
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
                Você pode criar uma conta gratuita no <strong>[api.escavador.com](https://api.escavador.com)</strong> para receber créditos gratuitos de teste e gerar o seu token no menu <em>Tokens de Acesso</em>.
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Personal Access Token (Bearer):
              </label>
              <input
                type="password"
                placeholder="Cole o token do Escavador aqui..."
                value={chaveApiInput}
                onChange={e => setChaveApiInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setModalChaveAberto(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSalvarChave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
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
