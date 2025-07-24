import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Scale, Clock, DollarSign } from 'lucide-react';
import { mockProcesses } from '../lib/mock-data';
import { Process } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Processes: React.FC = () => {
  const [processes] = useState<Process[]>(mockProcesses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativo' | 'suspenso' | 'arquivado' | 'baixado'>('all');

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.number.includes(searchTerm) ||
                         process.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || process.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800';
      case 'arquivado':
        return 'bg-gray-100 text-gray-800';
      case 'baixado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'conhecimento':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'execução':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'recurso':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          <p className="text-gray-600">Gerencie seus processos judiciais</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Novo Processo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por número, assunto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="suspenso">Suspenso</option>
            <option value="arquivado">Arquivado</option>
            <option value="baixado">Baixado</option>
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredProcesses.length} processo{filteredProcesses.length !== 1 ? 's' : ''} encontrado{filteredProcesses.length !== 1 ? 's' : ''}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredProcesses.map((process) => (
            <div key={process.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Scale className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {process.subject}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(process.status)}`}>
                        {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="font-mono text-sm text-gray-600 mb-1">{process.number}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Cliente:</strong> {process.client.name}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span><strong>Classe:</strong> {process.class}</span>
                      <span><strong>Vara:</strong> {process.court}</span>
                      <span className={`px-2 py-1 rounded-md border text-xs ${getPhaseColor(process.phase)}`}>
                        {process.phase}
                      </span>
                    </div>
                    
                    {process.value && (
                      <div className="flex items-center space-x-1 mt-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          R$ {process.value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-right text-sm text-gray-600 hidden sm:block">
                    <p>Atualizado em</p>
                    <p className="font-medium">
                      {format(process.updatedAt, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Estatísticas do Processo */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Andamentos</p>
                  <p className="text-lg font-semibold text-gray-900">{process.movements.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tarefas</p>
                  <p className="text-lg font-semibold text-gray-900">{process.tasks.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Documentos</p>
                  <p className="text-lg font-semibold text-gray-900">{process.documents.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Dias ativo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.floor((new Date().getTime() - process.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProcesses.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum processo encontrado com os filtros aplicados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Processes;