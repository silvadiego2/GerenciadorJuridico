// src/components/Clients/ClientModal.tsx
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
      state: 'BA',
      zipCode: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        document: client.document || '',
        type: client.type || 'fisica',
        status: (client.status as any) || 'ativo',
        address: {
          street: client.address?.street || '',
          number: client.address?.number || '',
          complement: client.address?.complement || '',
          neighborhood: client.address?.neighborhood || '',
          city: client.address?.city || '',
          state: client.address?.state || 'BA',
          zipCode: client.address?.zipCode || '',
        },
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        type: 'fisica',
        status: 'ativo',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: 'BA',
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
      if (formData.type === 'fisica' && cleanDoc.length > 0 && cleanDoc.length !== 11) {
        newErrors.document = 'CPF deve conter 11 dígitos';
      } else if (formData.type === 'juridica' && cleanDoc.length > 0 && cleanDoc.length !== 14) {
        newErrors.document = 'CNPJ deve conter 14 dígitos';
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
        address: Object.values(formData.address).some(value => value && value.trim()) 
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
      return cleaned.slice(0, 11).replace(/(\d{3})(\d{3})?(\d{3})?(\d{2})?/, (_, p1, p2, p3, p4) => {
        let res = p1;
        if (p2) res += `.${p2}`;
        if (p3) res += `.${p3}`;
        if (p4) res += `-${p4}`;
        return res;
      });
    } else {
      return cleaned.slice(0, 14).replace(/(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, (_, p1, p2, p3, p4, p5) => {
        let res = p1;
        if (p2) res += `.${p2}`;
        if (p3) res += `.${p3}`;
        if (p4) res += `/${p4}`;
        if (p5) res += `-${p5}`;
        return res;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {client ? 'Editar Cadastro de Cliente' : 'Novo Cliente / Parte'}
              </h2>
              <p className="text-[11px] text-slate-400">Informações de contato e documentação da parte representada</p>
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
          {/* Dados Pessoais / Empresariais */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Qualificação Civil
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Nome Completo / Razão Social *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder="Nome completo da pessoa física ou razão social"
                  />
                </div>
                {errors.name && <p className="text-rose-600 text-[11px] mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Natureza Jurídica
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'fisica' | 'juridica';
                    setFormData(prev => ({ ...prev, type: newType, document: '' }));
                  }}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="fisica">Pessoa Física</option>
                  <option value="juridica">Pessoa Jurídica</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Situação Cadastral
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {formData.type === 'fisica' ? 'CPF' : 'CNPJ'}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value, formData.type);
                      handleChange('document', formatted);
                    }}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.document ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder={formData.type === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>
                {errors.document && <p className="text-rose-600 text-[11px] mt-0.5">{errors.document}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  E-mail de Contato
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder="contato@cliente.com"
                  />
                </div>
                {errors.email && <p className="text-rose-600 text-[11px] mt-0.5">{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative max-w-sm">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    placeholder="(71) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Endereço & Comarca
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Salvador"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400 uppercase"
                  placeholder="BA"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.address.neighborhood}
                  onChange={(e) => handleChange('address.neighborhood', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Pituba, Centro..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Logradouro (Rua / Av.)
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Av. Tancredo Neves..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.address.number}
                  onChange={(e) => handleChange('address.number', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="123"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.address.complement}
                  onChange={(e) => handleChange('address.complement', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Sala 101, Edf. Mandarim"
                />
              </div>
            </div>
          </div>

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
              disabled={isLoading}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium shadow-2xs"
            >
              {isLoading ? 'Salvando...' : (client ? 'Salvar Alterações' : 'Cadastrar Cliente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
