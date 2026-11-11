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
  User, 
  ExternalLink,
  Globe,
  Info,
  X,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  consultarProcessosPorOab, 
  obterChaveApiSalva, 
  salvarChaveApi 
} from '../services/oabService';
import { ProcessoOabItem, AdvogadoOabInfo } from '../types/oab';
import { supabase } from '../lib/supabaseClient';
import { useNotifications } from '../hooks/useNotifications';

const UFS_BRASIL = [
  'BA', 'AC', 'AL', 'AM', 'AP', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 
  'RO', 'RR', 'RS', 'SC', 'SE', 'TO'
];

const TRIBUNAIS_GRATUITOS = [
  {
    nome: 'TJBA - PJe (1º e 2º Grau)',
    sigla: 'TJBA',
    descricao: 'Consulta Pública Processual Unificada do Tribunal de Justiça da Bahia',
    url: 'https://pje.tjba.jus.br/pje/ConsultaPublica/listView.seam',
  },
  {
    nome: 'TJBA - PROJUDI',
    sigla: 'PROJUDI',
    descricao: 'Juizados Especiais Cíveis, Relações de Consumo e Fazenda Pública',
    url: 'https://projudi.tjba.jus.br/projudi/consulta_publica.do',
  },
  {
    nome: 'TRF1 - Justiça Federal (BA)',
    sigla: 'TRF1',
    descricao: 'Tribunal Regional Federal da 1ª Região (Seção Judiciária da Bahia)',
    url: 'https://pje1g.trf1.jus.br/consultapublica/ConsultaPublica/listView.seam',
  },
  {
    nome: 'TRT5 - Justiça do Trabalho',
    sigla: 'TRT5',
    descricao: 'Tribunal Regional do Trabalho da 5ª Região (Jurisdição Bahia)',
    url: 'https://pje.trt5.jus.br/consultapublica/ConsultaPublica/listView.seam',
  },
  {
    nome: 'CNA - Cadastro Nacional OAB',
    sigla: 'CFOAB',
    descricao: 'Consulta oficial de regularidade e inscrição no Conselho Federal',
    url: 'https://cna.oab.org.br/',
  },
  {
    nome: 'STJ - Tribunais Superiores',
    sigla: 'STJ',
    descricao: 'Superior Tribunal de Justiça — Consulta Pública Processual',
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

  // Estados de importação
  const [importandoId, setImportandoId] = useState<string | null>(null);
  const [importados, setImportados] = useState<Set<string>>(new Set());

  // Modal Chave API
  const [modalChaveAberto, setModalChaveAberto] = useState(false);
  const [chaveApiInput, setChaveApiInput] = useState('');
  const [possuiChave, setPossuiChave] = useState(false);

  const { success, error: notifyError } = useNotifications();

  useEffect(() => {
    const chave = obterChaveApiSalva();
    setPossuiChave(Boolean(chave));
    setChaveApiInput(chave);
  }, []);

  const handleSalvarChave = () => {
    salvarChaveApi(chaveApiInput);
    setPossuiChave(Boolean(chaveApiInput.trim()));
    setModalChaveAberto(false);
    success('Chave Salva', 'Credencial de API configurada com sucesso.');
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

  // Importar o processo localizado diretamente para o banco de dados do Supabase
  const handleImportarProcesso = async (proc: ProcessoOabItem) => {
    setImportandoId(proc.numero_cnj);
    try {
      let clientId: string | null = null;
      const autorNome = proc.titulo_polo_ativo?.trim() || '';

      // 1. Cadastra ou vincula o autor se existir
      if (autorNome && autorNome !== '-') {
        const { data: clientesExistentes } = await supabase
          .from('clients')
          .select('id')
          .ilike('name', autorNome)
          .limit(1);

        if (clientesExistentes && clientesExistentes.length > 0) {
          clientId = clientesExistentes[0].id;
        } else {
          const { data: novoCliente } = await supabase
            .from('clients')
            .insert([{
              name: autorNome,
              type: 'fisica',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (novoCliente) clientId = novoCliente.id;
        }
      }

      // 2. Insere ou atualiza o processo com os campos obrigatórios
      const payload = {
        number: proc.numero_cnj,
        title: proc.titulo_polo_passivo ? `Ação contra ${proc.titulo_polo_passivo}` : `Processo ${proc.numero_cnj}`,
        subject: `Consulta OAB - ${proc.fontes[0]?.sigla || 'TJBA'}`,
        court: proc.fontes[0]?.sigla || 'TJ-BA',
        status: 'ativo',
        phase: 'conhecimento',
        plaintiff: proc.titulo_polo_ativo || 'Não informado',
        defendant: proc.titulo_polo_passivo || 'Não informado',
        distribution_date: proc.data_inicio || null,
        client_id: clientId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('processes')
        .upsert(payload, { onConflict: 'number' });

      if (insertError) throw insertError;

      setImportados(prev => new Set(prev).add(proc.numero_cnj));
      success('Processo Importado', `Autos ${proc.numero_cnj} integrados ao acervo.`);
    } catch (err: any) {
      notifyError('Falha ao importar', err.message || 'Erro ao gravar autos no banco.');
    } finally {
      setImportandoId(null);
    }
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
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Consulta por OAB</h1>
          <p className="text-xs text-slate-500 mt-0.5">Localização de acervo forense via conectores externos ou consulta direta aos tribunais</p>
        </div>

        <button
          type="button"
          onClick={() => setModalChaveAberto(true)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition border shadow-2xs ${
            possuiChave 
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-slate-500" />
          <span>{possuiChave ? 'Chave Conectada' : 'Configurar Token API'}</span>
        </button>
      </div>

      {/* Formulário de Pesquisa */}
      <form onSubmit={handlePesquisarAPI} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            Parâmetros de Inscrição Profissional
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {possuiChave ? 'Conector ativo' : 'Requer token configurado'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Número da OAB *
            </label>
            <input
              type="text"
              placeholder="Ex: 54321 ou 12345"
              value={numeroOab}
              onChange={e => setNumeroOab(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-mono focus:bg-white focus:outline-hidden focus:border-slate-400 bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Seccional (UF) *
            </label>
            <select
              value={ufOab}
              onChange={e => setUfOab(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
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
              className="w-full px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium rounded-md transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {erro && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{erro}</span>
          </div>
        )}
      </form>

      {/* Tribunais Oficiais Gratuitos */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Acesso Direto aos Tribunais Oficiais (Gratuito)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-semibold">
            Consulta Pública TJBA / TRF / TRT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {TRIBUNAIS_GRATUITOS.map((tribunal, idx) => (
            <a
              key={idx}
              href={tribunal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-50/60 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md transition-colors flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tribunal.nome}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {tribunal.descricao}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {tribunal.sigla}
                </span>
                <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                  Portal Público
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Resumo do Advogado Localizado */}
      {advogado && (
        <div className="bg-slate-900 text-white rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-slate-100">{advogado.nome}</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Inscrição: OAB/{advogado.oab.uf} nº {advogado.oab.numero}
            </p>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Autos no Conector</span>
            <span className="text-base font-bold font-mono text-white">{advogado.quantidade_processos}</span>
          </div>
        </div>
      )}

      {/* Lista de Processos Localizados */}
      {processos.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por número CNJ, autor ou réu..."
                value={buscaInterna}
                onChange={e => setBuscaInterna(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {processosFiltrados.length} processo(s) localizado(s)
              </h2>
            </div>

            {/* Visão Desktop: Tabela de Alta Densidade */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50/75 text-slate-500 font-semibold text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Processo (CNJ)</th>
                    <th className="py-2.5 px-3">Autor (Polo Ativo)</th>
                    <th className="py-2.5 px-3">Réu (Polo Passivo)</th>
                    <th className="py-2.5 px-3">Distribuição</th>
                    <th className="py-2.5 px-3">Fonte</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {processosFiltrados.map((proc, idx) => {
                    const jaImportado = importados.has(proc.numero_cnj);
                    const estaImportando = importandoId === proc.numero_cnj;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-medium text-slate-900">{proc.numero_cnj}</span>
                            <button
                              type="button"
                              onClick={() => handleCopiarCnj(proc.numero_cnj)}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded transition"
                              title="Copiar CNJ"
                            >
                              {cnjCopiado === proc.numero_cnj ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-[200px]">
                          {proc.titulo_polo_ativo || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[200px]">
                          {proc.titulo_polo_passivo || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {proc.data_inicio ? proc.data_inicio.split('-').reverse().join('/') : '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                            {proc.fontes[0]?.sigla || 'TJ'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleImportarProcesso(proc)}
                            disabled={jaImportado || estaImportando}
                            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center gap-1 ml-auto shadow-2xs ${
                              jaImportado
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {estaImportando ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Importando</span>
                              </>
                            ) : jaImportado ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>No Acervo</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" />
                                <span>Importar</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visão Mobile: Cards Empilhados */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {processosFiltrados.map((proc, idx) => {
                const jaImportado = importados.has(proc.numero_cnj);
                const estaImportando = importandoId === proc.numero_cnj;

                return (
                  <div key={idx} className="p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900">{proc.numero_cnj}</span>
                      <button
                        type="button"
                        onClick={() => handleCopiarCnj(proc.numero_cnj)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        {cnjCopiado === proc.numero_cnj ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Autor:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">{proc.titulo_polo_ativo || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Réu:</span>
                        <span className="text-slate-700 truncate max-w-[200px]">{proc.titulo_polo_passivo || '-'}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        <span>Distr: {proc.data_inicio ? proc.data_inicio.split('-').reverse().join('/') : '-'}</span>
                        <span>{proc.fontes[0]?.sigla || 'TJBA'}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleImportarProcesso(proc)}
                        disabled={jaImportado || estaImportando}
                        className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                          jaImportado
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {estaImportando ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : jaImportado ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span>{jaImportado ? 'No Acervo' : 'Importar ao Sistema'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Chave API */}
      {modalChaveAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 shadow-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-500" />
                Token da API (Escavador)
              </h3>
              <button
                type="button"
                onClick={() => setModalChaveAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed">
              Para buscas automáticas nos diários e tribunais via API, insira o seu token pessoal gerado no painel da API:
            </p>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                Personal Access Token (Bearer):
              </label>
              <input
                type="password"
                placeholder="Cole o token aqui..."
                value={chaveApiInput}
                onChange={e => setChaveApiInput(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-mono focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalChaveAberto(false)}
                className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarChave}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium"
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
