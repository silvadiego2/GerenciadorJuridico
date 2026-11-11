// src/components/Layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  File, 
  CheckSquare, 
  DollarSign, 
  BookOpen, 
  BarChart3, 
  Settings,
  Scale,
  LogOut,
  Link as LinkIcon,
  Search,
  Shield
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { user, logout } = useAuthContext();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Processos', href: '/processos', icon: Scale },
    { name: 'Consulta OAB', href: '/consulta-oab', icon: Search },
    { name: 'Tarefas', href: '/tarefas', icon: CheckSquare },
    { name: 'Documentos', href: '/documentos', icon: File },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { name: 'Publicações', href: '/publicacoes', icon: BookOpen },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { name: 'Integrações', href: '/integracoes', icon: LinkIcon },
  ];

  const adminNavigation = [
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <div
      className={clsx(
        'bg-slate-950 text-slate-300 h-full flex flex-col border-r border-slate-800 transition-all duration-300 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Topo / Logo */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-slate-100 flex-shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-tight">LegalTech</h1>
              <p className="text-[11px] text-slate-400 font-mono">Gestão Jurídica</p>
            </div>
          )}
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Operacional
          </p>
        )}
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-xs transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-medium border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1">
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Administração
              </p>
            )}
            {adminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-xs transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white font-medium border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Informações do Usuário e Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        {!collapsed && (
          <div className="mb-2.5 px-2 py-1.5 rounded-md bg-slate-900/60 border border-slate-800/60">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Operador'}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span className="capitalize text-slate-400">{user?.role || 'Usuário'}</span>
              {user?.oab && <span className="font-mono text-slate-400">| OAB: {user.oab}</span>}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-md text-xs text-slate-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors w-full"
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Encerrar Sessão</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
