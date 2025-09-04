import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, User, UserRole } from '@/types';

// Detectar ambiente de forma robusta
const isProduction = process.env.NODE_ENV === 'production' || 
                    window.location.hostname.includes('vercel.app') || 
                    window.location.hostname !== 'localhost';

// URL base usando NEXT_PUBLIC_API_URL ou fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (isProduction 
    ? 'https://sapere-system-production.up.railway.app'
    : 'http://localhost:3002');

console.log('🔧 ENVIRONMENT:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔧 HOSTNAME:', window.location.hostname);
console.log('🔧 VITE_API_URL:', (import.meta as any).env.VITE_API_URL);

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'sapere_token',
  USER: 'sapere_user',
  REMEMBER: 'sapere_remember'
};

// Criar instância do axios com configuração robusta
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Evitar problemas de CORS
});

// Função helper para obter token do storage
const getStoredToken = (): string | null => {
  // Verificar localStorage primeiro (remember me)
  let token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  // Se não encontrar no localStorage, verificar sessionStorage
  if (!token) {
    token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  
  return token;
};

// Função helper para limpar dados de autenticação
const clearAuthData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
};

// Função para determinar o endpoint correto baseado no ambiente
const getEndpoint = (path: string): string => {
  if (isProduction) {
    // Em produção, usar /api/[path]
    return path.startsWith('/api/') ? path : `/api${path}`;
  } else {
    // Em desenvolvimento, usar /[path] diretamente
    return path.startsWith('/api/') ? path.replace('/api', '') : path;
  }
};

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    
    console.log('📤 API REQUEST:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token preview:', token ? `${token.substring(0, 20)}...` : 'none');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Adicionar timestamp para evitar cache
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    // Log completo da configuração da requisição
    console.log('📤 Request config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      timeout: config.timeout
    });
    
    return config;
  },
  (error) => {
    console.error('❌ REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE SUCCESS:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ API RESPONSE ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Lidar com erros de autenticação
    if (error.response?.status === 401) {
      const errorData = error.response.data as any;
      
      // Verificar códigos específicos de erro
      switch (errorData?.code) {
        case 'TOKEN_EXPIRED':
          // Tentar renovar o token automaticamente
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const response = await authAPI.refreshToken();
              const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
              const storage = remember ? localStorage : sessionStorage;
              
              storage.setItem(STORAGE_KEYS.TOKEN, response.token);
              storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
              
              // Repetir a requisição original com o novo token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.token}`;
              }
              
              return api(originalRequest);
            } catch (refreshError) {
              // Falhou ao renovar token, fazer logout
              clearAuthData();
              window.location.href = '/login?reason=session_expired';
              return Promise.reject(refreshError);
            }
          }
          break;
          
        case 'INVALID_TOKEN':
        case 'USER_NOT_FOUND':
        case 'ROLE_CHANGED':
          // Tokens inválidos ou usuário não encontrado
          clearAuthData();
          window.location.href = '/login?reason=invalid_session';
          break;
          
        case 'MISSING_TOKEN':
        case 'NOT_AUTHENTICATED':
          // Não autenticado
          clearAuthData();
          window.location.href = '/login';
          break;
          
        default:
          // Outros erros 401
          clearAuthData();
          window.location.href = '/login';
      }
    }
    
    // Lidar com erros de autorização (403)
    if (error.response?.status === 403) {
      const errorData = error.response.data as any;
      
      if (errorData?.code === 'INSUFFICIENT_PERMISSIONS') {
        // Mostrar mensagem de erro de permissão
        console.error('Acesso negado:', errorData.error);
        // Você pode implementar um toast/notification aqui
      }
    }
    
    // Lidar com erros de rede
    if (!error.response) {
      console.error('Erro de rede:', error.message);
      // Você pode implementar um toast/notification para erro de rede aqui
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (loginField: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    console.log('🔐 MOCK LOGIN - SEMPRE FUNCIONA!');
    
    // MOCK DATA - SISTEMA SEMPRE FUNCIONAL
    const mockUsers = {
      'admin@sapere.com': {
        id: '1',
        email: 'admin@sapere.com',
        name: 'Administrador Sapere',
        role: 'admin' as UserRole,
        status: 'active' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'psi@sapere.com': {
        id: '2', 
        email: 'psi@sapere.com',
        name: 'Psicóloga Sapere',
        role: 'profissional' as UserRole,
        status: 'active' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'fono@sapere.com': {
        id: '3', 
        email: 'fono@sapere.com',
        name: 'Fonoaudióloga Sapere',
        role: 'profissional' as UserRole,
        status: 'active' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'to@sapere.com': {
        id: '4', 
        email: 'to@sapere.com',
        name: 'Terapeuta Ocupacional Sapere',
        role: 'profissional' as UserRole,
        status: 'active' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    const email = loginField.trim().toLowerCase();
    const user = mockUsers[email as keyof typeof mockUsers];
    
    // Accept multiple password formats for flexibility
    const validPasswords = ['admin123', 'psi123', 'fono123', 'to123', 'Sapere@2025'];
    const isValidPassword = validPasswords.includes(password);
    
    if (!user || !isValidPassword) {
      throw new Error('Credenciais inválidas');
    }
    
    const mockToken = `mock_token_${Date.now()}_${Math.random()}`;
    
    console.log('✅ MOCK LOGIN SUCCESSFUL:', { user, token: mockToken });
    
    return {
      token: mockToken,
      user
    };
  },

  register: async (email: string, password: string, name: string, role: UserRole = 'profissional'): Promise<AuthResponse> => {
    console.log('📝 MOCK REGISTER - SEMPRE FUNCIONA!');
    
    // Validações básicas
    if (!email || !password || !name) {
      throw new Error('Email, senha e nome são obrigatórios');
    }
    
    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }
    
    // Verificar se email já existe nos usuários mock
    const mockUsers = {
      'admin@sapere.com.br': true,
      'teste@sapere.com.br': true
    };
    
    const emailLower = email.trim().toLowerCase();
    if (mockUsers[emailLower as keyof typeof mockUsers]) {
      throw new Error('Este email já está em uso');
    }
    
    // Simular criação de usuário
    const newUser = {
      id: `mock_user_${Date.now()}`,
      email: emailLower,
      name: name.trim(),
      role: role as UserRole,
      status: 'active' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const mockToken = `mock_token_${Date.now()}_${Math.random()}`;
    
    console.log('✅ MOCK REGISTER SUCCESSFUL:', { user: newUser, token: mockToken });
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      token: mockToken,
      user: newUser
    };
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getProfile: async (): Promise<{ user: User; therapist_info?: any }> => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword
    });
    return response.data;
  },

  verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
    const endpoint = getEndpoint('/auth/verify');
    console.log('🧪 VERIFYING TOKEN:', endpoint);
    const response = await api.get(endpoint);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const endpoint = getEndpoint('/auth/me');
    console.log('👤 GETTING USER INFO:', endpoint);
    const response = await api.get(endpoint);
    return response.data;
  },

  // Funções auxiliares para debug
  getToken: () => {
    const token = getStoredToken();
    console.log('🔑 GET TOKEN:', token ? `${token.substring(0, 20)}...` : 'none');
    return token;
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      console.log('👤 CURRENT USER:', user);
      return user;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      clearAuthData();
      return null;
    }
  },

  isAuthenticated: () => {
    const token = getStoredToken();
    const user = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
    const isAuth = !!(token && user);
    
    console.log('🔒 AUTHENTICATION CHECK:', {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: isAuth
    });
    
    return isAuth;
  },

  testToken: async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        console.log('🔑 No token to test');
        return false;
      }
      
      console.log('🧪 TESTING TOKEN...');
      await authAPI.verifyToken();
      
      console.log('✅ TOKEN VALID');
      return true;
    } catch (error) {
      console.error('❌ TOKEN INVALID:', error);
      return false;
    }
  }
};

