// src/pages/Integrations.tsx
import React, { useState } from 'react';
import { 
  Search, RefreshCw, Database, Shield, BarChart3, 
  ExternalLink, Key, CheckCircle, AlertCircle, Eye
} from 'lucide-react';
import { dataJudService } from '../lib/integrations/datajud-service';
import { pjeSOAPService } from '../lib/integrations/pje-soap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'config'>('search');
  const [selectedIntegration, setSelectedIntegration] = useState<'datajud' | 'pje-soap'>('datajud');
  const [searchParams, setSearchParams] = useState({
    numeroProcesso: '',
    tribunal: 'tjba',
    apiKey: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const tribunais = dataJudService.getTribunais();

  const handleSearch = async () => {
    if (!searchParams.numeroProcesso.trim()) {
      alert('Informe o número do processo');
      return;
    }
    setIsSearching(true);
    setResults([]);
    try {
      if (selectedIntegration === 'datajud') {
        const res = await dataJudService.searchProcess({
          numeroProcesso: searchParams.numeroProcesso,
          tribunal: searchParams.tribunal,
          apiKey: searchParams.apiKey || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
        });
        if (res) setResults([res]);
        else alert('Processo não localizado na base DataJud');
      }
    } catch (e: any) {
      alert(`Falha na consulta: ${e.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Conectores e Integrações</h1>
          <p className="text-xs text-slate-500 mt-0.5">Integrações diretas com a API Pública DataJud (CNJ) e Web Services dos Tribunais</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'search' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Consulta Oficial
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'config' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Credenciais e Chaves
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Parâmetros de Consulta Forense</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número do Processo (CNJ)</label>
                <input
                  type="text"
                  placeholder="0000000-00.0000.8.05.0000"
                  value={searchParams.numeroProcesso}
                  onChange={(e) => setSearchParams({ ...searchParams, numeroProcesso: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tribunal de Destino</label>
                <select
                  value={searchParams.tribunal}
                  onChange={(e) => setSearchParams({ ...searchParams, tribunal: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  {tribunais.map(t => (
                    <option key={t.sigla} value={t.sigla}>{t.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                <span>Buscar na Base Nacional</span>
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3 text-xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Dados Retornados</span>
              <pre className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono text-slate-800 overflow-x-auto">
                {JSON.stringify(results[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Chave Pública DataJud CNJ</h3>
            <p className="text-slate-500 text-[11px] mb-2">Acesso aos dados abertos dos tribunais conforme Resolução CNJ nº 331/2020.</p>
            <input
              type="password"
              placeholder="API Key DataJud (Opcional se usar a chave pública padrão)"
              className="w-full max-w-md px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
