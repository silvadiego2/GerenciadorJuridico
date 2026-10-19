import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Valida se há uma sessão persistida no Supabase
        const verifiedUser = await authService.verifyToken();
        setUser(verifiedUser);
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Mantém a escuta ativa de mudanças de estado de autenticação em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const verified = await authService.verifyToken();
        setUser(verified);
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
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
