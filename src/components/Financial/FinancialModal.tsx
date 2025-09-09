import React, { useState, useEffect } from 'react';
import { X, DollarSign, User, Calendar, FileText, CreditCard, Hash, MessageSquare } from 'lucide-react';
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

  // Buscar dados para os dropdowns
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
        dueDate: format(entry.dueDate, 'yyyy-MM-dd\'T\'HH:mm'),
        paidAt: entry.paidAt ? format(entry.paidAt, 'yyyy-MM-dd\'T\'HH:mm') : '',
        processId: entry.processId || '',
        clientId: entry.clientId,
        responsibleId: entry.responsibleId || '',
        paymentMethod: entry.paymentMethod || '',
        installments: entry.installments?.toString() || '',
        currentInstallment: entry.currentInstallment?.toString() || '',
        notes: entry.notes || '',
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
      newErrors.paidAt = 'Data de pagamento é obrigatória quando status é "Pago"';
    }

    if (formData.installments && parseInt(formData.installments) > 1 && !formData.currentInstallment) {
      newErrors.currentInstallment = 'Parcela atual é obrigatória quando há parcelamento';
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'honorario': return 'text-green-600';
      case 'receita': return 'text-blue-600';
      case 'despesa': return 'text-red-600';
      case 'reembolso': return 'text-purple-600';
      default: return 'text-gray-600';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {entry ? 'Editar Entrada Financeira' : 'Nova Entrada Financeira'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo e Categoria */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo e Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      handleChange('type', e.target.value);
                      handleChange('category', ''); // Reset category when type changes
                    }}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="honorario">Honorário</option>
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                    <option value="reembolso">Reembolso</option>
                  </select>
                </div>
                <div className="mt-1 flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    formData.type === 'honorario' || formData.type === 'receita' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-xs ${getTypeColor(formData.type)}`}>
                    {formData.type === 'honorario' || formData.type === 'receita' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {getCategoryOptions(formData.type).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Descreva a entrada financeira..."
                  />
                </div>
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.value}
                      onChange={(e) => handleChange('value', e.target.value)}
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.value ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0,00"
                    />
                  </div>
                  {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Relacionamentos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Relacionamentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.clientId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loadingClients}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client: Client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.document && `(${client.document})`}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.clientId && <p className="text-red-600 text-sm mt-1">{errors.clientId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processo (Opcional)
                </label>
                <select
                  value={formData.processId}
                  onChange={(e) => handleChange('processId', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingProcesses}
                >
                  <option value="">Selecione um processo</option>
                  {processes.map((process: Process) => (
                    <option key={process.id} value={process.id}>
                      {process.number} - {process.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <select
                  value={formData.responsibleId}
                  onChange={(e) => handleChange('responsibleId', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingUsers}
                >
                  <option value="">Selecione um responsável</option>
                  {users.filter((user: UserType) => ['admin', 'advogado'].includes(user.role)).map((user: UserType) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Datas e Pagamento */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Datas e Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
              </div>

              {formData.status === 'pago' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="datetime-local"
                      value={formData.paidAt}
                      onChange={(e) => handleChange('paidAt', e.target.value)}
                      className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.paidAt ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.paidAt && <p className="text-red-600 text-sm mt-1">{errors.paidAt}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione a forma</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                    <option value="boleto">Boleto</option>
                    <option value="cartao">Cartão</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Parcelas
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.installments}
                    onChange={(e) => handleChange('installments', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>

              {formData.installments && parseInt(formData.installments) > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parcela Atual *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.installments}
                    value={formData.currentInstallment}
                    onChange={(e) => handleChange('currentInstallment', e.target.value)}
                    className={`px-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.currentInstallment ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.currentInstallment && <p className="text-red-600 text-sm mt-1">{errors.currentInstallment}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          {/* Resumo */}
          {formData.value && formData.dueDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Resumo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Valor:</span>
                  <span className={`ml-2 font-bold ${getTypeColor(formData.type)}`}>
                    {formData.type === 'despesa' ? '-' : '+'}R$ {parseFloat(formData.value || '0').toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Vencimento:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(formData.dueDate), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </div>
                {formData.installments && parseInt(formData.installments) > 1 && (
                  <div className="md:col-span-2">
                    <span className="text-blue-700">Parcelamento:</span>
                    <span className="ml-2 font-medium">
                      {formData.currentInstallment || '1'} de {formData.installments} parcelas
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingClients || loadingProcesses || loadingUsers}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Salvando...' : (entry ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialModal;