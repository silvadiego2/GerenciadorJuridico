// src/pages/Clients.tsx
import React, { useState } from 'react';
import { Plus, Search, Eye, Edit2, Phone, Mail, Trash2, Loader2, Building, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../lib/api';
import { Client } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientModal from '../components/Clients/ClientModal';
import { useNotifications } from '../hooks/useNotifications';
import { useDebounce } from '../hooks/useDebounce';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'fisica' | 'juridica'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const { data: clientsData, isLoading, error: queryError } = useQuery({
    queryKey: ['clients', debouncedSearchTerm, selectedType, selectedStatus],
    queryFn: () => clientsService.getAll({
      search: debouncedSearchTerm || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const clients = Array.isArray(clientsData?.clients) ? clientsData.clients : [];

  const createClientMutation = useMutation({
    mutationFn: clientsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Sucesso', 'Cliente cadastrado com sucesso');
      setIsModalOpen(false);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao cadastrar cliente')
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Sucesso', 'Cliente atualizado');
      setIsModalOpen(false);
      setEditingClient(null);
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao atualizar cliente')
  });

  const deleteClientMutation = useMutation({
    mutationFn: clientsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Sucesso', 'Cliente excluído');
    },
    onError: (err: any) => error('Erro', err.message || 'Falha ao excluir cliente')
  });

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (clientId: string, clientName?: string) => {
    if (window.confirm(`Excluir permanentemente o cadastro de "${clientName || 'este cliente'}"?`)) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data: clientData });
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  if (queryError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-xs text-rose-800">
          Erro ao carregar clientes: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Cadastro de Clientes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestão de partes, interessados e contatos do escritório</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
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
          <option value="all">Todas as naturezas</option>
          <option value="fisica">Pessoa Física</option>
          <option value="juridica">Pessoa Jurídica</option>
        </select>
      </div>

      {/* Lista / Tabela */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isLoading ? 'Carregando clientes...' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} cadastrado${clients.length !== 1 ? 's' : ''}`}
          </h2>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 mx-auto mb-2" />
            Carregando cadastro...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <User className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">Nenhum cliente cadastrado</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ao sincronizar processos via Projudi, os promoventes são cadastrados automaticamente aqui.</p>
          </div>
        ) : (
          <>
            {/* Visão Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50/75 text-slate-500 font-semibold text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Cliente / Interessado</th>
                    <th className="py-2.5 px-3">Documento (CPF/CNPJ)</th>
                    <th className="py-2.5 px-3">Contatos</th>
                    <th className="py-2.5 px-3">Cidade / UF</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {clients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900">{client.name}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {client.type === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {client.document || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {client.email && <p className="truncate max-w-[200px]">{client.email}</p>}
                        {client.phone && <p className="text-[11px] text-slate-400">{client.phone}</p>}
                        {!client.email && !client.phone && '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {client.address?.city ? `${client.address.city}/${client.address.state || 'BA'}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visão Mobile */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {clients.map((client: any) => (
                <div key={client.id} className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{client.name}</p>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {client.type === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </span>
                    </div>
                    {client.document && (
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {client.document}
                      </span>
                    )}
                  </div>

                  {(client.email || client.phone) && (
                    <div className="text-[11px] text-slate-500 space-y-0.5 bg-slate-50 p-2 rounded">
                      {client.email && <p className="truncate">Email: {client.email}</p>}
                      {client.phone && <p>Tel: {client.phone}</p>}
                    </div>
                  )}

                  <div className="flex justify-end gap-1 pt-1">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="px-2.5 py-1 text-xs border border-rose-200 text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <ClientModal
          client={editingClient}
          onSave={handleSaveClient}
          onClose={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
          isLoading={createClientMutation.isPending || updateClientMutation.isPending}
        />
      )}
    </div>
  );
};

export default Clients;
