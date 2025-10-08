import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  TOKEN: 'sapere_token',
  USER: 'sapere_user',
  REMEMBER: 'sapere_remember'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(user && token);

  // Limpar autenticação
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Login
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('🔐 Iniciando login...');
      const response = await authAPI.login(email, password, rememberMe);
      
      const { token: newToken, user: newUser } = response;
      
      setToken(newToken);
      setUser(newUser);
      
      // Armazenar dados
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEYS.TOKEN, newToken);
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
      }
      
      console.log('✅ Login realizado com sucesso');
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      clearAuth();
    }
  };

  // Verificar papel do usuário
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Verificar se usuário tem qualquer um dos papéis
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  // Atualizar perfil do usuário
  const updateProfile = async (data: Partial<User>) => {
    try {
      console.log('🔄 Atualizando perfil...');
      const response = await authAPI.updateProfile(data);

      const updatedUser = response.user;
      setUser(updatedUser);

      // Atualizar no storage
      const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      console.log('✅ Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Carregar dados da sessão
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN) ||
                           sessionStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER) ||
                          sessionStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          console.log('🔄 Restaurando sessão...');

          // IMPORTANTE: Setar usuário e token ANTES de verificar
          // Isso evita tela branca enquanto verifica
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
            console.log('✅ Sessão restaurada:', parsedUser.email);
          } catch (parseError) {
            console.error('Erro ao parsear usuário:', parseError);
            clearAuth();
          }
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        clearAuth();
      } finally {
        // SEMPRE liberar loading após 500ms máximo
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };

    loadSession();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};