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
  Calendar,
  Layers,
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

export const ConsultaProcessosOAB: React.FC = () => {
  const [numeroOab, setNumeroOab] = useState('');
  const [ufOab, setUfOab] = useState('BA');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Resultados
  const [advogado, setAdvogado] = useState<AdvogadoOabInfo | null>(null);
  const [processos, setProcessos] = useState<ProcessoOabItem[]>([]);
  const [buscaInterna, setBuscaInterna] = useState('');
  const [filtroTribunal, setFiltroTribunal] = useState<string>('TODOS');

  // Gerenciamento de Chave da API
  const [modalChaveAberto, setModalChaveAberto] = useState(false);
  const [chaveApiInput, setChaveApiInput] = useState('');
  const [possuiChave, setPossuiChave] = useState(false);
  const [cnjCopiado, setCnjCopiado] = useState<string | null>(null);

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

  const handlePesquisar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!possuiChave) {
      setModalChaveAberto(true);
      return;
    }

    if (!numeroOab.trim()) {
      setErro('Informe o número de inscrição da OAB.');
      return;
    }

    setCarregando(true);
    setAdvogado(null);
    setProcessos([]);

    const resultado = await consultarProcessosPorOab(numeroOab, ufOab);

    setCarregando(false);
    if (!resultado.sucesso) {
      setErro(resultado.mensagem || 'Não foi possível buscar os processos.');
      if (resultado.mensagem?.includes('Chave de API')) {
        setModalChaveAberto(true);
      }
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

  // Filtragem local
  const processosFiltrados = processos.filter(p => {
    const termo = buscaInterna.toLowerCase();
    const matchTermo = 
      p.numero_cnj.toLowerCase().includes(termo) ||
      (p.titulo_polo_ativo && p.titulo_polo_ativo.toLowerCase().includes(termo)) ||
      (p.titulo_polo_passivo && p.titulo_polo_passivo.toLowerCase().includes(termo)) ||
      p.fontes.some(f => f.capa?.assunto?.toLowerCase().includes(termo) || f.sigla.toLowerCase().includes(termo));

    if (!matchTermo) return false;

    if (filtroTribunal !== 'TODOS') {
      return p.fontes.some(f => f.sigla.toUpperCase() === filtroTribunal.toUpperCase());
    }

    return true;
  });

  // Tribunais únicos encontrados na busca
  const tribunaisDisponiveis = Array.from(
    new Set(processos.flatMap(p => p.fontes.map(f => f.sigla.toUpperCase())))
  );

  // Exportação Excel (.xls)
  const handleExportarExcel = () => {
    if (processosFiltrados.length === 0) return;

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px; }
          th { background-color: #0f172a; color: #ffffff; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: top; }
          .zebra { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <h2>Relatório de Processos Judiciais por OAB</h2>
        <p>Advogado(a): <b>${advogado?.nome || 'OAB/' + ufOab + ' ' + numeroOab}</b> | Total: ${processosFiltrados.length}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Número CNJ</th>
              <th>Pólo Ativo (Autor)</th>
              <th>Pólo Passivo (Réu)</th>
              <th>Tribunal</th>
              <th>Órgão Julgador / Comarca</th>
              <th>Classe / Assunto</th>
              <th>Data Início</th>
              <th>Última Movimentação</th>
            </tr>
          </thead>
          <tbody>
            ${processosFiltrados.map((p, idx) => {
              const fonte = p.fontes[0] || {};
              const capa = fonte.capa || {};
              return `
                <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
                  <td>${idx + 1}</td>
                  <td><b>${p.numero_cnj}</b></td>
                  <td>${p.titulo_polo_ativo || '-'}</td>
                  <td>${p.titulo_polo_passivo || '-'}</td>
                  <td>${fonte.sigla || '-'}</td>
                  <td>${capa.orgao_julgador \vert{}\vert{} '-'} (${capa.comarca || '-'})</td>
                  <td>${capa.classe \vert{}\vert{} '-'} -${capa.assunto || '-'}</td>
                  <td>${p.data_inicio ? p.data_inicio.split('-').reverse().join('/') : '-'}</td>
                  <td>${p.data_ultima_movimentacao ? p.data_ultima_movimentacao.split('-').reverse().join('/') : '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Processos_OAB_${ufOab}_${numeroOab}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Consulta Processual Real por OAB
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pesquisa de processos judiciais reais vinculados ao advogado em tribunais de todo o Brasil (TJBA, TRF1, TRT5, TJSP, STJ, etc.).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalChaveAberto(true)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
            possuiChave 
              ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              : 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 animate-pulse'
          }`}
        >
          <Key className="w-4 h-4 text-amber-600" />
          {possuiChave ? 'Chave de API Configurada' : 'Configurar Chave da API'}
        </button>
      </div>

      {/* Formulário de Busca */}
      <form onSubmit={handlePesquisar} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número da Inscrição na OAB *
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
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Pesquisar Processos
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Erro */}
      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Cartão de Identificação do Advogado */}
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

          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-300 block uppercase">Processos Localizados</span>
              <span className="text-lg font-bold text-white">{advogado.quantidade_processos}</span>
            </div>

            {processosFiltrados.length > 0 && (
              <button
                type="button"
                onClick={handleExportarExcel}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Excel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de Processos */}
      {processos.length > 0 && (
        <div className="space-y-4">
          {/* Filtros da lista retornada */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por número CNJ, autor, réu, comarca ou assunto..."
                value={buscaInterna}
                onChange={e => setBuscaInterna(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {tribunaisDisponiveis.length > 1 && (
              <select
                value={filtroTribunal}
                onChange={e => setFiltroTribunal(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="TODOS">Todos os Tribunais</option>
                {tribunaisDisponiveis.map(sigla => (
                  <option key={sigla} value={sigla}>{sigla}</option>
                ))}
              </select>
            )}
          </div>

          {/* Cards dos Processos */}
          <div className="space-y-3">
            {processosFiltrados.map((proc, idx) => {
              const fontePrincipal = proc.fontes[0] || {};
              const capa = fontePrincipal.capa || {};

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-3"
                >
                  {/* Topo do card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {proc.numero_cnj}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopiarCnj(proc.numero_cnj)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                        title="Copiar número CNJ"
                      >
                        {cnjCopiado === proc.numero_cnj ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {fontePrincipal.sigla || 'TJ'}
                      </span>
                      {fontePrincipal.grau_formatado && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                          {fontePrincipal.grau_formatado}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Início: {proc.data_inicio ? proc.data_inicio.split('-').reverse().join('/') : '-'}
                    </div>
                  </div>

                  {/* Polos Processuais (Autor x Réu) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Pólo Ativo (Autor / Exequente):</span>
                      <span className="font-semibold text-slate-800">{proc.titulo_polo_ativo || 'Não informado'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Pólo Passivo (Réu / Executado):</span>
                      <span className="font-semibold text-slate-800">{proc.titulo_polo_passivo || 'Não informado'}</span>
                    </div>
                  </div>

                  {/* Detalhes da Vara e Assunto */}
                  <div className="text-xs text-slate-600 space-y-1">
                    {capa.orgao_julgador && (
                      <div>
                        <strong>Órgão Julgador:</strong> {capa.orgao_julgador} {capa.comarca ? `— Comarca de ${capa.comarca}` : ''}
                      </div>
                    )}
                    {capa.classe && (
                      <div>
                        <strong>Classe / Assunto:</strong> {capa.classe} {capa.assunto ? `— ${capa.assunto}` : ''}
                      </div>
                    )}
                    {proc.data_ultima_movimentacao && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        Última movimentação registrada: {proc.data_ultima_movimentacao.split('-').reverse().join('/')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL PARA CONFIGURAR A CHAVE DA API */}
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
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para realizar pesquisas de processos reais por OAB em tempo real nos tribunais de todo o Brasil, insira o seu <strong>Personal Access Token (Bearer Token)</strong> da API do <strong>[Escavador](https://api.escavador.com)</strong>.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Token da API Escavador v2:
              </label>
              <input
                type="password"
                placeholder="Cole seu token aqui (ex: 1234|abcdef...)"
                value={chaveApiInput}
                onChange={e => setChaveApiInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                A chave fica salva de forma segura apenas no seu navegador (`localStorage`).
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setModalChaveAberto(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
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
