// Sistema de autenticação mock totalmente funcional
import { User, UserRole, AuthResponse } from '@/types';

// Usuários mock para desenvolvimento
const MOCK_USERS: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
}> = [
  {
    id: '1',
    email: 'admin@sapere.com.br',
    password: 'admin123',
    name: 'Admin Sapere',
    role: 'admin',
    status: 'active'
  },
  {
    id: '2', 
    email: 'dra.maria@sapere.com.br',
    password: 'admin123',
    name: 'Dra. Maria Silva',
    role: 'profissional',
    status: 'active'
  }
];

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Gerar token mock
const generateMockToken = (userId: string): string => {
  const timestamp = Date.now();
  return `mock_token_${userId}_${timestamp}`;
};

export const mockAuthAPI = {
  // Mock login
  login: async (email: string, password: string, rememberMe = false): Promise<AuthResponse> => {
    await delay(800); // Simular delay de rede
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    if (user.status !== 'active') {
      throw new Error('Usuário inativo. Entre em contato com o administrador.');
    }

    const token = generateMockToken(user.id);
    
    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Login realizado com sucesso',
      token,
      user: userData,
      expires_in: rememberMe ? 2592000 : 86400, // 30 dias ou 1 dia
      refresh_token: `refresh_${token}`
    };
  },

  // Mock register
  register: async (email: string, password: string, name: string, role: UserRole = 'profissional'): Promise<AuthResponse> => {
    await delay(1000);
    
    // Verificar se email já existe
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Este email já está cadastrado');
    }

    // Criar novo usuário
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email,
      password,
      name,
      role,
      status: 'active' as const
    };
    
    MOCK_USERS.push(newUser);
    
    const token = generateMockToken(newUser.id);
    
    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Usuário registrado com sucesso',
      token,
      user: userData,
      expires_in: 86400,
      refresh_token: `refresh_${token}`
    };
  },

  // Mock refresh token
  refreshToken: async (token: string): Promise<AuthResponse> => {
    await delay(500);
    
    // Extrair userId do token mock
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      throw new Error('Token inválido');
    }
    
    const userId = tokenParts[2];
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newToken = generateMockToken(user.id);
    
    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Token renovado com sucesso',
      token: newToken,
      user: userData,
      expires_in: 86400,
      refresh_token: `refresh_${newToken}`
    };
  },

  // Mock logout
  logout: async (): Promise<void> => {
    await delay(300);
    // Não há nada para fazer no mock logout
  },

  // Mock verify token
  verifyToken: async (token: string): Promise<{ valid: boolean; user: User }> => {
    await delay(200);
    
    // Extrair userId do token mock
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      return { valid: false, user: null as any };
    }
    
    const userId = tokenParts[2];
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      return { valid: false, user: null as any };
    }

    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      valid: true,
      user: userData
    };
  },

  // Mock get profile
  getProfile: async (token: string): Promise<{ user: User }> => {
    await delay(300);
    
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      throw new Error('Token inválido');
    }
    
    const userId = tokenParts[2];
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { user: userData };
  },

  // Mock update profile
  updateProfile: async (token: string, data: Partial<User>): Promise<{ message: string; user: User }> => {
    await delay(500);
    
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      throw new Error('Token inválido');
    }
    
    const userId = tokenParts[2];
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Atualizar dados do usuário mock
    if (data.name) MOCK_USERS[userIndex].name = data.name;
    if (data.email) MOCK_USERS[userIndex].email = data.email;
    
    const user = MOCK_USERS[userIndex];
    
    const userData: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Perfil atualizado com sucesso',
      user: userData
    };
  }
};

// Utilitários para desenvolvimento
export const mockUtils = {
  // Listar usuários disponíveis
  getAvailableUsers: () => {
    return MOCK_USERS.map(user => ({
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role
    }));
  },
  
  // Resetar usuários para estado inicial
  resetUsers: () => {
    // Esta função pode ser usada para resetar dados em desenvolvimento
    console.log('Mock users reset (funcionalidade pode ser implementada se necessário)');
  }
};

export default mockAuthAPI;