import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText, MapPin, Building } from 'lucide-react';
import { Client } from '../../types';

interface ClientModalProps {
  client: Client | null;
  onSave: (clientData: Partial<Client>) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    type: 'fisica' as 'fisica' | 'juridica',
    status: 'ativo' as 'ativo' | 'inativo',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        document: client.document || '',
        type: client.type,
        status: client.status,
        address: client.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
        },
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (formData.document) {
      const cleanDoc = formData.document.replace(/\D/g, '');
      if (formData.type === 'fisica' && cleanDoc.length !== 11) {
        newErrors.document = 'CPF deve ter 11 dígitos';
      } else if (formData.type === 'juridica' && cleanDoc.length !== 14) {
        newErrors.document = 'CNPJ deve ter 14 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const clientData = {
        ...formData,
        // Limpar campos vazios do endereço
        address: Object.values(formData.address).some(value => value.trim()) 
          ? formData.address 
          : undefined,
      };
      onSave(clientData);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDocument = (value: string, type: 'fisica' | 'juridica') => {
    const cleaned = value.replace(/\D/g, '');
    if (type === 'fisica') {
      // CPF: 000.000.000-00
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Digite o nome completo"
                  />
                </div>
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fisica">Pessoa Física</option>
                  <option value="juridica">Pessoa Jurídica</option>
                </select>
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
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'fisica' ? 'CPF' : 'CNPJ'}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value, formData.type);
                      handleChange('document', formatted);
                    }}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.document ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={formData.type === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>
                {errors.document && <p className="text-red-600 text-sm mt-1">{errors.document}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="cliente@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(71) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="BA"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Salvador"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.address.neighborhood}
                  onChange={(e) => handleChange('address.neighborhood', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua das Flores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.address.number}
                  onChange={(e) => handleChange('address.number', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.address.complement}
                  onChange={(e) => handleChange('address.complement', e.target.value)}
                  className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Apto 101"
                />
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Salvando...' : (client ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;