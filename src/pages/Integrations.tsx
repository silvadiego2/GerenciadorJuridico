import React, { useState } from 'react';
import { RefreshCw, Search, Download, Eye, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Process } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessSearchResult {
  id: string;
  number: string;
  cnj: string;
  subject: string;
  class: string;
  court: string;
  comarca: string;
  phase: string;
  status: 'found' | 'not_found' | 'error';
  lastUpdate: Date;
  movements: Array<{
    date: Date;
    description: string;
    type: string;
  }>;
}

const Integrations: React.FC = () => {
  const [searchType, setSearchType] = useState<'number' | 'oab' | 'cpf'>('number');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProcessSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ProcessSearchResult | null>(null);

  // Simulação de dados de integração
  const [integrationStats] = useState({
    tjba: {
      status: 'connected',
      lastSync: new Date('2024-12-10T14:30:00'),
      totalProcesses: 45,
      successRate: 98.2,
    },
    pje: {
      status: 'connected',
      lastSync: new Date('2024-12-10T14:25:00'),
      totalProcesses: 23,
      successRate: 95.7,
    },
    dje: {
      status: 'connected',
      lastSync: new Date('2024-12-10T08:00:00'),
      totalPublications: 12,
      successRate: 100,
    },
  });

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulação de busca na API do TJ-BA
    setTimeout(() => {
      const mockResults: ProcessSearchResult[] = [
        {
          id: '1',
          number: '1001234-56.2024.8.05.0001',
          cnj: '1001234-56.2024.8.05.0001',
          subject: 'Ação de Cobrança',
          class: 'Procedimento Comum',
          court: '1ª Vara Cível de Salvador',
          comarca: 'Salvador',
          phase: 'Conhecimento',
          status: 'found',
          lastUpdate: new Date('2024-12-10'),
          movements: [
            {
              date: new Date('2024-12-10'),
              description: 'Juntada de petição inicial',
              type: 'andamento',
            },
            {
              date: new Date('2024-12-08'),
              description: 'Citação expedida para o réu',
              type: 'citacao',
            },
          ],
        },
        {
          id: '2',
          number: '2002345-67.2024.8.05.0002',
          cnj: '2002345-67.2024.8.05.0002',
          subject: 'Ação Trabalhista',
          class: 'Rito Ordinário',
          court: '3ª Vara do Trabalho de Salvador',
          comarca: 'Salvador',
          phase: 'Execução',
          status: 'found',
          lastUpdate: new Date('2024-12-05'),
          movements: [
            {
              date: new Date('2024-12-05'),
              description: 'Penhora de bens realizada',
              type: 'andamento',
            },
          ],
        },
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  const handleImportProcess = (result: ProcessSearchResult) => {
    // Simulação de importação do processo
    alert(`Processo ${result.number} importado com sucesso!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600">Conecte-se com tribunais e sistemas externos</p>
      </div>

      {/* Status das Integrações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">TJ-BA</h3>
            {getStatusIcon(integrationStats.tjba.status)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={getStatusColor(integrationStats.tjba.status)}>
                Conectado
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processos:</span>
              <span className="font-medium">{integrationStats.tjba.totalProcesses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Sucesso:</span>
              <span className="font-medium">{integrationStats.tjba.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última Sync:</span>
              <span className="font-medium">
                {format(integrationStats.tjba.lastSync, 'HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">PJe</h3>
            {getStatusIcon(integrationStats.pje.status)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={getStatusColor(integrationStats.pje.status)}>
                Conectado
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processos:</span>
              <span className="font-medium">{integrationStats.pje.totalProcesses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Sucesso:</span>
              <span className="font-medium">{integrationStats.pje.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última Sync:</span>
              <span className="font-medium">
                {format(integrationStats.pje.lastSync, 'HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">DJE</h3>
            {getStatusIcon(integrationStats.dje.status)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={getStatusColor(integrationStats.dje.status)}>
                Conectado
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Publicações:</span>
              <span className="font-medium">{integrationStats.dje.totalPublications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Sucesso:</span>
              <span className="font-medium">{integrationStats.dje.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última Sync:</span>
              <span className="font-medium">
                {format(integrationStats.dje.lastSync, 'HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Busca de Processos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar Processos</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="number">Por Número</option>
            <option value="oab">Por OAB</option>
            <option value="cpf">Por CPF/CNPJ</option>
          </select>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === 'number' ? 'Digite o número do processo...' :
                searchType === 'oab' ? 'Digite o número da OAB...' :
                'Digite o CPF ou CNPJ...'
              }
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>

        {/* Resultados da Busca */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {searchResults.length} processo{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </h3>
            
            {searchResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{result.subject}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Encontrado
                      </span>
                    </div>
                    
                    <p className="font-mono text-sm text-gray-600 mb-2">{result.number}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Classe:</strong> {result.class}
                      </div>
                      <div>
                        <strong>Vara:</strong> {result.court}
                      </div>
                      <div>
                        <strong>Comarca:</strong> {result.comarca}
                      </div>
                      <div>
                        <strong>Fase:</strong> {result.phase}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Última atualização:</strong> {format(result.lastUpdate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleImportProcess(result)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Importar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Processo */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalhes do Processo</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedResult.subject}</h3>
                <p className="font-mono text-sm text-gray-600">{selectedResult.number}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Classe</label>
                  <p className="text-sm text-gray-900">{selectedResult.class}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vara</label>
                  <p className="text-sm text-gray-900">{selectedResult.court}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comarca</label>
                  <p className="text-sm text-gray-900">{selectedResult.comarca}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fase</label>
                  <p className="text-sm text-gray-900">{selectedResult.phase}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Movimentações Recentes</h4>
                <div className="space-y-3">
                  {selectedResult.movements.map((movement, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{movement.description}</p>
                        <span className="text-xs text-gray-500">
                          {format(movement.date, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{movement.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    handleImportProcess(selectedResult);
                    setSelectedResult(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Importar Processo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;