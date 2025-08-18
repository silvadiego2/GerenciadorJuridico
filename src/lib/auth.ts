import { User } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciais inválidas');
      }

      const { user, token } = await response.json();
      
      // Armazenar token e dados do usuário
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem(USER_KEY);
    
    if (!token || !userData) {
      return null;
    }
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  verifyToken: async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return null;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        // Token inválido, limpar storage
        authService.logout();
        return null;
      }
      
      const { user } = await response.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      authService.logout();
      return null;
    }
  },
};