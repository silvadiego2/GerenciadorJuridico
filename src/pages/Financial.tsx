import React, { useState } from 'react';
import { 
  Plus, Search, DollarSign, TrendingUp, TrendingDown, 
  Calendar, User, FileText, CreditCard, AlertCircle,
  CheckCircle, Clock, Filter, Download, Eye, Edit, Trash2, Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '../lib/api';
import { Financial } from '../types';
import { format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FinancialModal from '../components/Financial/FinancialModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  honorariosPendentes: number;
  despesasVencidas: number;
}

const Financial: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'honorario' | 'despesa' | 'receita' | 'reembolso'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pendente' | 'pago' | 'vencido' | 'cancelado'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Financial | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query para buscar entradas financeiras
  const { data: financialData, isLoading, error: queryError } = useQuery({
    queryKey: ['financial', debouncedSearchTerm, selectedType, selectedStatus],
    queryFn: () => financialService.getAll({
      search: debouncedSearchTerm || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar resumo financeiro
  const { data: summaryData } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => financialService.getSummary(),
    staleTime: 5 * 60 * 1000,
  });

  const entries = financialData?.entries || [];
  const summary: FinancialSummary = summaryData || {
    totalReceitas: 0,
    totalDespesas: 0,
    saldoLiquido: 0,
    honorariosPendentes: 0,
    despesasVencidas: 0,
  };

  // Mutation para criar entrada
  const createEntryMutation = useMutation({
    mutationFn: financialService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      success('Sucesso', 'Entrada financeira criada com sucesso!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao criar entrada financeira');
    },
  });

  // Mutation para atualizar entrada
  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Financial> }) =>
      financialService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      success('Sucesso', 'Entrada financeira atualizada com sucesso!');
      setIsModalOpen(false);
      setEditingEntry(null);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao atualizar entrada financeira');
    },
  });

  // Mutation para deletar entrada
  const deleteEntryMutation = useMutation({
    mutationFn: financialService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      success('Sucesso', 'Entrada financeira excluída com sucesso!');
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao excluir entrada financeira');
    },
  });

  const handleCreateEntry = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: Financial) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (entryId: string, entryDescription: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a entrada "${entryDescription}"?`)) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  const handleSaveEntry = (entryData: Partial<Financial>) => {
    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data: entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'honorario':
        return 'text-green-600';
      case 'receita':
        return 'text-blue-600';
      case 'despesa':
        return 'text-red-600';
      case 'reembolso':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return CheckCircle;
      case 'pendente':
        return Clock;
      case 'vencido':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  if (queryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar dados financeiros: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Controle de honorários, despesas e receitas</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={handleCreateEntry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Entrada</span>
          </button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {summary.totalReceitas.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {summary.totalDespesas.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${summary.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {summary.saldoLiquido.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                R$ {summary.honorariosPendentes.toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por descrição, cliente ou processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="honorario">Honorários</option>
            <option value="despesa">Despesas</option>
            <option value="receita">Receitas</option>
            <option value="reembolso">Reembolsos</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Entradas Financeiras */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Carregando...' : `${entries.length} entrada${entries.length !== 1 ? 's' : ''} encontrada${entries.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando dados financeiros...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry: any) => {
              const StatusIcon = getStatusIcon(entry.status);
              const isOverdue = entry.status === 'pendente' && isBefore(new Date(entry.due_date), new Date());
              
              return (
                <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        entry.type === 'honorario' || entry.type === 'receita' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`h-6 w-6 ${getTypeColor(entry.type)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.description}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Vencido
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          {entry.category && <span className="font-medium">{entry.category}</span>}
                          <span>•</span>
                          <span>{entry.client?.name || 'Cliente não encontrado'}</span>
                          {entry.process && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{entry.process.number}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Vence em {format(new Date(entry.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          {entry.responsible && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{entry.responsible.name}</span>
                            </div>
                          )}
                          {entry.installments && entry.installments > 1 && (
                            <span>Parcela {entry.current_installment || 1}/{entry.installments}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getTypeColor(entry.type)}`}>
                          {entry.type === 'despesa' ? '-' : '+'}R$ {entry.value.toLocaleString()}
                        </p>
                        {entry.paid_at && (
                          <p className="text-sm text-gray-500">
                            Pago em {format(new Date(entry.paid_at), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-5 w-5 ${
                          entry.status === 'pago' ? 'text-green-600' :
                          entry.status === 'vencido' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEntry(entry)}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id, entry.description)}
                          disabled={deleteEntryMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleteEntryMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {entries.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhuma entrada financeira encontrada</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Entrada Financeira */}
      {isModalOpen && (
        <FinancialModal
          entry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
          }}
          isLoading={createEntryMutation.isPending || updateEntryMutation.isPending}
        />
      )}
    </div>
  );
};

export default Financial;