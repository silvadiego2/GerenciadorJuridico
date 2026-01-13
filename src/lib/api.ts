// Cliente HTTP para comunicação com o backend
import { mockClients, mockProcesses, mockTasks, mockDashboard } from './mock-data';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class ApiClient {
  private _baseURL: string;

  constructor(baseURL: string) {
    this._baseURL = baseURL;
  }

  get baseURL(): string {
    return this._baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private getMockData<T>(endpoint: string): T | null {
    if (endpoint === '/api/clients') return { clients: mockClients } as unknown as T;
    if (endpoint === '/api/processes') return { processes: mockProcesses } as unknown as T;
    if (endpoint === '/api/tasks') return { tasks: mockTasks } as unknown as T;
    if (endpoint === '/api/dashboard/summary') return mockDashboard as unknown as T;
    if (endpoint === '/api/dashboard/stats') return mockDashboard as unknown as T;
    if (endpoint === '/api/financial') return { entries: [] } as unknown as T;
    if (endpoint === '/api/financial/summary') return { totalReceitas: 0, totalDespesas: 0, saldoLiquido: 0, honorariosPendentes: 0, despesasVencidas: 0 } as unknown as T;
    if (endpoint === '/api/publications') return { publications: [] } as unknown as T;
    if (endpoint === '/api/documents') return { documents: [] } as unknown as T;
    if (endpoint === '/api/users') return { users: [] } as unknown as T;
    if (endpoint === '/api/reports') return {
      overview: { totalProcesses: 150, totalClients: 89, totalRevenue: 85000, totalTasks: 65, completedTasks: 42, overdueTasks: 8, pendingPublications: 12 },
      processesByStatus: [{ name: 'Ativo', value: 120, color: '#3B82F6' }, { name: 'Arquivado', value: 30, color: '#10B981' }],
      processesByMonth: [{ month: 'Jan', processos: 12, receita: 75000 }],
      tasksByPriority: [{ priority: 'Alta', count: 18, color: '#F59E0B' }],
      productivityByUser: [],
      clientsByType: [{ name: 'Pessoa Física', value: 45 }],
      expensesByCategory: [],
      deadlinesByUrgency: [],
      revenueByMonth: [],
    } as unknown as T;
    return null;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      const url = new URL(`${this._baseURL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      const mockData = this.getMockData<T>(endpoint);
      if (mockData) {
        console.warn(`Usando mock para ${endpoint}`);
        return mockData;
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this._baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      const mockData = this.getMockData<T>(endpoint);
      if (mockData) {
        console.warn(`Usando mock para ${endpoint}`);
        return mockData;
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this._baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      const mockData = this.getMockData<T>(endpoint);
      if (mockData) {
        console.warn(`Usando mock para ${endpoint}`);
        return mockData;
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this._baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Erro ao deletar ${endpoint}:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(BACKEND_URL);

// Serviços específicos
export const clientsService = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get('/api/clients', params),
  
  getById: (id: string) => 
    apiClient.get(`/api/clients/${id}`),
  
  create: (data: any) => 
    apiClient.post('/api/clients', data),
  
  update: (id: string, data: any) => 
    apiClient.put(`/api/clients/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/api/clients/${id}`),
};

export const processesService = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get('/api/processes', params),
  
  getById: (id: string) => 
    apiClient.get(`/api/processes/${id}`),
  
  create: (data: any) => 
    apiClient.post('/api/processes', data),
  
  update: (id: string, data: any) => 
    apiClient.put(`/api/processes/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/api/processes/${id}`),
};

export const tasksService = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get('/api/tasks', params),
  
  create: (data: any) => 
    apiClient.post('/api/tasks', data),
  
  update: (id: string, data: any) => 
    apiClient.put(`/api/tasks/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/api/tasks/${id}`),
};

export const documentsService = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get('/api/documents', params),
  
  getById: (id: string) => 
    apiClient.get(`/api/documents/${id}`),
  
  create: (data: any) => 
    apiClient.post('/api/documents', data),
  
  update: (id: string, data: any) => 
    apiClient.put(`/api/documents/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/api/documents/${id}`),
};

export const financialService = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get('/api/financial', params),
  
  getSummary: () => 
    apiClient.get('/api/financial/summary'),
  
  create: (data: any) => 
    apiClient.post('/api/financial', data),
  
  update: (id: string, data: any) => 
    apiClient.put(`/api/financial/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/api/financial/${id}`),
};

export const publicationsService = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get('/api/publications', params),
  
  acknowledge: (id: string) => 
    apiClient.put(`/api/publications/${id}/acknowledge`),
  
  markAsRead: (id: string) => 
    apiClient.put(`/api/publications/${id}/read`),
  
  create: (data: any) => 
    apiClient.post('/api/publications', data),
};

export const integrationsService = {
  searchDataJud: (data: { numeroProcesso: string; tribunal: string }) => 
    apiClient.post('/api/integrations/datajud/search', data),
  
  getTJBATransparency: (data: { type: 'indicators' | 'metas' }) => 
    apiClient.post('/api/integrations/tjba/transparency', data),
  
  getConfigs: () => 
    apiClient.get('/api/integrations/config'),
  
  saveConfig: (data: any) => 
    apiClient.post('/api/integrations/config', data),
};

export const dashboardService = {
  getSummary: () => 
    apiClient.get('/api/dashboard/summary'),
  
  getStats: (period?: string) => 
    apiClient.get('/api/dashboard/stats', period ? { period } : undefined),
};

export const usersService = {
  getAll: () =>
    apiClient.get('/api/users'),

  getById: (id: string) =>
    apiClient.get(`/api/users/${id}`),

  update: (id: string, data: any) =>
    apiClient.put(`/api/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/users/${id}`),
};

export const reportsService = {
  getData: (reportType: string, dateRange: string) =>
    apiClient.get('/api/reports', { type: reportType, range: dateRange }),

  exportPDF: async (reportType: string, dateRange: string): Promise<Blob> => {
    const response = await fetch(`${apiClient.baseURL}/api/reports/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ type: reportType, range: dateRange }),
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar relatório');
    }

    return response.blob();
  },
};