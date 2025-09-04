import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';

// Alterar senha do administrador
export const changeAdminPassword = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem usar esta função' 
      });
    }

    const { current_password, new_password, confirm_password } = req.body;
    
    // Validações
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ 
        error: 'Senha atual, nova senha e confirmação são obrigatórias' 
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ 
        error: 'Nova senha e confirmação não coincidem' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: 'Nova senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Buscar usuário atual
    const result = await query(
      'SELECT password FROM users WHERE id = ? AND role = ?',
      [req.user.id, 'admin']
    );
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Administrador não encontrado' 
      });
    }

    const admin = result.rows[0];

    // Verificar senha atual
    const isValidCurrentPassword = await bcrypt.compare(current_password, admin.password);

    if (!isValidCurrentPassword) {
      return res.status(400).json({ 
        error: 'Senha atual inválida' 
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Atualizar senha no banco
    await query(
      'UPDATE users SET password = ?, updated_at = ? WHERE id = ? AND role = ?',
      [hashedNewPassword, new Date().toISOString(), req.user.id, 'admin']
    );

    console.log('✅ Senha do administrador alterada:', req.user.name);

    res.json({ 
      message: 'Senha do administrador alterada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao alterar senha do administrador:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

// Resetar senha de usuário (função administrativa)
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem resetar senhas' 
      });
    }

    const { userId, new_password } = req.body;
    
    if (!userId || !new_password) {
      return res.status(400).json({ 
        error: 'ID do usuário e nova senha são obrigatórios' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: 'Nova senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se usuário existe
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );
    
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    const user = userResult.rows[0];

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Atualizar senha no banco
    await query(
      'UPDATE users SET password = ?, updated_at = ?, updated_by = ? WHERE id = ?',
      [hashedNewPassword, new Date().toISOString(), req.user.id, userId]
    );

    console.log('✅ Senha resetada para usuário:', user.name, 'pelo admin:', req.user.name);

    res.json({ 
      message: `Senha do usuário ${user.name} foi resetada com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao resetar senha do usuário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

// Listar todos os usuários (função administrativa)
export const listAllUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem listar usuários' 
      });
    }

    const result = await query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.status,
        u.phone,
        u.cpf,
        u.last_login_at,
        u.created_at,
        t.id as therapist_id,
        t.professional_id,
        t.active as therapist_active
      FROM users u
      LEFT JOIN therapists t ON u.id = t.user_id
      ORDER BY u.created_at DESC
    `);

    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.status,
      phone: row.phone,
      cpf: row.cpf,
      last_login_at: row.last_login_at,
      created_at: row.created_at,
      therapist_info: row.therapist_id ? {
        id: row.therapist_id,
        professional_id: row.professional_id,
        active: row.therapist_active
      } : null
    }));

    res.json({
      users: users
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

// Atualizar status de usuário
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem alterar status de usuários' 
      });
    }

    const { userId } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status deve ser: active, inactive ou pending' 
      });
    }

    // Verificar se usuário existe
    const userResult = await query(
      'SELECT id, name, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    const user = userResult.rows[0];

    // Não permitir alterar status de outros admins
    if (user.role === 'admin' && req.user.id !== userId) {
      return res.status(403).json({ 
        error: 'Não é possível alterar status de outros administradores' 
      });
    }

    // Atualizar status
    await query(
      'UPDATE users SET status = ?, updated_at = ?, updated_by = ? WHERE id = ?',
      [status, new Date().toISOString(), req.user.id, userId]
    );

    console.log('✅ Status do usuário alterado:', user.name, 'para', status, 'pelo admin:', req.user.name);

    res.json({ 
      message: `Status do usuário ${user.name} alterado para ${status}` 
    });

  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};