// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building, Users, Clock, Bell, Shield, 
  Save, Plus, Trash2, Loader2, CheckCircle2 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, deadlineSettingsService } from '../lib/api';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'users' | 'deadlines' | 'notifications'>('general');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    general: {
      companyName: 'Silva Advocacia & Consultoria',
      cnpj: '',
      oab: 'BA 00.000',
      address: 'Salvador, Bahia',
      email: '',
      phone: ''
    },
    deadlines: {
      default_warning_days: 3,
      count_business_days: true,
      notify_email: true,
      notify_whatsapp: false
    }
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'advogado',
    oab: '',
    phone: '',
    status: 'ativo'
  });

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

  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['settingsUsers'],
    queryFn: () => usersService.getAll()
  });

  const usersList: any[] = Array.isArray((usersResponse as any)?.users)
    ? (usersResponse as any).users
    : Array.isArray(usersResponse)
    ? usersResponse
    : [];

  const createUserMutation = useMutation({
    mutationFn: (data: any) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsUsers'] });
      setShowUserModal(false);
      setNewUser({ name: '', email: '', role: 'advogado', oab: '', phone: '', status: 'ativo' });
      triggerFeedback('Operador cadastrado');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsUsers'] });
      triggerFeedback('Acesso removido');
    }
  });

  const updateDeadlinesMutation = useMutation({
    mutationFn: (data: any) => deadlineSettingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlineSettings'] });
      triggerFeedback('Configurações salvas');
    }
  });

  const triggerFeedback = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const sections = [
    { id: 'general', name: 'Escritório', icon: Building },
    { id: 'users', name: 'Membros da Equipe', icon: Users },
    { id: 'deadlines', name: 'Prazos Processuais', icon: Clock },
    { id: 'notifications', name: 'Alertas e Avisos', icon: Bell }
  ];

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Parâmetros do Sistema</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configuração geral de contagem de prazos, equipe e escritório</p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{saveStatus}</span>
            </span>
          )}
          <button
            onClick={() => {
              if (activeSection === 'deadlines') {
                updateDeadlinesMutation.mutate(settings.deadlines);
              } else {
                triggerFeedback('Configurações salvas');
              }
            }}
            disabled={updateDeadlinesMutation.isPending}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Menu Lateral de Configurações */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-2xs space-y-1">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors ${
                    activeSection === s.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo da Aba */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs text-xs">
            {activeSection === 'general' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Dados do Escritório</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Razão Social / Nome</label>
                    <input
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">OAB Principal</label>
                    <input
                      type="text"
                      value={settings.general.oab}
                      onChange={(e) => setSettings({ ...settings, general: { ...settings.general, oab: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Equipe Cadastrada</h3>
                    <p className="text-[11px] text-slate-400">Advogados, assistentes e prepostos com acesso ao sistema</p>
                  </div>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="px-2.5 py-1 text-xs bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Adicionar</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {usersList.map((u: any) => (
                    <div key={u.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email} • {u.role}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Remover acesso de ${u.name}?`)) deleteUserMutation.mutate(u.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {usersList.length === 0 && (
                    <p className="py-4 text-center text-slate-400">Nenhum membro adicional cadastrado.</p>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'deadlines' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Parâmetros de Contagem (CPC/15)</h3>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Contagem Estrita em Dias Úteis</p>
                      <p className="text-[11px] text-slate-500">Exclui fins de semana e feriados forenses conforme o art. 219 do CPC/15.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.deadlines.count_business_days}
                      onChange={(e) => setSettings({
                        ...settings,
                        deadlines: { ...settings.deadlines, count_business_days: e.target.checked }
                      })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0 h-4 w-4"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="block text-slate-700 font-medium mb-1">Aviso Prévio de Vencimento (Dias de antecedência)</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={settings.deadlines.default_warning_days}
                      onChange={(e) => setSettings({
                        ...settings,
                        deadlines: { ...settings.deadlines, default_warning_days: parseInt(e.target.value) || 1 }
                      })}
                      className="w-24 px-2 py-1 border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Alertas de Intimação</h3>
                <p className="text-slate-500 text-[11px]">As intimações recebidas pela varredura do Gmail acionam alertas diretos no painel do sistema.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Novo Membro</h4>
            <div>
              <label className="block text-slate-600 mb-1">Nome Completo</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => createUserMutation.mutate(newUser)}
                disabled={!newUser.name || !newUser.email || createUserMutation.isPending}
                className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
