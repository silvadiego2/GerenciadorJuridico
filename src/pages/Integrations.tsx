import React, { useState } from 'react';
import { 
  RefreshCw, Search, Download, Eye, AlertCircle, CheckCircle, Clock, 
  ExternalLink, Settings, Key, FileText, BarChart3, Globe, Shield,
  Database, Zap, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { dataJudService, DataJudProcess, DataJudTribunal } from '../lib/integrations/datajud-service';
import { tjbaTransparencyService, TJBAIndicator, TJBAMeta } from '../lib/integrations/tjba-transparency';
import { pjeSOAPService, PJEProcessSOAP } from '../lib/integrations/pje-soap';

type IntegrationType = 'datajud' | 'tjba-transparency' | 'pje-soap';

interface SearchResult {
  id: string;
  source: IntegrationType;
  data: DataJudProcess | PJEProcessSOAP | any;
  timestamp: Date;
}

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'config' | 'dashboard'>('search');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>('datajud');
  const [searchParams, setSearchParams] = useState({
    numeroProcesso: '',
    tribunal: 'tjba',
    oab: '',
    cpf: '',
    apiKey: ''
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  // Estados para dashboard
  const [indicators, setIndicators] = useState<TJBAIndicator[]>([]);
  const [metas, setMetas] = useState<TJBAMeta[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Configurações das integrações
  const [integrationConfigs, setIntegrationConfigs] = useState({
    datajud: { apiKey: '', active: false },
    tjbaTransparency: { active: true },
    pjeSOAP: { 
      tribunal: '',
      usuario: '',
      senha: '',
      certificado: null as File | null,
      active: false 
    }
  });

  const tribunais = dataJudService.getTribunais();

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      let result: SearchResult | null = null;
      
      switch (selectedIntegration) {
        case 'datajud':
          if (!searchParams.apiKey) {
            alert('API Key do DataJud é obrigatória');
            return;
          }
          
          const dataJudResult = await dataJudService.searchProcess({
            numeroProcesso: searchParams.numeroProcesso,
            tribunal: searchParams.tribunal,
            apiKey: searchParams.apiKey
          });
          
          if (dataJudResult) {
            result = {
              id: Date.now().toString(),
              source: 'datajud',
              data: dataJudResult,
              timestamp: new Date()
            };
          }
          break;
          
        case 'pje-soap':
          // Configurar PJe se necessário
          if (!pjeSOAPService.getConfig(searchParams.tribunal)) {
            pjeSOAPService.addConfig(searchParams.tribunal, {
              wsdlUrl: `https://pje.${searchParams.tribunal}.jus.br/pje/intercomunicacao?wsdl`,
              usuario: integrationConfigs.pjeSOAP.usuario,
              senha: integrationConfigs.pjeSOAP.senha,
              tribunal: searchParams.tribunal,
              grau: '1'
            });
          }
          
          const pjeResults = await pjeSOAPService.searchProcesses(searchParams.tribunal, {
            numeroProcesso: searchParams.numeroProcesso,
            numeroOAB: searchParams.oab,
            cpfCnpj: searchParams.cpf
          });
          
          if (pjeResults.length > 0) {
            result = {
              id: Date.now().toString(),
              source: 'pje-soap',
              data: pjeResults[0],
              timestamp: new Date()
            };
          }
          break;
      }
      
      if (result) {
        setSearchResults([result]);
      } else {
        alert('Nenhum processo encontrado');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao realizar busca');
    } finally {
      setIsSearching(false);
    }
  };

  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const [indicatorsData, metasData] = await Promise.all([
        tjbaTransparencyService.getIndicadores(),
        tjbaTransparencyService.getMetas()
      ]);
      
      setIndicators(indicatorsData);
      setMetas(metasData);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const getIntegrationIcon = (type: IntegrationType) => {
    switch (type) {
      case 'datajud': return Database;
      case 'tjba-transparency': return BarChart3;
      case 'pje-soap': return Shield;
      default: return Globe;
    }
  };

  const getIntegrationName = (type: IntegrationType) => {
    switch (type) {
      case 'datajud': return 'API CNJ DataJud (REST)';
      case 'tjba-transparency': return 'API Transparência TJ-BA (REST)';
      case 'pje-soap': return 'PJe (SOAP Oficial)';
      default: return 'Integração';
    }
  };

  const renderSearchForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar Processos</h2>
      
      {/* Seleção de Integração */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione a Integração
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['datajud', 'tjba-transparency', 'pje-soap'] as IntegrationType[]).map((type) => {
            const Icon = getIntegrationIcon(type);
            return (
              <button
                key={type}
                onClick={() => setSelectedIntegration(type)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedIntegration === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">{getIntegrationName(type)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulário de Busca */}
      <div className="space-y-4">
        {selectedIntegration === 'datajud' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key DataJud *
                </label>
                <input
                  type="password"
                  value={searchParams.apiKey}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sua chave da API DataJud"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tribunal
                </label>
                <select
                  value={searchParams.tribunal}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, tribunal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tribunais.map((tribunal) => (
                    <option key={tribunal.sigla} value={tribunal.sigla}>
                      {tribunal.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do Processo
            </label>
            <input
              type="text"
              value={searchParams.numeroProcesso}
              onChange={(e) => setSearchParams(prev => ({ ...prev, numeroProcesso: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0000000-00.0000.0.00.0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OAB
            </label>
            <input
              type="text"
              value={searchParams.oab}
              onChange={(e) => setSearchParams(prev => ({ ...prev, oab: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="BA 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF/CNPJ
            </label>
            <input
              type="text"
              value={searchParams.cpf}
              onChange={(e) => setSearchParams(prev => ({ ...prev, cpf: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isSearching ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
        </button>
      </div>

      {/* Resultados */}
      {searchResults.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Resultados Encontrados
          </h3>
          
          {searchResults.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {getIntegrationName(result.source)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(result.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {result.data.numeroProcesso || 'Processo encontrado'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Classe:</strong> {result.data.classe?.nome || result.data.classeProcessual?.nome || 'N/A'}
                    </div>
                    <div>
                      <strong>Órgão:</strong> {result.data.orgaoJulgador?.nome || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedResult(result)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                    Importar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard de Transparência TJ-BA</h2>
          <button
            onClick={loadDashboard}
            disabled={loadingDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {loadingDashboard ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            <span>Atualizar Dados</span>
          </button>
        </div>

        {/* Indicadores */}
        {indicators.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Desempenho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicators.map((indicator) => (
                <div key={indicator.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{indicator.nome}</h4>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {indicator.valor.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">{indicator.unidade}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Período: {indicator.periodo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metas */}
        {metas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas do CNJ</h3>
            <div className="space-y-4">
              {metas.map((meta) => (
                <div key={meta.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Meta {meta.numero}: {meta.descricao}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      meta.status === 'cumprida' ? 'bg-green-100 text-green-800' :
                      meta.status === 'nao_cumprida' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {meta.status === 'cumprida' ? 'Cumprida' :
                       meta.status === 'nao_cumprida' ? 'Não Cumprida' : 'Em Andamento'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${
                        meta.percentualAlcancado >= 100 ? 'bg-green-500' :
                        meta.percentualAlcancado >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(meta.percentualAlcancado, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {meta.percentualAlcancado.toFixed(1)}% alcançado ({meta.valorAlcancado} de {meta.valorMeta})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrações Judiciais</h1>
        <p className="text-gray-600">Conecte-se com APIs oficiais dos tribunais</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'search', name: 'Busca de Processos', icon: Search },
            { id: 'dashboard', name: 'Dashboard Transparência', icon: BarChart3 },
            { id: 'config', name: 'Configurações', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'search' && renderSearchForm()}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações das Integrações</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">DataJud CNJ</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure sua chave de API para acessar dados públicos dos tribunais brasileiros.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua chave da API DataJud"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>• Obtenha sua chave em: <a href="https://datajud-wiki.cnj.jus.br" className="text-blue-600 hover:underline">datajud-wiki.cnj.jus.br</a></p>
                  <p>• A API é pública e gratuita para consultas básicas</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">PJe SOAP</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure certificado digital e credenciais para acesso aos web services oficiais.
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuário
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Usuário do sistema"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Senha do sistema"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificado Digital (.pfx)
                  </label>
                  <input
                    type="file"
                    accept=".pfx,.p12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>• Certificado digital A1 ou A3 válido é obrigatório</p>
                  <p>• Credenciais devem ser fornecidas pelo tribunal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalhes do Processo</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(selectedResult.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;