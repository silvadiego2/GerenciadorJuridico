// src/components/Financial/FinancialModal.tsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, User, Calendar, FileText, CreditCard, Hash, MessageSquare, Scale } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Financial, Client, Process, User as UserType } from '../../types';
import { clientsService, processesService, usersService } from '../../lib/api';
import { format } from 'date-fns';

interface FinancialModalProps {
  entry: Financial | null;
  onSave: (entryData: Partial<Financial>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const FinancialModal: React.FC<FinancialModalProps> = ({ entry, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    type: 'honorario' as 'honorario' | 'despesa' | 'receita' | 'reembolso',
    category: '',
    description: '',
    value: '',
    status: 'pendente' as 'pendente' | 'pago' | 'vencido' | 'cancelado',
    dueDate: '',
    paidAt: '',
    processId: '',
    clientId: '',
    responsibleId: '',
    paymentMethod: '' as '' | 'dinheiro' | 'pix' | 'transferencia' | 'boleto' | 'cartao',
    installments: '',
    currentInstallment: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getAll(),
  });

  const { data: processesData, isLoading: loadingProcesses } = useQuery({
    queryKey: ['processes'],
    queryFn: () => processesService.getAll(),
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });

  const clients = clientsData?.clients || [];
  const processes = processesData?.processes || [];
  const users = usersData || [];

  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type,
        category: entry.category || '',
        description: entry.description,
        value: entry.value.toString(),
        status: entry.status,
        dueDate: entry.dueDate ? format(new Date(entry.dueDate), "yyyy-MM-dd'T'HH:mm") : '',
        paidAt: entry.paidAt ? format(new Date(entry.paidAt), "yyyy-MM-dd'T'HH:mm") : '',
        processId: entry.processId || '',
        clientId: entry.clientId || '',
        responsibleId: entry.responsibleId || '',
        paymentMethod: entry.paymentMethod || '',
        installments: entry.installments?.toString() || '',
        currentInstallment: entry.currentInstallment?.toString() || '',
        notes: entry.notes || '',
      });
    } else {
      setFormData({
        type: 'honorario',
        category: '',
        description: '',
        value: '',
        status: 'pendente',
        dueDate: '',
        paidAt: '',
        processId: '',
        clientId: '',
        responsibleId: '',
        paymentMethod: '',
        installments: '',
        currentInstallment: '',
        notes: '',
      });
    }
  }, [entry]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }

    if (formData.status === 'pago' && !formData.paidAt) {
      newErrors.paidAt = 'Data de liquidação é obrigatória para status "Pago"';
    }

    if (formData.installments && parseInt(formData.installments) > 1 && !formData.currentInstallment) {
      newErrors.currentInstallment = 'Informe a parcela atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const entryData = {
        type: formData.type,
        category: formData.category || null,
        description: formData.description,
        value: parseFloat(formData.value),
        status: formData.status,
        due_date: new Date(formData.dueDate).toISOString(),
        paid_at: formData.paidAt ? new Date(formData.paidAt).toISOString() : null,
        process_id: formData.processId || null,
        client_id: formData.clientId,
        responsible_id: formData.responsibleId || null,
        payment_method: formData.paymentMethod || null,
        installments: formData.installments ? parseInt(formData.installments) : null,
        current_installment: formData.currentInstallment ? parseInt(formData.currentInstallment) : null,
        notes: formData.notes || null,
      };
      onSave(entryData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCategoryOptions = (type: string) => {
    switch (type) {
      case 'honorario':
        return ['Honorários Contratuais', 'Honorários de Êxito', 'Honorários Avulsos', 'Honorários Sucumbenciais'];
      case 'despesa':
        return ['Custas Processuais', 'Diligências', 'Perícias', 'Despesas Operacionais', 'Outros'];
      case 'receita':
        return ['Consultoria', 'Pareceres', 'Outros Serviços'];
      case 'reembolso':
        return ['Reembolso de Custas', 'Reembolso de Despesas', 'Outros Reembolsos'];
      default:
        return [];
    }
  };

  const isDespesa = formData.type === 'despesa';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {entry ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
              </h2>
              <p className="text-[11px] text-slate-400">Honorários, custas, despesas e reembolsos do escritório</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário com rolagem */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Categoria e Natureza */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Classificação Financeira
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Natureza *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      handleChange('type', e.target.value);
                      handleChange('category', '');
                    }}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                  >
                    <option value="honorario">Honorários (Receita)</option>
                    <option value="receita">Receita Operacional</option>
                    <option value="despesa">Despesa Processual / Operacional</option>
                    <option value="reembolso">Reembolso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="">Selecione uma categoria</option>
                  {getCategoryOptions(formData.type).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Descrição do Lançamento *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 text-slate-400 h-3.5 w-3.5" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={2}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs focus:outline-hidden focus:border-slate-400 resize-none ${
                      errors.description ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder="Ex: Honorários contratuais - Entrada inicial, Preparo recursal TJ-BA..."
                  />
                </div>
                {errors.description && <p className="text-rose-600 text-[11px] mt-0.5">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Valor Nominal (R$) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.value ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.value && <p className="text-rose-600 text-[11px] mt-0.5">{errors.value}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Status de Pagamento *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Liquidado (Pago)</option>
                  <option value="vencido">Vencido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vínculos */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Vínculo & Partes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Cliente Vinculado *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400 ${
                      errors.clientId ? 'border-rose-300' : 'border-slate-200'
                    }`}
                    disabled={loadingClients}
                  >
                    <option value="">Selecione o cliente</option>
                    {clients.map((client: Client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.document && `(${client.document})`}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.clientId && <p className="text-rose-600 text-[11px] mt-0.5">{errors.clientId}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Processo Vinculado (Opcional)
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.processId}
                    onChange={(e) => handleChange('processId', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400 font-mono"
                    disabled={loadingProcesses}
                  >
                    <option value="">Sem vínculo processual</option>
                    {processes.map((p: Process) => (
                      <option key={p.id} value={p.id}>
                        {p.number} - {p.subject?.slice(0, 30)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Responsável / Operador
                </label>
                <select
                  value={formData.responsibleId}
                  onChange={(e) => handleChange('responsibleId', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                  disabled={loadingUsers}
                >
                  <option value="">Selecione o advogado ou responsável</option>
                  {users.map((u: UserType) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vencimento e Liquidação */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Datas & Condições de Pagamento
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Data de Vencimento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.dueDate ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.dueDate && <p className="text-rose-600 text-[11px] mt-0.5">{errors.dueDate}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Data de Pagamento / Liquidação
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="datetime-local"
                    value={formData.paidAt}
                    onChange={(e) => handleChange('paidAt', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.paidAt ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.paidAt && <p className="text-rose-600 text-[11px] mt-0.5">{errors.paidAt}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Forma de Pagamento
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                  >
                    <option value="">Não especificado</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência / TED</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="cartao">Cartão de Crédito / Débito</option>
                    <option value="dinheiro">Espécie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Total de Parcelas
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.installments}
                    onChange={(e) => handleChange('installments', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    placeholder="1"
                  />
                </div>
              </div>

              {Boolean(formData.installments && parseInt(formData.installments) > 1) && (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Parcela Atual *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.installments}
                    value={formData.currentInstallment}
                    onChange={(e) => handleChange('currentInstallment', e.target.value)}
                    className={`px-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.currentInstallment ? 'border-rose-300' : 'border-slate-200'
                    }`}
                    placeholder="1"
                  />
                  {errors.currentInstallment && <p className="text-rose-600 text-[11px] mt-0.5">{errors.currentInstallment}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1 pt-1">
            <label className="block text-slate-700 font-medium">
              Observações e Notas
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-2.5 text-slate-400 h-3.5 w-3.5" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400 resize-none"
                placeholder="Anotações internas sobre comprovantes, retenções fiscais..."
              />
            </div>
          </div>

          {/* Resumo do Lançamento */}
          {Boolean(formData.value && formData.dueDate) && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] flex items-center justify-between font-mono">
              <div>
                <span className="text-slate-500">Impacto Financeiro:</span>
                <span className={`ml-1.5 font-bold text-xs ${isDespesa ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {isDespesa ? '-' : '+'}R$ {parseFloat(formData.value || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-slate-400">
                Vencimento: {format(new Date(formData.dueDate), "dd/MM/yyyy")}
              </span>
            </div>
          )}

          {/* Rodapé fixo */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingClients || loadingProcesses || loadingUsers}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium shadow-2xs"
            >
              {isLoading ? 'Salvando...' : (entry ? 'Salvar Alterações' : 'Confirmar Lançamento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialModal;
