import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

// Banco de dados em memória - SUPER SIMPLES
const USERS = [
  {
    id: '1',
    email: 'admin@sapere.com.br',
    password: '$2a$10$IStI23Dp1W/hWyPAu9yluOtlO6qOz9oMJDwytgjVqGN0H3OBUJ2EO', // admin123
    name: 'Admin Sapere',
    role: 'admin',
    status: 'active'
  },
  {
    id: '2', 
    email: 'dra.maria@sapere.com.br',
    password: '$2a$10$IStI23Dp1W/hWyPAu9yluOtlO6qOz9oMJDwytgjVqGN0H3OBUJ2EO', // admin123
    name: 'Dra. Maria Silva',
    role: 'therapist', 
    status: 'active'
  }
];

console.log('🔑 AuthController carregado com', USERS.length, 'usuários');

export const login = async (req: Request, res: Response) => {
  try {
    console.log('🚀 Tentativa de login:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou senha não fornecidos');
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ 
        error: 'Email ou senha inválidos' 
      });
    }

    console.log('✅ Usuário encontrado:', user.name);

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({ 
        error: 'Email ou senha inválidos' 
      });
    }

    console.log('✅ Senha válida para:', user.name);

    // Gerar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret_key_development',
      { expiresIn: '7d' }
    );

    console.log('✅ Token gerado para:', user.name);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'therapist' } = req.body;

    // Verificar se usuário já existe
    const existingUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email já está em uso' 
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const newUser = {
      id: String(USERS.length + 1),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      status: 'active'
    };

    USERS.push(newUser);

    // Gerar token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'secret_key_development',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    const user = USERS.find(u => u.id === req.user?.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    // Gerar novo token
    const token = jwt.sign(
      { 
        userId: req.user.id, 
        email: req.user.email, 
        role: req.user.role 
      },
      process.env.JWT_SECRET || 'secret_key_development',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token atualizado com sucesso',
      token,
      user: req.user
    });

  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    const { current_password, new_password } = req.body;
    
    const user = USERS.find(u => u.id === req.user?.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    // Verificar senha atual
    const isValidCurrentPassword = await bcrypt.compare(current_password, user.password);

    if (!isValidCurrentPassword) {
      return res.status(400).json({ 
        error: 'Senha atual inválida' 
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Atualizar senha
    user.password = hashedNewPassword;

    res.json({ 
      message: 'Senha alterada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    const { name } = req.body;
    
    const user = USERS.find(u => u.id === req.user?.id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    // Atualizar dados
    if (name) user.name = name;

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};