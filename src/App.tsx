import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import Sidebar from './components/Layout/Sidebar';

// Páginas
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Processes from './pages/Processes';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import Financial from './pages/Financial';
import Publications from './pages/Publications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Barra lateral fixa (desktop) e gaveta retrátil (mobile) */}
      <Sidebar />

      {/* Conteúdo Principal com espaçamentos calculados para mobile e desktop */}
      <main className="flex-1 lg:pl-64 pt-14 lg:pt-0 min-w-0 transition-all">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/processos" element={<Processes />} />
            <Route path="/tarefas" element={<Tasks />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/financeiro" element={<Financial />} />
            <Route path="/publicacoes" element={<Publications />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />

            {/* Redirecionamento da rota legada de usuários para a aba unificada em configurações */}
            <Route path="/usuarios" element={<Navigate to="/configuracoes" replace />} />

            {/* Fallback para rotas inexistentes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
