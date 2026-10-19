import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Normaliza o utilizador retornado pelo Supabase para o formato da interface User
  const mapSupabaseUser = (sbUser: any): User => {
    return {
      id: sbUser.id,
      name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Utilizador',
      email: sbUser.email || '',
      role: sbUser.user_metadata?.role || 'admin',
      avatar: sbUser.user_metadata?.avatar_url || undefined,
      createdAt: sbUser.created_at || new Date().toISOString(),
      updatedAt: sbUser.updated_at || new Date().toISOString(),
    } as User;
  };

  useEffect(() => {
    // 1. Obter a sessão inicial ao carregar a página
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão do Supabase:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Escutar eventos em tempo real (LOGIN, LOGOUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message || 'Falha ao autenticar.');
    }

    if (!data.user) {
      setLoading(false);
      throw new Error('Utilizador não retornado pelo servidor.');
    }

    const mappedUser = mapSupabaseUser(data.user);
    setUser(mappedUser);
    setLoading(false);
    return mappedUser;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao encerrar sessão:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