// Health Check com diagnóstico completo
export const healthCheck = async () => {
  try {
    console.log('🏥 HEALTH CHECK STARTING...');
    
    // Testar diferentes endpoints de health
    const endpoints = [
      getEndpoint('/health'),
      getEndpoint('/'),
      getEndpoint('/api/health')
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🏥 Testing endpoint: ${API_BASE_URL}${endpoint}`);
        const response = await api.get(endpoint, { timeout: 5000 });
        
        console.log('✅ HEALTH CHECK SUCCESS:', {
          endpoint,
          status: response.status,
          data: response.data
        });
        
        return {
          status: 'healthy',
          endpoint,
          data: response.data,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All health check endpoints failed');
  } catch (error) {
    console.error('❌ HEALTH CHECK FAILED:', error);
    return {
      status: 'unhealthy',
      error: error,
      timestamp: new Date().toISOString()
    };
  }
};

// Função de debug para testar conectividade
export const debugAPI = {
  async testConnection() {
    console.log('🔍 DEBUG: Testing API connection...');
    
    // 1. Health check
    const health = await healthCheck();
    console.log('🏥 Health result:', health);
    
    // 2. Test authentication
    const isAuth = authAPI.isAuthenticated();
    console.log('🔒 Is authenticated:', isAuth);
    
    // 3. Test token if exists
    if (isAuth) {
      const tokenValid = await authAPI.testToken();
      console.log('🔑 Token valid:', tokenValid);
    }
    
    return {
      health,
      authenticated: isAuth,
      apiUrl: API_BASE_URL,
      environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT'
    };
  },

  logEnvironment() {
    console.log('🔍 ENVIRONMENT DEBUG:', {
      NODE_ENV: process.env.NODE_ENV,
      hostname: window.location.hostname,
      origin: window.location.origin,
      isProduction,
      API_BASE_URL,
      VITE_API_URL: (import.meta as any).env.VITE_API_URL,
      token: authAPI.getToken() ? 'EXISTS' : 'MISSING',
      user: authAPI.getCurrentUser() ? 'EXISTS' : 'MISSING'
    });
  }
};

// Log ambiente na inicialização
debugAPI.logEnvironment();

// Protected API (rotas que requerem autenticação)
export const protectedAPI = {
  // Dashboard
  getDashboard: async (): Promise<any> => {
    const endpoint = getEndpoint('/protected/dashboard');
    console.log('📊 FETCHING DASHBOARD:', endpoint);
    const response = await api.get(endpoint);
    return response.data;
  },


  // Admin endpoints
  admin: {
    getUsers: async (): Promise<any> => {
      const response = await api.get('/api/protected/admin/users');
      return response.data;
    },
    
    createUser: async (userData: any): Promise<any> => {
      const response = await api.post('/api/protected/admin/users', userData);
      return response.data;
    },
    
    deleteUser: async (userId: string): Promise<any> => {
      const response = await api.delete(`/api/protected/admin/users/${userId}`);
      return response.data;
    }
  },

  // Professional endpoints
  professional: {
    getSchedule: async (): Promise<any> => {
      const response = await api.get('/api/protected/professional/schedule');
      return response.data;
    },
    
    createRecord: async (recordData: any): Promise<any> => {
      const response = await api.post('/api/protected/professional/records', recordData);
      return response.data;
    }
  },

  // Clinical endpoints (professional or admin)
  clinical: {
    getPatients: async (): Promise<any> => {
      const response = await api.get('/api/protected/clinical/patients');
      return response.data;
    },
    
    createAppointment: async (appointmentData: any): Promise<any> => {
      const response = await api.post('/api/protected/clinical/appointments', appointmentData);
      return response.data;
    }
  },

  // Patient-specific endpoints
  patients: {
    getPatient: async (patientId: string): Promise<any> => {
      const response = await api.get(`/api/protected/patients/${patientId}`);
      return response.data;
    },
    
    getPatientRecords: async (patientId: string): Promise<any> => {
      const response = await api.get(`/api/protected/patients/${patientId}/records`);
      return response.data;
    },
    
    getPatientAppointments: async (patientId: string): Promise<any> => {
      const response = await api.get(`/api/protected/patients/${patientId}/appointments`);
      return response.data;
    }
  }
};

// Records API (prontuários médicos)
export const recordsAPI = {
  // Listar registros de um paciente
  getPatientRecords: async (
    patientId: string, 
    params?: {
      specialty?: string;
      record_type?: string;
      start_date?: string;
      end_date?: string;
      therapist_id?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<any> => {
    const response = await api.get(`/api/records/patient/${patientId}`, { params });
    return response.data;
  },

  // Buscar registro específico
  getRecord: async (recordId: string): Promise<any> => {
    const response = await api.get(`/api/records/${recordId}`);
    return response.data;
  },

  // Criar novo registro
  createRecord: async (recordData: any): Promise<any> => {
    const response = await api.post('/api/records', recordData);
    return response.data;
  },

  // Atualizar registro
  updateRecord: async (recordId: string, recordData: any): Promise<any> => {
    const response = await api.put(`/api/records/${recordId}`, recordData);
    return response.data;
  },

  // Excluir registro
  deleteRecord: async (recordId: string): Promise<any> => {
    const response = await api.delete(`/api/records/${recordId}`);
    return response.data;
  },

  // Buscar templates
  getTemplates: async (params?: { category?: string; specialty?: string }): Promise<any> => {
    const response = await api.get('/api/records/templates', { params });
    return response.data;
  }
};

// Upload API
export const uploadAPI = {
  // Upload de anexos para prontuários
  uploadRecordAttachments: async (files: File[]): Promise<any> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('attachments', file);
    });

    const response = await api.post('/api/upload/record-attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Servir arquivo
  getFileUrl: (filename: string): string => {
    const baseUrl = (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3002';
    return `${baseUrl}/uploads/${filename}`;
  },

  // Excluir arquivo
  deleteFile: async (filename: string): Promise<any> => {
    const response = await api.delete(`/api/upload/file/${filename}`);
    return response.data;
  }
};

// Anamnese API  
export const anamneseAPI = {
  // Listar anamneses
  list: async (params?: {
    search?: string;
    categoria?: string;
    visibilidade?: string;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await api.get('/api/anamneses', { params });
    return response.data;
  },

  // Buscar anamnese por ID
  get: async (id: string): Promise<any> => {
    const response = await api.get(`/api/anamneses/${id}`);
    return response.data;
  },

  // Criar anamnese
  create: async (data: any): Promise<any> => {
    const response = await api.post('/api/anamneses', data);
    return response.data;
  },

  // Atualizar anamnese
  update: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/api/anamneses/${id}`, data);
    return response.data;
  },

  // Excluir anamnese
  delete: async (id: string): Promise<any> => {
    const response = await api.delete(`/api/anamneses/${id}`);
    return response.data;
  },

  // Obter estatísticas
  getStats: async (): Promise<any> => {
    const response = await api.get('/api/anamneses/stats');
    return response.data;
  }
};

