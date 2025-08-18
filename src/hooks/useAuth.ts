import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Primeiro tenta pegar do localStorage
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          // Verifica se o token ainda é válido
          const verifiedUser = await authService.verifyToken();
          setUser(verifiedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await authService.login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};