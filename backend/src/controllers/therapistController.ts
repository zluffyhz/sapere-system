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

// Buscar terapeuta específico por ID
export const getTherapistById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { therapistId } = req.params;

    // Query principal do terapeuta
    const therapistResult = await query(`
      SELECT 
        t.*,
        u.name, u.email, u.phone, u.cpf, u.status as user_status, u.avatar_url as user_avatar,
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT p.id) as total_patients,
        AVG(pf.rating) as avg_rating
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN appointments a ON t.id = a.therapist_id
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN patient_feedback pf ON t.id = pf.therapist_id
      WHERE t.id = ?
      GROUP BY t.id, u.id
    `, [therapistId]);

    if (!therapistResult.rows || therapistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Terapeuta não encontrado' });
    }

    const therapist = therapistResult.rows[0];

    // Buscar especialidades
    const specialtiesResult = await query(`
      SELECT s.*, ts.experience_level, ts.certified, ts.certification_date
      FROM specialties s
      JOIN therapist_specialties ts ON s.id = ts.specialty_id
      WHERE ts.therapist_id = ?
    `, [therapistId]);

    // Buscar estatísticas de produtividade recente
    const productivityResult = await query(`
      SELECT * FROM therapist_productivity 
      WHERE therapist_id = ? 
      ORDER BY period_start DESC 
      LIMIT 5
    `, [therapistId]);

    res.json({
      therapist: {
        ...therapist,
        specialties: typeof therapist.specialties === 'string' 
          ? JSON.parse(therapist.specialties) 
          : therapist.specialties,
        languages: typeof therapist.languages === 'string' 
          ? JSON.parse(therapist.languages) 
          : therapist.languages,
        available_hours: typeof therapist.available_hours === 'string' 
          ? JSON.parse(therapist.available_hours) 
          : therapist.available_hours,
        certifications: typeof therapist.certifications === 'string' 
          ? JSON.parse(therapist.certifications) 
          : therapist.certifications,
        social_links: typeof therapist.social_links === 'string' 
          ? JSON.parse(therapist.social_links) 
          : therapist.social_links,
        specialties_details: specialtiesResult.rows || [],
        recent_productivity: productivityResult.rows || []
      }
    });

  } catch (error) {
    console.error('Erro ao buscar terapeuta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar estatísticas de produtividade
export const getTherapistStats = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { therapistId } = req.params;
    const { period = '30' } = req.query; // dias

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period as string));

    // Estatísticas gerais
    const statsResult = await query(`
      SELECT 
        COUNT(DISTINCT a.id) as total_sessions,
        COUNT(DISTINCT a.patient_id) as total_patients,
        AVG(s.total_duration) as avg_session_duration,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*) as cancellation_rate,
        COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) * 100.0 / COUNT(*) as no_show_rate,
        AVG(pf.rating) as avg_rating
      FROM appointments a
      LEFT JOIN sessions s ON a.id = s.appointment_id
      LEFT JOIN patient_feedback pf ON a.therapist_id = pf.therapist_id
      WHERE a.therapist_id = ? AND a.appointment_date >= ?
    `, [therapistId, startDate.toISOString()]);

    // Distribuição por horários
    const hourlyResult = await query(`
      SELECT 
        EXTRACT(HOUR FROM appointment_date) as hour,
        COUNT(*) as sessions_count
      FROM appointments 
      WHERE therapist_id = ? AND appointment_date >= ?
      GROUP BY EXTRACT(HOUR FROM appointment_date)
      ORDER BY hour
    `, [therapistId, startDate.toISOString()]);

    // Tendência semanal
    const weeklyResult = await query(`
      SELECT 
        DATE_TRUNC('week', appointment_date) as week,
        COUNT(*) as sessions_count,
        AVG(s.total_duration) as avg_duration
      FROM appointments a
      LEFT JOIN sessions s ON a.id = s.appointment_id
      WHERE a.therapist_id = ? AND a.appointment_date >= ?
      GROUP BY DATE_TRUNC('week', appointment_date)
      ORDER BY week
    `, [therapistId, startDate.toISOString()]);

    res.json({
      period_days: parseInt(period as string),
      stats: statsResult.rows[0] || {},
      hourly_distribution: hourlyResult.rows || [],
      weekly_trend: weeklyResult.rows || []
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar agenda do terapeuta
export const getTherapistSchedule = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { therapistId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsResult = await query(`
      SELECT 
        a.*,
        p.name as patient_name,
        s.status as session_status,
        s.start_time as session_start_time,
        s.end_time as session_end_time
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN sessions s ON a.id = s.appointment_id
      WHERE a.therapist_id = ? 
        AND a.appointment_date BETWEEN ? AND ?
      ORDER BY a.appointment_date ASC
    `, [therapistId, startOfDay.toISOString(), endOfDay.toISOString()]);

    res.json({
      date: date,
      appointments: appointmentsResult.rows || []
    });

  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Gerar relatório de produtividade
export const generateProductivityReport = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { therapistId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate e endDate são obrigatórios' 
      });
    }

    // Verificar se já existe relatório para este período
    const existingReport = await query(`
      SELECT id FROM therapist_productivity 
      WHERE therapist_id = ? AND period_start = ? AND period_end = ?
    `, [therapistId, startDate, endDate]);

    if (existingReport.rows && existingReport.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Relatório já existe para este período' 
      });
    }

    // Calcular métricas
    const metricsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(s.total_duration) as total_duration,
        AVG(s.total_duration) as avg_session_duration,
        COUNT(DISTINCT a.patient_id) as total_patients,
        COUNT(CASE WHEN a.created_at BETWEEN ? AND ? THEN 1 END) as new_patients,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*) as cancellation_rate,
        COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) * 100.0 / COUNT(*) as no_show_rate,
        AVG(pf.rating) as patient_satisfaction_score
      FROM appointments a
      LEFT JOIN sessions s ON a.id = s.appointment_id
      LEFT JOIN patient_feedback pf ON a.id = pf.appointment_id
      WHERE a.therapist_id = ? 
        AND a.appointment_date BETWEEN ? AND ?
    `, [startDate, endDate, therapistId, startDate, endDate]);

    const metrics = metricsResult.rows[0];

    // Calcular horários de pico
    const peakHoursResult = await query(`
      SELECT 
        EXTRACT(HOUR FROM appointment_date) as hour,
        COUNT(*) as count
      FROM appointments 
      WHERE therapist_id = ? 
        AND appointment_date BETWEEN ? AND ?
      GROUP BY EXTRACT(HOUR FROM appointment_date)
      ORDER BY count DESC
      LIMIT 3
    `, [therapistId, startDate, endDate]);

    const peakHours = peakHoursResult.rows.map(row => 
      `${String(row.hour).padStart(2, '0')}:00`
    );

    // Inserir relatório de produtividade
    const reportResult = await query(`
      INSERT INTO therapist_productivity (
        therapist_id, period_start, period_end,
        total_sessions, total_duration, avg_session_duration,
        total_patients, new_patients, 
        cancellation_rate, no_show_rate, patient_satisfaction_score,
        sessions_per_day_avg, peak_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [
      therapistId, startDate, endDate,
      metrics.total_sessions || 0,
      metrics.total_duration || 0,
      metrics.avg_session_duration || 0,
      metrics.total_patients || 0,
      metrics.new_patients || 0,
      metrics.cancellation_rate || 0,
      metrics.no_show_rate || 0,
      metrics.patient_satisfaction_score || null,
      (metrics.total_sessions || 0) / getDaysBetween(startDate, endDate),
      JSON.stringify(peakHours)
    ]);

    console.log('✅ Relatório de produtividade gerado:', therapistId);

    res.status(201).json({
      message: 'Relatório de produtividade gerado com sucesso',
      report: reportResult.rows[0]
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função auxiliar para calcular dias entre datas
function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}