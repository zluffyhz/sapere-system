import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, User, UserRole } from '@/types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'sapere_token',
  USER: 'sapere_user',
  REMEMBER: 'sapere_remember'
};

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos
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

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Adicionar timestamp para evitar cache
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  (response) => {
    // Resposta bem-sucedida
    return response;
  },
  async (error: AxiosError) => {
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
    const response = await api.post('/api/auth/login', { 
      email: loginField,  // Backend espera "email" e "password"
      password, 
      remember_me: rememberMe 
    });
    return response.data;
  },

  register: async (email: string, password: string, name: string, role: UserRole = 'profissional'): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', { 
      email, 
      password, 
      name, 
      role 
    });
    return response.data;
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
    const response = await api.get('/api/auth/verify');
    return response.data;
  }
};

// Protected API (rotas que requerem autenticação)
export const protectedAPI = {
  // Dashboard
  getDashboard: async (): Promise<any> => {
    const response = await api.get('/api/protected/dashboard');
    return response.data;
  },

  // Testes de roles
  testRoles: async (): Promise<any> => {
    const response = await api.get('/api/protected/test/roles');
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
      const response = await api.post('/api/admin/users', userData);
      return response.data;
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
      const response = await api.post('/api/therapists', therapistData);
      return response.data;
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