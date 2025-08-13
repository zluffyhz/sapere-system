import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

console.log('🔑 AuthController carregado com persistência em banco');

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('🚀 Tentativa de login:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou senha não fornecidos');
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário no banco
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email.toLowerCase(), 'active']
    );
    
    if (!result.rows || result.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ 
        error: 'Email ou senha inválidos' 
      });
    }

    const user = result.rows[0];
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

    // Atualizar último login
    await query(
      'UPDATE users SET last_login_at = $1 WHERE id = $2',
      [new Date().toISOString(), user.id]
    );

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

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name, role = 'therapist' } = req.body;

    // Verificar se usuário já existe
    const existingResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingResult.rows && existingResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email já está em uso' 
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Criar usuário no banco
    await query(
      'INSERT INTO users (id, email, password, name, role, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [userId, email.toLowerCase(), hashedPassword, name, role, 'active', new Date().toISOString(), new Date().toISOString()]
    );

    // Gerar token
    const token = jwt.sign(
      { 
        userId: userId, 
        email: email.toLowerCase(), 
        role: role 
      },
      process.env.JWT_SECRET || 'secret_key_development',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name,
        role: role,
        status: 'active'
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

    const result = await query(
      'SELECT id, email, name, role, status, phone, cpf, birth_date, address, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        cpf: user.cpf,
        birth_date: user.birth_date,
        address: user.address,
        avatar_url: user.avatar_url
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
    
    // Buscar usuário atual
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    const user = result.rows[0];

    // Verificar senha atual
    const isValidCurrentPassword = await bcrypt.compare(current_password, user.password);

    if (!isValidCurrentPassword) {
      return res.status(400).json({ 
        error: 'Senha atual inválida' 
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Atualizar senha no banco
    await query(
      'UPDATE users SET password = $1, updated_at = $2 WHERE id = $3',
      [hashedNewPassword, new Date().toISOString(), req.user.id]
    );

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

    const { name, phone, cpf, birth_date, address } = req.body;
    
    // Construir query dinamicamente
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (phone) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (cpf) {
      updates.push(`cpf = $${paramIndex++}`);
      values.push(cpf);
    }
    if (birth_date) {
      updates.push(`birth_date = $${paramIndex++}`);
      values.push(birth_date);
    }
    if (address) {
      updates.push(`address = $${paramIndex++}`);
      values.push(address);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar'
      });
    }
    
    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    values.push(req.user.id);
    
    // Atualizar no banco
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Buscar usuário atualizado
    const result = await query(
      'SELECT id, email, name, role, status, phone, cpf, birth_date, address FROM users WHERE id = $1',
      [req.user.id]
    );

    const updatedUser = result.rows[0];

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        cpf: updatedUser.cpf,
        birth_date: updatedUser.birth_date,
        address: updatedUser.address
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};