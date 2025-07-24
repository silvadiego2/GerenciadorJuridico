import { User } from '../types';

const STORAGE_KEY = 'auth_user';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simular login
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Dr. João Silva',
        email: 'joao@escritorio.com',
        role: 'advogado',
        oab: 'BA 12345',
        phone: '(71) 99999-9999',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@escritorio.com',
        role: 'estagiario',
        phone: '(71) 88888-8888',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Carlos Administrador',
        email: 'admin@escritorio.com',
        role: 'admin',
        phone: '(71) 77777-7777',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        role: 'cliente',
        phone: '(71) 66666-6666',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};