// src/components/Processes/ProcessModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Scale, User, FileText, Building, MapPin, DollarSign, Calendar } from 'lucide-react';
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
    subject: '',
    court: '',
    comarca: '',
    class: '',
    phase: 'conhecimento',
    status: 'ativo',
    value: '',
    clientId: '',
    plaintiff: '',
    defendant: '',
    distributionDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.getAll(),
  });

  const clients = clientsData?.clients || [];

  useEffect(() => {
    if (process) {
      const distDate = (process as any).distributionDate || (process as any).distribution_date || '';
      setFormData({
        number: process.number || '',
        cnj: (process as any).cnj || process.number || '',
        clientId: process.clientId || (process as any).client_id || '',
        subject: process.subject || (process as any).title || '',
        class: process.class || '',
        court: process.court || '',
        comarca: (process as any).comarca || '',
        phase: process.phase || 'conhecimento',
        status: process.status || 'ativo',
        value: process.value ? process.value.toString() : '',
        plaintiff: (process as any).plaintiff || '',
        defendant: (process as any).defendant || '',
        distributionDate: distDate ? String(distDate).slice(0, 10) : '',
      });
    } else {
      setFormData({
        number: '',
        cnj: '',
        subject: '',
        court: '',
        comarca: '',
        class: '',
        phase: 'conhecimento',
        status: 'ativo',
        value: '',
        clientId: '',
        plaintiff: '',
        defendant: '',
        distributionDate: '',
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const processData: any = {
        ...formData,
        client_id: formData.clientId || null,
        distribution_date: formData.distributionDate || null,
        distributionDate: formData.distributionDate || null,
        value: formData.value ? parseFloat(formData.value) : 0,
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
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 20) {
      return cleaned.replace(/(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, '$1-$2.$3.$4.$5.$6');
    }
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {process ? 'Editar Autos Processuais' : 'Cadastrar Novo Processo'}
              </h2>
              <p className="text-[11px] text-slate-400">Preencha os dados da ação judicial e vincule as partes</p>
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
          {/* Dados Principais */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Identificação & Partes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Número do Processo (CNJ) *
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => {
                      handleChange('number', e.target.value);
                      if (!formData.cnj) {
                        handleChange('cnj', formatProcessNumber(e.target.value));
                      }
                    }}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md font-mono text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.number ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder="0000000-00.0000.8.05.0000"
                  />
                </div>
                {errors.number && <p className="text-rose-600 text-[11px] mt-0.5">{errors.number}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Cliente Vinculado (Promovente)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleChange('clientId', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                    disabled={loadingClients}
                  >
                    <option value="">Selecione ou deixe sem vínculo</option>
                    {clients.map((client: Client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.document && `(${client.document})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Autor / Polo Ativo (Texto Livre)
                </label>
                <input
                  type="text"
                  value={formData.plaintiff}
                  onChange={(e) => handleChange('plaintiff', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Nome do Promovente / Autor"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Réu / Polo Passivo
                </label>
                <input
                  type="text"
                  value={formData.defendant}
                  onChange={(e) => handleChange('defendant', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Nome da Empresa ou Réu"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Assunto / Matéria da Ação *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={`pl-9 pr-3 py-1.5 w-full border rounded-md text-xs focus:outline-hidden focus:border-slate-400 ${
                      errors.subject ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:bg-white'
                    }`}
                    placeholder="Ex: Ação de Cobrança, Obrigação de Fazer, Relação de Consumo"
                  />
                </div>
                {errors.subject && <p className="text-rose-600 text-[11px] mt-0.5">{errors.subject}</p>}
              </div>
            </div>
          </div>

          {/* Dados Judiciais */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Dados Judiciais & Valores
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="arquivado">Arquivado</option>
                  <option value="baixado">Baixado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Fase Processual
                </label>
                <select
                  value={formData.phase}
                  onChange={(e) => handleChange('phase', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden focus:border-slate-400"
                >
                  <option value="conhecimento">Conhecimento</option>
                  <option value="execução">Execução</option>
                  <option value="recurso">Recurso</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Data de Distribuição
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="date"
                    value={formData.distributionDate}
                    onChange={(e) => handleChange('distributionDate', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Classe Processual
                </label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  className="px-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  placeholder="Ex: Procedimento Comum"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tribunal / Vara
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => handleChange('court', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    placeholder="Ex: TJ-BA / 1ª Vara Cível"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Comarca
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    value={formData.comarca}
                    onChange={(e) => handleChange('comarca', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    placeholder="Ex: Salvador, Camaçari"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-medium mb-1">
                  Valor da Causa (R$)
                </label>
                <div className="relative max-w-xs">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    className="pl-9 pr-3 py-1.5 w-full border border-slate-200 rounded-md font-mono text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé fixo dentro da tag form */}
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
              disabled={isLoading || loadingClients}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium shadow-2xs"
            >
              {isLoading ? 'Salvando...' : (process ? 'Salvar Alterações' : 'Cadastrar Processo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessModal;
