import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Users, Bell, Shield, Palette, 
  Building, Mail, Phone, Save, Key, Database,
  Globe, Clock, Zap, Plus, Trash2, Edit, Loader2, CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, deadlineSettingsService } from '../lib/api';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Estados dos formulários de configurações
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Silva & Associados Advocacia',
      cnpj: '12.345.678/0001-90',
      oab: 'BA 12345',
      address: 'Av. Tancredo Neves, 2227 - Sala 1001',
      city: 'Salvador',
      state: 'BA',
      zipCode: '41820-021',
      phone: '(71) 3333-4444',
      email: 'contato@silvaassociados.com.br',
      website: 'www.silvaassociados.com.br'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      processUpdates: true,
      taskReminders: true,
      publicationAlerts: true,
      financialAlerts: true,
      clientMessages: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      auditLog: true,
      ipRestriction: false,
      allowedIPs: ''
    },
    integrations: {
      tjbaEnabled: true,
      pjeEnabled: false,
      datajudEnabled: true,
      djeEnabled: true,
      emailProvider: 'smtp',
      storageProvider: 'local'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#1E40AF',
      fontSize: 'medium',
      compactMode: false
    },
    deadlines: {
      default_warning_days: 3,
      count_business_days: true,
      notify_email: true,
      notify_whatsapp: false
    }
  });

  // Modal / Formulário rápido para criação de usuários na aba Usuários
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'advogado',
    oab: '',
    phone: '',
    status: 'ativo'
  });

  // Carregar dados de prazos do Supabase
  const { data: deadlineData } = useQuery({
    queryKey: ['deadlineSettings'],
    queryFn: () => deadlineSettingsService.getSettings()
  });

  useEffect(() => {
    if (deadlineData) {
      setSettings(prev => ({
        ...prev,
        deadlines: {
          default_warning_days: deadlineData.default_warning_days ?? 3,
          count_business_days: deadlineData.count_business_days ?? true,
          notify_email: deadlineData.notify_email ?? true,
          notify_whatsapp: deadlineData.notify_whatsapp ?? false
        }
      }));
    }
  }, [deadlineData]);

  // Carregar Usuários
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['settingsUsers'],
    queryFn: () => usersService.getAll()
  });

  const usersList: any[] = Array.isArray((usersResponse as any)?.users)
    ? (usersResponse as any).users
    : Array.isArray(usersResponse)
    ? usersResponse
    : [];

  // Mutations para Usuários
  const createUserMutation = useMutation({
    mutationFn: (data: any) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUserModal(false);
      setNewUser({ name: '', email: '', role: 'advogado', oab: '', phone: '', status: 'ativo' });
      triggerFeedback('Usuário cadastrado com sucesso!');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      triggerFeedback('Usuário removido!');
    }
  });

  // Mutation para Prazos
  const updateDeadlinesMutation = useMutation({
    mutationFn: (data: any) => deadlineSettingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlineSettings'] });
      triggerFeedback('Configurações de prazos atualizadas!');
    }
  });

  const triggerFeedback = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const sections: SettingsSection[] = [
    { id: 'general', name: 'Geral', icon: Building, description: 'Informações básicas do escritório' },
    { id: 'users', name: 'Usuários', icon: Users, description: 'Gestão de usuários e permissões' },
    { id: 'deadlines', name: 'Prazos', icon: Clock, description: 'Regras de contagem e notificações' },
    { id: 'notifications', name: 'Notificações', icon: Bell, description: 'Configurações de alertas e avisos' },
    { id: 'security', name: 'Segurança', icon: Shield, description: 'Configurações de segurança e acesso' },
    { id: 'integrations', name: 'Integrações', icon: Zap, description: 'APIs e serviços externos' },
    { id: 'appearance', name: 'Aparência', icon: Palette, description: 'Tema e personalização visual' }
  ];

  const handleSave = () => {
    if (activeSection === 'deadlines') {
      updateDeadlinesMutation.mutate(settings.deadlines);
    } else {
      triggerFeedback('Configurações salvas!');
    }
  };

  // 1. ABA GERAL
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Escritório</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Escritório</label>
            <input
              type="text"
              value={settings.general.companyName}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, companyName: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input
              type="text"
              value={settings.general.cnpj}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, cnpj: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OAB Principal</label>
            <input
              type="text"
              value={settings.general.oab}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, oab: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={settings.general.phone}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, phone: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={settings.general.address}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, address: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={settings.general.email}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, email: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="text"
              value={settings.general.website}
              onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, website: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 2. ABA USUÁRIOS
  const renderUsersSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Membros da Equipe</h3>
          <p className="text-sm text-gray-600">Gerencie advogados, assistentes e permissões de acesso</p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      {isLoadingUsers ? (
        <div className="py-8 text-center text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          Carregando usuários...
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OAB</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {usersList.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{user.role || 'Advogado'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.oab || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {user.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remover o usuário ${user.name}?`)) {
                          deleteUserMutation.mutate(user.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal simples de novo usuário */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Novo Usuário</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Função</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="admin">Administrador</option>
                    <option value="advogado">Advogado</option>
                    <option value="estagiario">Estagiário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">OAB</label>
                  <input
                    type="text"
                    value={newUser.oab}
                    onChange={(e) => setNewUser({ ...newUser, oab: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => createUserMutation.mutate(newUser)}
                disabled={!newUser.name || !newUser.email || createUserMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {createUserMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 3. ABA PRAZOS
  const renderDeadlinesSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Gestão de Prazos Processuais</h3>
        <p className="text-sm text-gray-600 mb-6">Defina as regras de cálculo e alerta de vencimento</p>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900 text-sm">Regras de Contagem</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">Contagem em Dias Úteis (CPC/15)</p>
                <p className="text-xs text-gray-500">Exclui sábados, domingos e feriados no cálculo processual</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deadlines.count_business_days}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    deadlines: { ...prev.deadlines, count_business_days: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Antecedência padrão para alertas (Dias)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.deadlines.default_warning_days}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  deadlines: { ...prev.deadlines, default_warning_days: parseInt(e.target.value) || 1 }
                }))}
                className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900 text-sm">Canais de Alerta</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">Alertas por E-mail</p>
                <p className="text-xs text-gray-500">Enviar resumo matinal de prazos fatais</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deadlines.notify_email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    deadlines: { ...prev.deadlines, notify_email: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">Notificação via WhatsApp</p>
                <p className="text-xs text-gray-500">Enviar lembretes no dia do vencimento do prazo</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deadlines.notify_whatsapp}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    deadlines: { ...prev.deadlines, notify_whatsapp: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. DEMAIS ABAS (NOTIFICAÇÕES, SEGURANÇA, INTEGRAÇÕES, APARÊNCIA)
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificação</h3>
      <div className="space-y-4">
        {[
          { key: 'emailNotifications', label: 'Notificações por E-mail', description: 'Receber alertas por e-mail' },
          { key: 'smsNotifications', label: 'Notificações por SMS', description: 'Receber alertas por SMS' },
          { key: 'pushNotifications', label: 'Notificações Push', description: 'Notificações no navegador' },
          { key: 'processUpdates', label: 'Atualizações de Processos', description: 'Novos andamentos processuais' },
          { key: 'taskReminders', label: 'Lembretes de Tarefas', description: 'Prazos e tarefas vencendo' },
          { key: 'publicationAlerts', label: 'Alertas de Publicações', description: 'Novas publicações no DJE' },
          { key: 'financialAlerts', label: 'Alertas Financeiros', description: 'Vencimentos e pagamentos' },
          { key: 'clientMessages', label: 'Mensagens de Clientes', description: 'Novas mensagens no portal' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{item.label}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, [item.key]: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Segurança</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timeout de Sessão (minutos)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, sessionTimeout: parseInt(e.target.value) || 1 } }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiração de Senha (dias)</label>
          <input
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => setSettings(prev => ({ ...prev, security: { ...prev.security, passwordExpiry: parseInt(e.target.value) || 1 } }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrações Externas</h3>
      <div className="space-y-4">
        {[
          { key: 'tjbaEnabled', label: 'TJ-BA', description: 'Integração com Tribunal de Justiça da Bahia' },
          { key: 'pjeEnabled', label: 'PJe', description: 'Processo Judicial Eletrônico' },
          { key: 'datajudEnabled', label: 'DataJud CNJ', description: 'Base nacional de dados do Poder Judiciário' },
          { key: 'djeEnabled', label: 'DJE', description: 'Diário de Justiça Eletrônico' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{item.label}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.integrations[item.key as keyof typeof settings.integrations] as boolean}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, [item.key]: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aparência do Painel</h3>
      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tema Visual</label>
        <div className="flex gap-4">
          <button className="px-4 py-2 border-2 border-blue-600 rounded-lg bg-white text-blue-700 font-medium text-sm">
            Claro (Padrão)
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm">
            Escuro (Em breve)
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'users': return renderUsersSettings();
      case 'deadlines': return renderDeadlinesSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'integrations': return renderIntegrationsSettings();
      case 'appearance': return renderAppearanceSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as preferências e parâmetros do escritório</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveStatus && (
            <span className="text-sm text-green-600 flex items-center space-x-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>{saveStatus}</span>
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={updateDeadlinesMutation.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
