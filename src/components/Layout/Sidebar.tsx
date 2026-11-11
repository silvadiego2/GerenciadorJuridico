import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Scale, 
  CheckSquare, 
  FileText, 
  DollarSign, 
  Bell, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Painel Geral', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Clientes', icon: Users, path: '/clientes' },
    { label: 'Acervo Processual', icon: Scale, path: '/processos' },
    { label: 'Tarefas e Prazos', icon: CheckSquare, path: '/tarefas' },
    { label: 'Documentos', icon: FileText, path: '/documentos' },
    { label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
    { label: 'Publicações DJE', icon: Bell, path: '/publicacoes' },
    { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
    { label: 'Configurações', icon: SettingsIcon, path: '/configuracoes' },
  ];

  return (
    <>
      {/* Botão de Menu para Dispositivos Móveis */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Scale className="h-4 w-4 text-slate-200" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight text-sm">LegalTech Gestão</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop para mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Painel Lateral */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Topo / Logo */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xs">
              <Scale className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <span className="font-semibold text-slate-100 text-sm tracking-tight block leading-tight">LegalTech</span>
              <span className="text-[11px] text-slate-400 font-mono">Gestão Jurídica</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos Principais
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors
                ${isActive 
                  ? 'bg-slate-800 text-white font-semibold border-l-2 border-indigo-500 pl-2.5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }
              `}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Rodapé do Usuário */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-md bg-slate-900/70 border border-slate-800">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                DS
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-200 truncate">Diego da Silva</p>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Admin
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
