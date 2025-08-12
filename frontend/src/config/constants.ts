// Configurações e constantes do sistema Sapere

export const APP_CONFIG = {
  name: 'Sapere',
  fullName: 'Sapere - Clínica de Neurodivergentes',
  version: '2.0.0',
  environment: (import.meta as any).env?.MODE || 'development',
  apiUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api',
  isDevelopment: (import.meta as any).env?.DEV || false,
  isProduction: (import.meta as any).env?.PROD || false,
};

export const CLINIC_INFO = {
  name: 'Sapere - Clínica de Neurodivergentes',
  phone: '+55 92 99230-5850',
  email: 'Sapere.recepcao@gmail.com',
  whatsapp: '+55 92 99230-5850',
  whatsappUrl: 'https://wa.me/5592992305850',
  location: 'Manaus, AM',
  website: 'https://sapere.com.br',
};

export const USER_ROLES = {
  admin: 'admin',
  profissional: 'profissional',
} as const;

export const ROLE_LABELS = {
  admin: 'Administrador',
  profissional: 'Profissional',
} as const;

export const ROLE_COLORS = {
  admin: 'text-red-600 bg-red-50 border-red-200',
  profissional: 'text-blue-600 bg-blue-50 border-blue-200',
} as const;

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: ['admin'],
  MANAGE_SETTINGS: ['admin'],
  VIEW_ALL_DATA: ['admin'],
  DELETE_DATA: ['admin'],
  
  // Clinical permissions
  VIEW_PATIENTS: ['admin', 'profissional'],
  CREATE_APPOINTMENTS: ['admin', 'profissional'],
  MANAGE_RECORDS: ['admin', 'profissional'],
  VIEW_REPORTS: ['admin', 'profissional'],
  
  // Professional specific
  MANAGE_SCHEDULE: ['profissional'],
  CREATE_RECORDS: ['profissional'],
  
  // Anamnese permissions
  VIEW_ANAMNESE: ['admin', 'profissional'],
  CREATE_ANAMNESE: ['admin', 'profissional'],
  EDIT_ANAMNESE: ['admin', 'profissional'],
  DELETE_ANAMNESE: ['admin', 'profissional'],
  MANAGE_ANAMNESE_TEMPLATES: ['admin'],
  COMMENT_ANAMNESE: ['admin', 'profissional'],
  FAVORITE_ANAMNESE: ['admin', 'profissional'],
  EXPORT_ANAMNESE: ['admin', 'profissional'],
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'sapere_token',
  USER: 'sapere_user',
  REMEMBER: 'sapere_remember',
  TOKEN_EXPIRY: 'sapere_token_expiry',
  PREFERENCES: 'sapere_preferences',
  THEME: 'sapere_theme',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    VERIFY: '/auth/verify',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
  },
  RECORDS: {
    LIST: '/records',
    CREATE: '/records',
    GET: (id: string) => `/records/${id}`,
    UPDATE: (id: string) => `/records/${id}`,
    DELETE: (id: string) => `/records/${id}`,
    BY_PATIENT: (patientId: string) => `/records/patient/${patientId}`,
  },
} as const;

export const APPOINTMENT_STATUS = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  EM_ATENDIMENTO: 'em_atendimento',
  ATENDIDO: 'atendido',
  FALTA: 'falta',
  CANCELADO: 'cancelado',
} as const;

export const APPOINTMENT_STATUS_LABELS = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_atendimento: 'Em Atendimento',
  atendido: 'Atendido',
  falta: 'Falta',
  cancelado: 'Cancelado',
} as const;

export const APPOINTMENT_STATUS_COLORS = {
  agendado: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-green-100 text-green-800',
  em_atendimento: 'bg-blue-100 text-blue-800',
  atendido: 'bg-gray-100 text-gray-800',
  falta: 'bg-red-100 text-red-800',
  cancelado: 'bg-gray-100 text-gray-600',
} as const;

export const RECORD_TYPES = {
  ANAMNESE: 'anamnese',
  EVOLUCAO: 'evolucao',
  PRESCRICAO: 'prescricao',
} as const;

export const RECORD_TYPE_LABELS = {
  anamnese: 'Anamnese',
  evolucao: 'Evolução',
  prescricao: 'Prescrição',
} as const;

export const PAYMENT_METHODS = {
  DINHEIRO: 'dinheiro',
  CARTAO: 'cartao',
  PIX: 'pix',
} as const;

export const PAYMENT_METHOD_LABELS = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const THEME_COLORS = {
  primary: '#D97706', // sapere-orange
  secondary: '#92400E', // sapere-brown  
  accent: '#F59E0B', // sapere-yellow
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;