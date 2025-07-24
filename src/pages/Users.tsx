import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, User, Mail, Phone, Calendar } from 'lucide-react';
import { User as UserType } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import UserModal from '../components/Users/UserModal';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'joao@escritorio.com',
      role: 'advogado',
      oab: 'BA 12345',
      phone: '(71) 99999-9999',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@escritorio.com',
      role: 'estagiario',
      phone: '(71) 88888-8888',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
    {
      id: '3',
      name: 'Carlos Administrador',
      email: 'admin@escritorio.com',
      role: 'admin',
      phone: '(71) 77777-7777',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'advogado' | 'estagiario' | 'cliente'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.oab && user.oab.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'advogado':
        return 'bg-blue-100 text-blue-800';
      case 'estagiario':
        return 'bg-green-100 text-green-800';
      case 'cliente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'advogado':
        return User;
      case 'estagiario':
        return User;
      case 'cliente':
        return User;
      default:
        return User;
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleSaveUser = (userData: Partial<UserType>) => {
    if (editingUser) {
      // Editar usuário existente
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userData, updatedAt: new Date() }
          : user
      ));
    } else {
      // Criar novo usuário
      const newUser: UserType = {
        id: Date.now().toString(),
        name: userData.name!,
        email: userData.email!,
        role: userData.role!,
        oab: userData.oab,
        phone: userData.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie usuários e permissões do sistema</p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou OAB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os perfis</option>
            <option value="admin">Administrador</option>
            <option value="advogado">Advogado</option>
            <option value="estagiario">Estagiário</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            return (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <RoleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        {user.oab && (
                          <span className="text-sm text-gray-600 font-mono">OAB: {user.oab}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-gray-600 hidden sm:block">
                      <div className="flex items-center space-x-1 mb-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Cadastrado em {format(user.createdAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Usuário */}
      {isModalOpen && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Users;