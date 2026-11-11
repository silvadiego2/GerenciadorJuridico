// src/pages/Financial.tsx
import React, { useState } from 'react';
import { 
  Plus, Search, DollarSign, TrendingUp, TrendingDown, 
  Calendar, User, FileText, CheckCircle, Clock, 
  Download, Eye, Edit2, Trash2, Loader2, ArrowUpRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '../lib/api';
import { Financial as FinancialType } from '../types';
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
  const [editingEntry, setEditingEntry] = useState<FinancialType | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const { data: financialData, isLoading, error: queryError } = useQuery({
    queryKey: ['financial', debouncedSearchTerm, selectedType, selectedStatus],
    queryFn: () => financialService.getAll({
      search: debouncedSearchTerm || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

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

  const createEntryMutation = useMutation({
    mutationFn: financialService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      success('Sucesso', 'Lançamento financeiro registrado com sucesso');
      setIsModalOpen(false);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao registrar lançamento')
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinancialType> }) =>
      financialService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      success('Sucesso', 'Lançamento atualizado');
      setIsModalOpen(false);
      setEditingEntry(null);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao atualizar lançamento')
  });

  const deleteEntryMutation = useMutation({
    mutationFn: financialService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      success('Sucesso', 'Lançamento removido');
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao excluir lançamento')
  });

  const handleEditEntry = (entry: FinancialType) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (entryId: string, entryDescription: string) => {
    if (window.confirm(`Excluir o lançamento "${entryDescription}"?`)) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  const handleSaveEntry = (entryData: Partial<FinancialType>) => {
    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data: entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'pendente':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'vencido':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'cancelado':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-800">
          Erro ao carregar dados financeiros: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Gestão Financeira</h1>
          <p className="text-xs text-slate-500 mt-0.5">Fluxo de caixa, honorários advocatícios e despesas processuais</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Indicadores de Fluxo (Saldos em Grelha Compacta) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Receitas Realizadas</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
            R$ {Number(summary.totalReceitas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Despesas Totais</span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
            R$ {Number(summary.totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Saldo Operacional</span>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </div>
          <p className={`mt-2 text-lg sm:text-xl font-bold font-mono tracking-tight ${summary.saldoLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            R$ {Number(summary.saldoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">A Receber / Pendente</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
            R$ {Number(summary.honorariosPendentes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar lançamentos, clientes ou processos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
        >
          <option value="all">Todas as categorias</option>
          <option value="honorario">Honorários</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
          <option value="reembolso">Reembolsos</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
        >
          <option value="all">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Liquidado</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Tabela Desktop / Cards Mobile */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isLoading ? 'Carregando lançamentos...' : `${entries.length} registro${entries.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 mx-auto mb-2" />
            Carregando extrato...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <DollarSign className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">Nenhum lançamento localizado</p>
          </div>
        ) : (
          <>
            {/* 1. Visão Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50/75 text-slate-500 font-semibold text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Descrição / Matéria</th>
                    <th className="py-2.5 px-3">Cliente / Autos</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {entries.map((entry: any) => {
                    const isExpense = entry.type === 'despesa';
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{entry.description}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{entry.type}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-slate-800 truncate max-w-[200px]">
                            {entry.client?.name || 'Não vinculado'}
                          </p>
                          {entry.process?.number && (
                            <span className="text-[11px] font-mono text-slate-500 block truncate max-w-[180px]">
                              {entry.process.number}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                          {entry.due_date ? format(new Date(entry.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm capitalize ${getStatusBadge(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-semibold text-xs ${isExpense ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {isExpense ? '-' : '+'}R$ {Number(entry.value || entry.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id, entry.description)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. Visão Mobile */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {entries.map((entry: any) => {
                const isExpense = entry.type === 'despesa';
                return (
                  <div key={entry.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-xs text-slate-900">{entry.description}</p>
                        <span className="text-[10px] font-mono uppercase text-slate-400">{entry.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-sm capitalize ${getStatusBadge(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                      <div>
                        <p className="text-[11px] text-slate-500">Vencimento: {entry.due_date ? format(new Date(entry.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}</p>
                        <p className="text-[11px] text-slate-700 font-medium truncate max-w-[180px]">{entry.client?.name || 'Cliente avulso'}</p>
                      </div>
                      <div className={`font-mono font-bold text-sm ${isExpense ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {isExpense ? '-' : '+'}R$ {Number(entry.value || entry.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-1 pt-1">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id, entry.description)}
                        className="px-2.5 py-1 text-xs border border-rose-200 text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
