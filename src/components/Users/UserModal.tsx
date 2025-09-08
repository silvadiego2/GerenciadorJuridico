import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../../types';

interface UserModalProps {
  user: UserType | null;
  onSave: (userData: Partial<UserType> & { password?: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'estagiario' as UserType['role'],
    oab: '',
    phone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        oab: user.oab || '',
        phone: user.phone || '',
        password: '', // Não pré-preencher senha para edição
      });
    } else {
      // Reset para novo usuário
      setFormData({
        name: '',
        email: '',
        role: 'estagiario',
        oab: '',
        phone: '',
        password: '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // Senha obrigatória apenas para novos usuários
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.role === 'advogado' && !formData.oab.trim()) {
      newErrors.oab = 'OAB é obrigatória para advogados';
    }

    // Validar formato OAB se preenchido
    if (formData.oab && !/^[A-Z]{2}\s?\d{4,6}$/i.test(formData.oab)) {
      newErrors.oab = 'Formato OAB inválido (ex: BA 12345)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const userData = { ...formData };
      // Remover senha vazia para edição
      if (user && !userData.password) {
        delete userData.password;
      }
      onSave(userData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Acesso total ao sistema, gestão de usuários e configurações';
      case 'advogado':
        return 'Gestão completa de clientes, processos e módulo financeiro';
      case 'estagiario':
        return 'Acesso limitado, sem módulo financeiro e configurações';
      case 'cliente':
        return 'Acesso apenas aos próprios processos via portal';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
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
            <div className="space-y-4">
              <div>
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
                  E-mail *
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
                    placeholder="usuario@escritorio.com"
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {!user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>
              )}

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

          {/* Perfil e Permissões */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Perfil e Permissões</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="estagiario">Estagiário</option>
                    <option value="advogado">Advogado</option>
                    <option value="admin">Administrador</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getRoleDescription(formData.role)}
                </p>
              </div>

              {formData.role === 'advogado' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OAB *
                  </label>
                  <input
                    type="text"
                    value={formData.oab}
                    onChange={(e) => handleChange('oab', e.target.value.toUpperCase())}
                    className={`px-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.oab ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="BA 12345"
                  />
                  {errors.oab && <p className="text-red-600 text-sm mt-1">{errors.oab}</p>}
                  <p className="text-sm text-gray-600 mt-1">
                    Formato: UF + número (ex: BA 12345)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Segurança */}
          {user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Alteração de Senha</h4>
              <p className="text-sm text-yellow-700">
                Para alterar a senha deste usuário, entre em contato com o administrador do sistema ou solicite que o próprio usuário faça a alteração através do perfil.
              </p>
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Salvando...' : (user ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;