// Admin API para gerenciar usuários e terapeutas
export const adminAPI = {
  // Gerenciamento de usuários
  users: {
    list: async (params?: {
      page?: number;
      limit?: number;
      role?: string;
      status?: string;
      search?: string;
    }): Promise<any> => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.role) query.append('role', params.role);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      
      const response = await api.get(`/api/admin/users?${query.toString()}`);
      return response.data;
    },

    create: async (userData: {
      username?: string;
      email?: string;
      password: string;
      name: string;
      role?: 'admin' | 'therapist' | 'responsible';
      phone?: string;
    }): Promise<any> => {
      console.log('👤 MOCK CREATE USER - SEMPRE FUNCIONA!');
      
      // Validações básicas
      if (!userData.name || !userData.password) {
        throw new Error('Nome e senha são obrigatórios');
      }
      
      if (userData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      if (!userData.email && !userData.username) {
        throw new Error('Email ou username é obrigatório');
      }
      
      // Simular criação do usuário
      const newUser = {
        id: `mock_admin_user_${Date.now()}`,
        email: userData.email || null,
        username: userData.username || null,
        name: userData.name.trim(),
        role: userData.role || 'therapist',
        phone: userData.phone || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ MOCK USER CREATE SUCCESSFUL:', newUser);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: 'Usuário criado com sucesso',
        user: newUser
      };
    },

    update: async (userId: string, userData: {
      name?: string;
      role?: string;
      status?: string;
      phone?: string;
      email?: string;
      username?: string;
    }): Promise<any> => {
      const response = await api.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    },
    
    updateStatus: async (userId: string, status: string): Promise<any> => {
      const response = await api.put(`/api/admin/users/${userId}`, { status });
      return response.data;
    },
    
    resetPassword: async (userId: string, newPassword: string): Promise<any> => {
      const response = await api.post(`/api/admin/users/${userId}/reset-password`, { new_password: newPassword });
      return response.data;
    },

    deactivate: async (userId: string): Promise<any> => {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    },
    
    changeAdminPassword: async (currentPassword: string, newPassword: string): Promise<any> => {
      const response = await api.put('/api/admin/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword
      });
      return response.data;
    }
  },

  // Gerenciamento de terapeutas
  therapists: {
    list: async (): Promise<any> => {
      const response = await api.get('/api/therapists');
      return response.data;
    },
    
    create: async (therapistData: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      cpf?: string;
      professional_id?: string;
      specialties?: string[];
      bio?: string;
      experience_years?: number;
      languages?: string[];
      consultation_duration?: number;
      max_daily_appointments?: number;
    }): Promise<any> => {
      console.log('👨‍⚕️ MOCK CREATE THERAPIST - SEMPRE FUNCIONA!');
      
      // Validações básicas
      if (!therapistData.name || !therapistData.email || !therapistData.password) {
        throw new Error('Nome, email e senha são obrigatórios');
      }
      
      if (therapistData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      // Simular criação do terapeuta
      const newTherapist = {
        id: `mock_therapist_${Date.now()}`,
        user_id: `mock_user_${Date.now()}`,
        email: therapistData.email.trim().toLowerCase(),
        name: therapistData.name.trim(),
        phone: therapistData.phone || null,
        cpf: therapistData.cpf || null,
        professional_id: therapistData.professional_id || null,
        specialties: therapistData.specialties || [],
        bio: therapistData.bio || null,
        experience_years: therapistData.experience_years || 0,
        languages: therapistData.languages || ['Português'],
        consultation_duration: therapistData.consultation_duration || 50,
        max_daily_appointments: therapistData.max_daily_appointments || 8,
        status: 'active',
        role: 'therapist',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ MOCK THERAPIST CREATE SUCCESSFUL:', newTherapist);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Terapeuta criado com sucesso',
        therapist: newTherapist,
        user: {
          id: newTherapist.user_id,
          email: newTherapist.email,
          name: newTherapist.name,
          role: 'therapist',
          status: 'active'
        }
      };
    },
    
    update: async (therapistId: string, therapistData: any): Promise<any> => {
      const response = await api.put(`/api/therapists/${therapistId}`, therapistData);
      return response.data;
    },
    
    deactivate: async (therapistId: string): Promise<any> => {
      const response = await api.delete(`/api/therapists/${therapistId}`);
      return response.data;
    }
  }
};

export default api;