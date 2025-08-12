import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/services/api';
import syncService from '@/services/syncService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessPatient: (patientId: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Configuração de persistência
const STORAGE_KEYS = {
  TOKEN: 'sapere_token',
  USER: 'sapere_user',
  REMEMBER: 'sapere_remember',
  TOKEN_EXPIRY: 'sapere_token_expiry'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(user && token);

  // Função para limpar dados da sessão
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    
    // Desconectar do serviço de sincronização
    syncService.disconnect();
  }, []);

  // Função para salvar dados da sessão
  const saveAuth = useCallback((authToken: string, authUser: User, remember = false) => {
    setToken(authToken);
    setUser(authUser);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.TOKEN, authToken);
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
    
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
    }

    // Calcular expiração do token (7 dias ou 30 se remember)
    const expiryHours = remember ? 720 : 168; // 30 dias ou 7 dias
    const expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000).getTime();
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());

    // Conectar ao serviço de sincronização
    syncService.connect(authToken);
  }, []);

  // Verificar se o token está expirado
  const isTokenExpired = useCallback(() => {
    const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
  }, []);

  // Função de login
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password, rememberMe);
      saveAuth(response.token, response.user, rememberMe);
    } catch (error: any) {
      clearAuth();
      throw new Error(error.message || 'Erro no login');
    } finally {
      setIsLoading(false);
    }
  }, [saveAuth, clearAuth]);

  // Função de registro
  const register = useCallback(async (email: string, password: string, name: string, role: UserRole = 'profissional') => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(email, password, name, role);
      saveAuth(response.token, response.user);
    } catch (error: any) {
      clearAuth();
      throw new Error(error.message || 'Erro no registro');
    } finally {
      setIsLoading(false);
    }
  }, [saveAuth, clearAuth]);

  // Função de logout
  const logout = useCallback(async () => {
    try {
      // Chamar API de logout se estiver autenticado
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.warn('Erro ao fazer logout na API:', error);
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  // Função para atualizar token
  const refreshToken = useCallback(async () => {
    try {
      if (!token) throw new Error('Não há token para atualizar');
      
      const response = await authAPI.refreshToken();
      const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
      saveAuth(response.token, response.user, remember);
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      clearAuth();
      throw error;
    }
  }, [token, saveAuth, clearAuth]);

  // Função para atualizar perfil
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!token) throw new Error('Token não encontrado');
      
      const response = await authAPI.updateProfile(data);
      const updatedUser = { ...user!, ...response.user };
      setUser(updatedUser);
      
      // Atualizar no storage
      const storage = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true' ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  }, [user, token]);

  // Funções de verificação de permissões
  const hasRole = useCallback((role: UserRole) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const canAccessPatient = useCallback((_patientId: string) => {
    if (!user) return false;
    
    // Admin e profissional podem acessar todos os pacientes
    if (user.role === 'admin' || user.role === 'profissional') {
      return true;
    }
    
    return false;
  }, [user]);

  // Efeito para carregar dados salvos na inicialização
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar localStorage primeiro (remember me)
        let storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        let storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        
        // Se não encontrar no localStorage, verificar sessionStorage
        if (!storedToken) {
          storedToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
          storedUser = sessionStorage.getItem(STORAGE_KEYS.USER);
        }

        if (storedToken && storedUser && !isTokenExpired()) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          
          // Conectar ao serviço de sincronização
          syncService.connect(storedToken);
          
          // Tentar verificar o token em background
          try {
            const verification = await authAPI.verifyToken();
            if (!verification.valid) {
              console.warn('Token inválido, fazendo logout');
              clearAuth();
            }
          } catch (error) {
            console.warn('Erro ao verificar token, fazendo logout:', error);
            clearAuth();
          }
        } else if (storedToken) {
          // Token expirado
          clearAuth();
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isTokenExpired, clearAuth]);

  // Auto-refresh do token (a cada 6 horas)
  useEffect(() => {
    if (!token || !user) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Erro no refresh automático do token:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 horas

    return () => clearInterval(interval);
  }, [token, user, refreshToken]);

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    hasRole,
    hasAnyRole,
    canAccessPatient
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};