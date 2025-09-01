import axios, { AxiosError } from 'axios';

// API Configuration
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? '/api' : 'http://localhost:3000/api';

console.log('API Configuration:', {
  isProduction,
  API_BASE_URL,
  environment: import.meta.env.MODE
});

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token management
const TOKEN_KEY = 'sapere_token';
const USER_KEY = 'sapere_user';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete api.defaults.headers.common['Authorization'];
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): any | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Initialize token if exists
const storedToken = getStoredToken();
if (storedToken) {
  setAuthToken(storedToken);
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // Auto logout on 401
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API Functions

// Authentication
export const authAPI = {
  async login(credentials: { login: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.token) {
        setAuthToken(response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        return response.data;
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get profile');
    }
  },

  logout() {
    removeAuthToken();
    return Promise.resolve();
  }
};

// Users Management
export const usersAPI = {
  async getUsers() {
    try {
      const response = await api.get('/admin/users');
      return response.data.users || [];
    } catch (error: any) {
      console.error('Get users error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get users');
    }
  },

  async createUser(userData: any) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  }
};

// Patients Management
export const patientsAPI = {
  async getPatients(params?: { search?: string; limit?: number }) {
    try {
      const response = await api.get('/patients', { params });
      return response.data.patients || [];
    } catch (error: any) {
      console.error('Get patients error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get patients');
    }
  },

  async createPatient(patientData: any) {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error: any) {
      console.error('Create patient error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create patient');
    }
  }
};

// Appointments Management
export const appointmentsAPI = {
  async getAppointments(params?: { date?: string; patient_id?: string; limit?: number }) {
    try {
      const response = await api.get('/appointments', { params });
      return response.data.appointments || [];
    } catch (error: any) {
      console.error('Get appointments error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get appointments');
    }
  },

  async createAppointment(appointmentData: any) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error: any) {
      console.error('Create appointment error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create appointment');
    }
  }
};

// Health check
export const healthAPI = {
  async check() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      console.error('Health check error:', error);
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }
};

export default api;