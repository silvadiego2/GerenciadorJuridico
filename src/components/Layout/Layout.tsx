// src/components/Layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Fecha o menu móvel automaticamente ao trocar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    // Em telas móveis alterna o drawer; no desktop alterna o modo enxuto (collapsed)
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800 antialiased">
      {/* Backdrop móvel escurecido quando a gaveta estiver aberta */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-2xs lg:hidden transition-opacity"
        />
      )}

      {/* Menu Lateral: gaveta fixa no mobile / coluna expansível no desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />

        {/* Área de rolagem das páginas */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 bg-slate-100/70">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
