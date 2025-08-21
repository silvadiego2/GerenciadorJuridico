import React, { useState, useEffect } from 'react';
import { X, Scale, User, FileText, Building, MapPin, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Process, Client } from '../../types';
import { clientsService } from '../../lib/api';

interface ProcessModalProps {
  process: Process | null;
  onSave: (processData: Partial<Process>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ process, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    number: '',
    cnj: '',
    clientId: '',
    subject: '',
    class: '',
    court: '',
    comarca: '',
    phase: '',
    status: 'ativo' as 'ativo' | 'suspenso' | 'arquivado' | 'baixado',
    value: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar lista de clientes para o dropdown
  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getAll(),
  });

  const clients = clientsData?.clients || [];

  useEffect(() => {
    if (process) {
      setFormData({
        number: process.number,
        cnj: process.cnj || '',
        clientId: process.clientId || '',
        subject: process.subject,
        class: process.class || '',
        court: process.court || '',
        comarca: process.comarca || '',
        phase: process.phase || '',
        status: process.status,
        value: process.value ? process.value.toString() : '',
      });
    }
  }, [process]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.number.trim()) {
      newErrors.number = 'Número do processo é obrigatório';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Assunto é obrigatório';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }

    // Validar formato CNJ se preenchido
    if (formData.cnj) {
      const cnjPattern = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
      if (!cnjPattern.test(formData.cnj)) {
        newErrors.cnj = 'Formato CNJ inválido (0000000-00.0000.0.00.0000)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const processData = {
        ...formData,
        client_id: formData.clientId,
        value: formData.value ? parseFloat(formData.value) : undefined,
      };
      onSave(processData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatProcessNumber = (value: string) => {
    // Remove caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica máscara CNJ: 0000000-00.0000.0.00.0000
    if (cleaned.length <= 20) {
      return cleaned.replace(/(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, '$1-$2.$3.$4.$5.$6');
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {process ? 'Editar Processo' : 'Novo Processo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Processo *
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => handleChange('number', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1234567-89.2024.8.05.0001"
                  />
                </div>
                {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNJ (Formatado)
                </label>
                <input
                  type="text"
                  value={formData.cnj}
                  onChange={(e) => {
                    const formatted = formatProcessNumber(e.target.value);
                    handleChange('cnj', formatted);
                  }}
                  className={`px-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cnj ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1234567-89.2024.8.05.0001"
                />
                {errors.cnj && <p className="text-red-600 text-sm mt-1">{errors.cnj}</p>}
              </div>

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
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="arquivado">Arquivado</option>
                  <option value="baixado">Baixado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto/Matéria *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Ação de Cobrança, Divórcio Consensual, etc."
                  />
                </div>
                {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
              </div>
            </div>
          </div>

          {/* Informações Processuais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Processuais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe Processual
                </label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Procedimento Comum, Execução, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fase Processual
                </label>
                <input
                  type="text"
                  value={formData.phase}
                  onChange={(e) => handleChange('phase', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Conhecimento, Execução, Recurso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vara/Tribunal
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => handleChange('court', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 1ª Vara Cível de Salvador"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comarca
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.comarca}
                    onChange={(e) => handleChange('comarca', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Salvador, Feira de Santana"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Causa
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

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
              disabled={isLoading || loadingClients}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Salvando...' : (process ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessModal;