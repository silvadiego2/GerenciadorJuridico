import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Phone, Mail, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../lib/api';
import { Client } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientModal from '../components/Clients/ClientModal';
import { useNotifications } from '../hooks/useNotifications';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'fisica' | 'juridica'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  // Query para buscar clientes
  const { data: clientsData, isLoading, error: queryError } = useQuery({
    queryKey: ['clients', searchTerm, selectedType, selectedStatus],
    queryFn: () => clientsService.getAll({
      search: searchTerm || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const clients = clientsData?.clients || [];

  // Mutation para criar cliente
  const createClientMutation = useMutation({
    mutationFn: clientsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Sucesso', 'Cliente criado com sucesso!');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao criar cliente');
    },
  });

  // Mutation para atualizar cliente
  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Sucesso', 'Cliente atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingClient(null);
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao atualizar cliente');
    },
  });

  // Mutation para deletar cliente
  const deleteClientMutation = useMutation({
    mutationFn: clientsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Sucesso', 'Cliente excluído com sucesso!');
    },
    onError: (err: any) => {
      error('Erro', err.message || 'Erro ao excluir cliente');
    },
  });

  const handleCreateClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${clientName}"?`)) {
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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar clientes: {(queryError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e informações de contato</p>
        </div>
        <button 
          onClick={handleCreateClient}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'all' | 'fisica' | 'juridica')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="fisica">Pessoa Física</option>
            <option value="juridica">Pessoa Jurídica</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'ativo' | 'inativo')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Carregando...' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} encontrado${clients.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Carregando clientes...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {clients.map((client) => (
            <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        client.type === 'fisica' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {client.type === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                      {client.document && <span className="text-sm text-gray-600">{client.document}</span>}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        client.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-gray-600 hidden sm:block">
                    {client.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditClient(client)}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      disabled={deleteClientMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteClientMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                {client.address && (
                  <p>
                    <strong>Endereço:</strong> {client.address.street}, {client.address.number}
                    {client.address.complement && `, ${client.address.complement}`} - {client.address.neighborhood}, {client.address.city}/{client.address.state}
                  </p>
                )}
                <p className="mt-1">
                  <strong>Cadastrado em:</strong> {format(client.createdAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            ))}
          
            {clients.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhum cliente encontrado com os filtros aplicados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cliente */}
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