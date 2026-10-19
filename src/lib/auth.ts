import { supabase } from './supabaseClient';
import { User } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Mapeia o utilizador retornado pelo Supabase para o tipo User do projeto
const mapUser = (sbUser: any, profile?: any): User => {
  return {
    id: sbUser.id,
    name: profile?.name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Usuário',
    email: sbUser.email || '',
    role: (profile?.role || sbUser.user_metadata?.role || 'admin') as any,
    oab: profile?.oab || sbUser.user_metadata?.oab || undefined,
    phone: profile?.phone || sbUser.user_metadata?.phone || undefined,
    avatar: profile?.avatar || sbUser.user_metadata?.avatar_url || undefined,
    createdAt: profile?.created_at || sbUser.created_at || new Date().toISOString(),
    updatedAt: profile?.updated_at || sbUser.updated_at || new Date().toISOString(),
  };
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Credenciais inválidas');
      }

      if (!data.user || !data.session) {
        throw new Error('Falha ao autenticar no servidor.');
      }

      // Procura dados complementares na tabela public.users
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user = mapUser(data.user, profile);

      localStorage.setItem(TOKEN_KEY, data.session.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    oab?: string;
    phone?: string;
  }): Promise<User> => {
    try {
      // 1. Cadastra no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            oab: userData.oab || null,
            phone: userData.phone || null,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      if (!data.user) {
        throw new Error('Não foi possível obter os dados do usuário registrado.');
      }

      // 2. Insere na tabela public.users
      const profileData = {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        oab: userData.oab || null,
        phone: userData.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('users')
        .insert([profileData]);

      if (profileError) {
        console.warn('Aviso: perfil público já existe ou erro na criação:', profileError.message);
      }

      const user = mapUser(data.user, profileData);
      return user;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao encerrar sessão no Supabase:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
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
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        authService.logout();
        return null;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const user = mapUser(session.user, profile);

      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Erro na verificação de token:', error);
      authService.logout();
      return null;
    }
  },
};
