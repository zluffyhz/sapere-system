import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

// Cadastrar novo terapeuta
export const createTherapist = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // Verificar se é admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem cadastrar terapeutas' 
      });
    }

    const { 
      email, 
      password, 
      name, 
      phone,
      cpf,
      professional_id,
      specialties = [],
      bio,
      experience_years,
      languages = ['Português'],
      available_hours = {},
      consultation_duration = 50,
      max_daily_appointments = 8
    } = req.body;

    // Validações básicas
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, senha e nome são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (existingUser.rows && existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email já está em uso' 
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const therapistId = uuidv4();

    // Criar usuário
    await query(
      'INSERT INTO users (id, email, password, name, role, status, phone, cpf, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId, 
        email.toLowerCase(), 
        hashedPassword, 
        name, 
        'therapist', 
        'active',
        phone || null,
        cpf || null,
        new Date().toISOString(), 
        new Date().toISOString(),
        req.user.id
      ]
    );

    // Criar perfil de terapeuta
    await query(
      'INSERT INTO therapists (id, user_id, professional_id, specialties, bio, experience_years, languages, available_hours, consultation_duration, max_daily_appointments, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        therapistId,
        userId,
        professional_id || null,
        JSON.stringify(specialties),
        bio || null,
        experience_years || null,
        JSON.stringify(languages),
        JSON.stringify(available_hours),
        consultation_duration,
        max_daily_appointments,
        true,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    console.log('✅ Terapeuta criado:', name, 'por', req.user.name);

    res.status(201).json({
      message: 'Terapeuta cadastrado com sucesso',
      therapist: {
        id: therapistId,
        user_id: userId,
        name: name,
        email: email.toLowerCase(),
        professional_id: professional_id,
        specialties: specialties,
        consultation_duration: consultation_duration,
        max_daily_appointments: max_daily_appointments,
        active: true
      }
    });

  } catch (error) {
    console.error('Erro ao cadastrar terapeuta:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

// Listar terapeutas
export const listTherapists = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso negado' 
      });
    }

    const result = await query(`
      SELECT 
        t.id,
        t.user_id,
        t.professional_id,
        t.specialties,
        t.bio,
        t.experience_years,
        t.languages,
        t.available_hours,
        t.consultation_duration,
        t.max_daily_appointments,
        t.active,
        t.created_at,
        u.name,
        u.email,
        u.phone,
        u.status as user_status
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.name ASC
    `);

    const therapists = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      professional_id: row.professional_id,
      specialties: typeof row.specialties === 'string' ? JSON.parse(row.specialties) : row.specialties,
      bio: row.bio,
      experience_years: row.experience_years,
      languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : row.languages,
      available_hours: typeof row.available_hours === 'string' ? JSON.parse(row.available_hours) : row.available_hours,
      consultation_duration: row.consultation_duration,
      max_daily_appointments: row.max_daily_appointments,
      active: row.active,
      user_status: row.user_status,
      created_at: row.created_at
    }));

    res.json({
      therapists: therapists
    });

  } catch (error) {
    console.error('Erro ao listar terapeutas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

// Atualizar terapeuta
export const updateTherapist = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem atualizar terapeutas' 
      });
    }

    const { therapistId } = req.params;
    const { 
      name,
      phone,
      cpf,
      professional_id,
      specialties,
      bio,
      experience_years,
      languages,
      available_hours,
      consultation_duration,
      max_daily_appointments,
      active
    } = req.body;

    // Verificar se terapeuta existe
    const therapistResult = await query(
      'SELECT t.*, u.id as user_id FROM therapists t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [therapistId]
    );

    if (!therapistResult.rows || therapistResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Terapeuta não encontrado' 
      });
    }

    const therapist = therapistResult.rows[0];

    // Atualizar dados do usuário
    const userUpdates = [];
    const userValues = [];
    
    if (name) {
      userUpdates.push('name = ?');
      userValues.push(name);
    }
    if (phone !== undefined) {
      userUpdates.push('phone = ?');
      userValues.push(phone);
    }
    if (cpf !== undefined) {
      userUpdates.push('cpf = ?');
      userValues.push(cpf);
    }
    
    if (userUpdates.length > 0) {
      userUpdates.push('updated_at = ?');
      userValues.push(new Date().toISOString());
      userValues.push(therapist.user_id);

      await query(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
        userValues
      );
    }

    // Atualizar dados do terapeuta
    const therapistUpdates = [];
    const therapistValues = [];
    
    if (professional_id !== undefined) {
      therapistUpdates.push('professional_id = ?');
      therapistValues.push(professional_id);
    }
    if (specialties !== undefined) {
      therapistUpdates.push('specialties = ?');
      therapistValues.push(JSON.stringify(specialties));
    }
    if (bio !== undefined) {
      therapistUpdates.push('bio = ?');
      therapistValues.push(bio);
    }
    if (experience_years !== undefined) {
      therapistUpdates.push('experience_years = ?');
      therapistValues.push(experience_years);
    }
    if (languages !== undefined) {
      therapistUpdates.push('languages = ?');
      therapistValues.push(JSON.stringify(languages));
    }
    if (available_hours !== undefined) {
      therapistUpdates.push('available_hours = ?');
      therapistValues.push(JSON.stringify(available_hours));
    }
    if (consultation_duration !== undefined) {
      therapistUpdates.push('consultation_duration = ?');
      therapistValues.push(consultation_duration);
    }
    if (max_daily_appointments !== undefined) {
      therapistUpdates.push('max_daily_appointments = ?');
      therapistValues.push(max_daily_appointments);
    }
    if (active !== undefined) {
      therapistUpdates.push('active = ?');
      therapistValues.push(active);
    }
    
    if (therapistUpdates.length > 0) {
      therapistUpdates.push('updated_at = ?');
      therapistValues.push(new Date().toISOString());
      therapistValues.push(therapistId);

      await query(
        `UPDATE therapists SET ${therapistUpdates.join(', ')} WHERE id = ?`,
        therapistValues
      );
    }

    console.log('✅ Terapeuta atualizado:', therapistId, 'por', req.user.name);

    res.json({
      message: 'Terapeuta atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar terapeuta:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

// Desativar terapeuta
export const deactivateTherapist = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem desativar terapeutas' 
      });
    }

    const { therapistId } = req.params;

    await query(
      'UPDATE therapists SET active = ?, updated_at = ? WHERE id = ?',
      [false, new Date().toISOString(), therapistId]
    );

    await query(
      'UPDATE users SET status = ?, updated_at = ? WHERE id = (SELECT user_id FROM therapists WHERE id = ?)',
      ['inactive', new Date().toISOString(), therapistId]
    );

    console.log('✅ Terapeuta desativado:', therapistId, 'por', req.user.name);

    res.json({
      message: 'Terapeuta desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desativar terapeuta:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};