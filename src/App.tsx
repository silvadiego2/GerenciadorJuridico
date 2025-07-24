import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Processes from './pages/Processes';
import Tasks from './pages/Tasks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="processos" element={<Processes />} />
              <Route path="tarefas" element={<Tasks />} />
              <Route path="documentos" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
                  <p className="text-gray-600 mt-2">Módulo em desenvolvimento...</p>
                </div>
              } />
              <Route path="financeiro" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
                  <p className="text-gray-600 mt-2">Módulo em desenvolvimento...</p>
                </div>
              } />
              <Route path="publicacoes" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Publicações</h1>
                  <p className="text-gray-600 mt-2">Módulo em desenvolvimento...</p>
                </div>
              } />
              <Route path="relatorios" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                  <p className="text-gray-600 mt-2">Módulo em desenvolvimento...</p>
                </div>
              } />
              <Route path="configuracoes" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-gray-600 mt-2">Módulo em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;