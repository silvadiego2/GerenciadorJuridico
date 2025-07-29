import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Users, Bell, Shield, Palette, 
  Building, Mail, Phone, MapPin, Save, Key, Database,
  Globe, Clock, FileText, Zap
} from 'lucide-react';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
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
      defaultWorkingDays: true,
      customHolidays: [],
      reminderDays: [7, 3, 1],
      autoCalculation: true
    }
  });

  const sections: SettingsSection[] = [
    {
      id: 'general',
      name: 'Geral',
      icon: Building,
      description: 'Informações básicas do escritório'
    },
    {
      id: 'users',
      name: 'Usuários',
      icon: Users,
      description: 'Gestão de usuários e permissões'
    },
    {
      id: 'notifications',
      name: 'Notificações',
      icon: Bell,
      description: 'Configurações de alertas e avisos'
    },
    {
      id: 'security',
      name: 'Segurança',
      icon: Shield,
      description: 'Configurações de segurança e acesso'
    },
    {
      id: 'integrations',
      name: 'Integrações',
      icon: Zap,
      description: 'APIs e serviços externos'
    },
    {
      id: 'deadlines',
      name: 'Prazos',
      icon: Clock,
      description: 'Calculadora e regras de prazos'
    },
    {
      id: 'appearance',
      name: 'Aparência',
      icon: Palette,
      description: 'Tema e personalização visual'
    }
  ];

  const handleSave = () => {
    // Simular salvamento
    alert('Configurações salvas com sucesso!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Escritório</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Escritório
            </label>
            <input
              type="text"
              value={settings.general.companyName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, companyName: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              value={settings.general.cnpj}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, cnpj: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OAB Principal
            </label>
            <input
              type="text"
              value={settings.general.oab}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, oab: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              value={settings.general.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, phone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={settings.general.address}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, address: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={settings.general.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, email: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="text"
              value={settings.general.website}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, website: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Segurança</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout de Sessão (minutos)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiração de Senha (dias)
              </label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'twoFactorAuth', label: 'Autenticação de Dois Fatores', description: 'Adicionar camada extra de segurança' },
              { key: 'auditLog', label: 'Log de Auditoria', description: 'Registrar todas as ações dos usuários' },
              { key: 'ipRestriction', label: 'Restrição por IP', description: 'Permitir acesso apenas de IPs específicos' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security[item.key as keyof typeof settings.security] as boolean}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, [item.key]: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'integrations': return renderIntegrationsSettings();
      case 'users':
      case 'deadlines':
      case 'appearance':
        return (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {sections.find(s => s.id === activeSection)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              Esta seção está em desenvolvimento e será disponibilizada em breve.
            </p>
          </div>
        );
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Salvar Alterações</span>
        </button>
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