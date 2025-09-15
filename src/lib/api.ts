// Cliente HTTP para comunicação com o backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
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

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
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
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
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