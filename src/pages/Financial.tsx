import React, { useState } from 'react';
import { 
  Plus, Search, DollarSign, TrendingUp, TrendingDown, 
  Calendar, User, FileText, CreditCard, AlertCircle,
  CheckCircle, Clock, Filter, Download, Eye
} from 'lucide-react';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialEntry {
  id: string;
  type: 'honorario' | 'despesa' | 'receita' | 'reembolso';
  category: string;
  description: string;
  value: number;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  dueDate: Date;
  paidAt?: Date;
  processId?: string;
  processNumber?: string;
  clientId: string;
  clientName: string;
  responsibleId: string;
  responsibleName: string;
  paymentMethod?: 'dinheiro' | 'pix' | 'transferencia' | 'boleto' | 'cartao';
  installments?: number;
  currentInstallment?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  honorariosPendentes: number;
  despesasVencidas: number;
  receitasMes: number;
  crescimentoMensal: number;
}

const Financial: React.FC = () => {
  const [entries] = useState<FinancialEntry[]>([
    {
      id: '1',
      type: 'honorario',
      category: 'Honorários Contratuais',
      description: 'Honorários - Ação de Cobrança',
      value: 15000,
      status: 'pago',
      dueDate: new Date('2024-12-01'),
      paidAt: new Date('2024-12-01'),
      processId: '1',
      processNumber: '1001234-56.2024.8.05.0001',
      clientId: '1',
      clientName: 'João da Silva Santos',
      responsibleId: '1',
      responsibleName: 'Dr. João Silva',
      paymentMethod: 'transferencia',
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      type: 'despesa',
      category: 'Custas Processuais',
      description: 'Custas iniciais - TJ-BA',
      value: 500,
      status: 'pendente',
      dueDate: new Date('2024-12-30'),
      clientId: '1',
      clientName: 'João da Silva Santos',
      responsibleId: '1',
      responsibleName: 'Dr. João Silva',
      processId: '1',
      processNumber: '1001234-56.2024.8.05.0001',
      createdAt: new Date('2024-12-10'),
      updatedAt: new Date('2024-12-10'),
    },
    {
      id: '3',
      type: 'honorario',
      category: 'Honorários Êxito',
      description: 'Honorários de êxito - 20%',
      value: 25000,
      status: 'pendente',
      dueDate: new Date('2024-12-25'),
      clientId: '2',
      clientName: 'Empresa ABC Ltda',
      responsibleId: '2',
      responsibleName: 'Maria Santos',
      installments: 3,
      currentInstallment: 1,
      createdAt: new Date('2024-12-05'),
      updatedAt: new Date('2024-12-05'),
    },
    {
      id: '4',
      type: 'despesa',
      category: 'Despesas Operacionais',
      description: 'Diligências e deslocamentos',
      value: 300,
      status: 'vencido',
      dueDate: new Date('2024-12-05'),
      clientId: '1',
      clientName: 'João da Silva Santos',
      responsibleId: '1',
      responsibleName: 'Dr. João Silva',
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20'),
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'honorario' | 'despesa' | 'receita' | 'reembolso'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pendente' | 'pago' | 'vencido' | 'cancelado'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Calcular resumo financeiro
  const summary: FinancialSummary = {
    totalReceitas: entries.filter(e => e.type === 'honorario' && e.status === 'pago').reduce((sum, e) => sum + e.value, 0),
    totalDespesas: entries.filter(e => e.type === 'despesa' && e.status === 'pago').reduce((sum, e) => sum + e.value, 0),
    saldoLiquido: 0,
    honorariosPendentes: entries.filter(e => e.type === 'honorario' && e.status === 'pendente').reduce((sum, e) => sum + e.value, 0),
    despesasVencidas: entries.filter(e => e.type === 'despesa' && e.status === 'vencido').reduce((sum, e) => sum + e.value, 0),
    receitasMes: 85000,
    crescimentoMensal: 12.5
  };
  summary.saldoLiquido = summary.totalReceitas - summary.totalDespesas;

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.processNumber && entry.processNumber.includes(searchTerm));
    const matchesType = selectedType === 'all' || entry.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredEntries.length} entrada{filteredEntries.length !== 1 ? 's' : ''} encontrada{filteredEntries.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredEntries.map((entry) => {
            const StatusIcon = getStatusIcon(entry.status);
            const isOverdue = entry.status === 'pendente' && isBefore(entry.dueDate, new Date());
            
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
                        <span className="font-medium">{entry.category}</span>
                        <span>•</span>
                        <span>{entry.clientName}</span>
                        {entry.processNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{entry.processNumber}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Vence em {format(entry.dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{entry.responsibleName}</span>
                        </div>
                        {entry.installments && (
                          <span>Parcela {entry.currentInstallment}/{entry.installments}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getTypeColor(entry.type)}`}>
                        {entry.type === 'despesa' ? '-' : '+'}R$ {entry.value.toLocaleString()}
                      </p>
                      {entry.paidAt && (
                        <p className="text-sm text-gray-500">
                          Pago em {format(entry.paidAt, "dd/MM/yyyy", { locale: ptBR })}
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredEntries.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhuma entrada financeira encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Financial;