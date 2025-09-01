import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

console.log('📅 Controlador de agendamentos carregado com PostgreSQL');

// Listar agendamentos
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let whereClause = 'WHERE 1=1';
    let params: any[] = [];
    let paramIndex = 1;

    // Filtros
    const { patient_id, professional_id, status, date_from, date_to } = req.query;
    
    if (patient_id) {
      whereClause += ` AND a.patient_id = $${paramIndex}`;
      params.push(patient_id);
      paramIndex++;
    }

    if (professional_id) {
      whereClause += ` AND a.professional_id = $${paramIndex}`;
      params.push(professional_id);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (date_from) {
      whereClause += ` AND a.start_time >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereClause += ` AND a.start_time <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    const result = await query(`
      SELECT 
        a.*,
        p.name as patient_name,
        pt.name as professional_name,
        u.name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN professionals pt ON a.professional_id = pt.id
      LEFT JOIN users u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.start_time DESC
    `, params);

    res.json({
      appointments: result.rows,
      total: result.rows.length,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar agendamento específico
export const getAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;

    const result = await query(`
      SELECT 
        a.*,
        p.name as patient_name,
        pt.name as professional_name,
        u.name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN professionals pt ON a.professional_id = pt.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `, [appointmentId]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar agendamento
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    const {
      patient_id, professional_id, start_time, end_time, room,
      type, notes
    } = req.body;

    if (!patient_id || !professional_id || !start_time || !end_time) {
      return res.status(400).json({ 
        error: 'Paciente, profissional, horário de início e fim são obrigatórios' 
      });
    }

    // Verificar conflitos de horário
    const conflictResult = await query(`
      SELECT id FROM appointments 
      WHERE professional_id = $1 
      AND status NOT IN ('cancelled') 
      AND (
        (start_time <= $2 AND end_time > $2) OR
        (start_time < $3 AND end_time >= $3) OR
        (start_time >= $2 AND end_time <= $3)
      )
    `, [professional_id, start_time, end_time]);

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Conflito de horário detectado' 
      });
    }

    const appointmentId = uuidv4();

    await query(`
      INSERT INTO appointments (
        id, patient_id, professional_id, start_time, end_time, 
        room, status, type, notes, created_at, updated_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      appointmentId, patient_id, professional_id, start_time, end_time,
      room, 'scheduled', type, notes, new Date(), new Date(), user.id
    ]);

    const result = await query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);

    res.status(201).json({
      message: 'Agendamento criado com sucesso',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar agendamento
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;
    
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    const checkResult = await query('SELECT id FROM appointments WHERE id = $1', [appointmentId]);
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const {
      start_time, end_time, room, status, type, notes
    } = req.body;

    await query(`
      UPDATE appointments SET
        start_time = COALESCE($1, start_time),
        end_time = COALESCE($2, end_time),
        room = COALESCE($3, room),
        status = COALESCE($4, status),
        type = COALESCE($5, type),
        notes = COALESCE($6, notes),
        updated_at = $7
      WHERE id = $8
    `, [
      start_time, end_time, room, status, type, notes,
      new Date(), appointmentId
    ]);

    const result = await query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);

    res.json({
      message: 'Agendamento atualizado com sucesso',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Cancelar agendamento
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;
    
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    const checkResult = await query('SELECT id FROM appointments WHERE id = $1', [appointmentId]);
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await query(
      'UPDATE appointments SET status = $1, updated_at = $2 WHERE id = $3',
      ['cancelled', new Date(), appointmentId]
    );

    res.json({
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Estatísticas dos agendamentos
export const getAppointmentsStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalResult = await query('SELECT COUNT(*) as total FROM appointments');
    const todayResult = await query(`
      SELECT COUNT(*) as total FROM appointments 
      WHERE DATE(start_time) = CURRENT_DATE
    `);
    const weekResult = await query(`
      SELECT COUNT(*) as total FROM appointments 
      WHERE start_time >= DATE_TRUNC('week', CURRENT_DATE)
      AND start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
    `);
    
    const statusResult = await query(`
      SELECT status, COUNT(*) as count 
      FROM appointments 
      GROUP BY status
    `);

    const stats = {
      total: parseInt(totalResult.rows[0].total),
      today: parseInt(todayResult.rows[0].total),
      this_week: parseInt(weekResult.rows[0].total),
      by_status: statusResult.rows.reduce((acc: any, row: any) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {})
    };

    res.json({ stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Adicionar funções que podem estar sendo usadas em outras rotas
export const confirmAppointment = async (req: AuthRequest, res: Response) => {
  // Implementar confirmação de agendamento
  return updateAppointment(req, res);
};

export const completeAppointment = async (req: AuthRequest, res: Response) => {
  // Implementar conclusão de agendamento
  return updateAppointment(req, res);
};

export default {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  getAppointmentsStats
};