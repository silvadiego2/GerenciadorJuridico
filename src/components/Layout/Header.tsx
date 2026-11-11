// src/components/Layout/Header.tsx
import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuthContext();

  return (
    <header className="bg-white border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3 select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Esquerda: Botão Menu e Busca Global */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-md">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Alternar barra lateral"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Buscar processos, clientes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:border-slate-400 text-slate-800 transition-colors"
            />
          </div>
        </div>

        {/* Direita: Notificações e Perfil do Usuário */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          <button 
            className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Intimações e Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute 0 top-1 right-1 bg-amber-600 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Operador'}</p>
              <p className="text-[10px] text-slate-400 capitalize font-mono">{user?.role || 'Advogado'}</p>
            </div>
            <div className="w-7 h-7 bg-slate-800 text-slate-100 rounded-md flex items-center justify-center text-xs font-semibold shadow-2xs">
              {user?.name?.charAt(0) || 'D'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
