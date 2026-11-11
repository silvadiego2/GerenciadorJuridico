// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import NotificationContainer from './components/Layout/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Páginas do Gerenciador Jurídico
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
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <NotificationContainer />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="processos" element={<Processes />} />
              
              {/* Redirecionamento da Consulta OAB e Integrações para a central em Processos */}
              <Route path="consulta-oab" element={<Navigate to="/processos" replace />} />
              <Route path="integracoes" element={<Navigate to="/configuracoes" replace />} />
              
              <Route path="tarefas" element={<Tasks />} />
              <Route path="documentos" element={<Documents />} />
              <Route path="financeiro" element={<Financial />} />
              <Route path="publicacoes" element={<Publications />} />
              <Route path="relatorios" element={<Reports />} />
              
              <Route
                path="configuracoes"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Redirecionamento da rota legada de usuários */}
              <Route
                path="usuarios"
                element={<Navigate to="/configuracoes" replace />}
              />
            </Route>

            {/* Fallback de rotas inexistentes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
