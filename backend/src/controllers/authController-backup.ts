import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/config/database';
import { UserRole } from '../types/database';
import { AuthRequest } from '../middleware/auth';

interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
  cpf?: string;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      name, 
      role = 'responsible',
      phone,
      cpf
    }: RegisterRequest = req.body;

    // Verificar se usuário já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR (cpf IS NOT NULL AND cpf = $2)',
      [email, cpf || null]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email ou CPF já está em uso',
        code: 'USER_ALREADY_EXISTS'
      });
    }

    // Validar role
    const validRoles: UserRole[] = ['admin', 'therapist', 'responsible'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Role inválido',
        code: 'INVALID_ROLE',
        valid_roles: validRoles
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const result = await query(
      `INSERT INTO users (email, password, name, role, phone, cpf, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'active') 
       RETURNING id, email, name, role, status, phone, created_at`,
      [email, hashedPassword, name, role, phone, cpf]
    );

    const user = result.rows[0];

    // Gerar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Atualizar último login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Tratamento de erros específicos do PostgreSQL
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(400).json({ 
        error: 'Email ou CPF já está em uso',
        code: 'DUPLICATE_KEY'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, remember_me = false }: LoginRequest = req.body;

    // Buscar usuário com dados completos
    const result = await query(
      `SELECT id, email, password, name, role, status, phone, last_login_at
       FROM users 
       WHERE email = $1 AND status = 'active'`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email ou senha inválidos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Email ou senha inválidos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Determinar expiração do token baseado no remember_me
    const expiresIn = remember_me ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');

    // Gerar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Atualizar último login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      expires_in: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        last_login_at: user.last_login_at
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Gerar novo token
    const token = jwt.sign(
      { 
        userId: req.user.id, 
        email: req.user.email, 
        role: req.user.role 
      },
      process.env.JWT_SECRET!,
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
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // Em uma implementação mais robusta, você poderia blacklistar o token
    // Por enquanto, apenas retornamos sucesso
    res.json({ 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Buscar dados completos do usuário
    const result = await query(
      `SELECT id, email, name, role, status, phone, cpf, birth_date, 
              address, avatar_url, last_login_at, email_verified_at, 
              phone_verified_at, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.rows[0];

    // Se for terapeuta, buscar informações adicionais
    let therapistInfo = null;
    if (user.role === 'therapist') {
      const therapistResult = await query(
        `SELECT professional_id, specialties, bio, experience_years, 
                languages, available_hours, consultation_duration, 
                max_daily_appointments, active
         FROM therapists 
         WHERE user_id = $1`,
        [user.id]
      );
      
      if (therapistResult.rows.length > 0) {
        therapistInfo = therapistResult.rows[0];
      }
    }

    res.json({
      user: {
        ...user,
        password: undefined // Não retornar senha
      },
      therapist_info: therapistInfo
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { name, phone, address, avatar_url } = req.body;
    const userId = req.user.id;

    // Atualizar dados básicos do usuário
    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $5
       WHERE id = $5
       RETURNING id, email, name, role, status, phone, address, avatar_url, updated_at`,
      [name, phone, address ? JSON.stringify(address) : null, avatar_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { current_password, new_password } = req.body;

    // Buscar senha atual
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar senha atual
    const isValidCurrentPassword = await bcrypt.compare(
      current_password, 
      result.rows[0].password
    );

    if (!isValidCurrentPassword) {
      return res.status(400).json({ 
        error: 'Senha atual inválida',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(new_password, 12);

    // Atualizar senha
    await query(
      `UPDATE users 
       SET password = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
       WHERE id = $2`,
      [hashedNewPassword, req.user.id]
    );

    res.json({ 
      message: 'Senha alterada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};