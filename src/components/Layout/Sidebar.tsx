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
  Bell,
  LogOut,
  Link,
  UserPlus
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
    { name: 'Tarefas', href: '/tarefas', icon: CheckSquare },
    { name: 'Documentos', href: '/documentos', icon: File },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { name: 'Publicações', href: '/publicacoes', icon: BookOpen },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { name: 'Integrações', href: '/integracoes', icon: Link },
  ];

  const adminNavigation = [
    { name: 'Usuários', href: '/usuarios', icon: UserPlus },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <div className={clsx(
      'bg-slate-900 text-white h-full flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Scale className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">LegalTech</h1>
              <p className="text-xs text-slate-400">Gestão Jurídica</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 border-t border-slate-700 mt-4">
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
            {user?.oab && <p className="text-xs text-slate-400">OAB: {user.oab}</p>}
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
