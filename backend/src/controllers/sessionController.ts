import { Request, Response } from 'express';
import { Client } from 'pg';
import { Session, SessionStatus } from '../types/database';

const getDbClient = () => {
  return new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

interface SessionRequest {
  appointment_id?: string;
  therapist_id: string;
  patient_id: string;
  notes?: string;
}

// Iniciar nova sessão
export const startSession = async (req: Request, res: Response) => {
  const client = getDbClient();
  
  try {
    const { appointment_id, therapist_id, patient_id, notes } = req.body as SessionRequest;

    if (!therapist_id || !patient_id) {
      return res.status(400).json({
        error: 'therapist_id e patient_id são obrigatórios'
      });
    }

    await client.connect();

    // Verificar se há sessão ativa para este terapeuta
    const activeSessionQuery = `
      SELECT id FROM sessions 
      WHERE therapist_id = $1 AND status IN ('active', 'paused')
    `;
    const activeSessionResult = await client.query(activeSessionQuery, [therapist_id]);

    if (activeSessionResult.rows.length > 0) {
      return res.status(400).json({
        error: 'Já existe uma sessão ativa para este terapeuta',
        active_session_id: activeSessionResult.rows[0].id
      });
    }

    // Criar nova sessão
    const insertQuery = `
      INSERT INTO sessions (
        appointment_id, therapist_id, patient_id, status, 
        start_time, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      appointment_id || null,
      therapist_id,
      patient_id,
      'active' as SessionStatus,
      new Date(),
      notes || null
    ];

    const result = await client.query(insertQuery, values);
    const session = result.rows[0];

    console.log('Nova sessão iniciada:', session.id);

    res.status(201).json({
      success: true,
      session: {
        id: session.id,
        appointment_id: session.appointment_id,
        therapist_id: session.therapist_id,
        patient_id: session.patient_id,
        status: session.status,
        start_time: session.start_time,
        notes: session.notes,
        created_at: session.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    res.status(500).json({
      error: 'Erro ao iniciar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Pausar sessão
export const pauseSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = getDbClient();

  try {
    await client.connect();

    // Verificar se sessão existe e está ativa
    const checkQuery = `
      SELECT * FROM sessions WHERE id = $1 AND status = 'active'
    `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada ou não está ativa'
      });
    }

    // Pausar sessão
    const updateQuery = `
      UPDATE sessions 
      SET status = 'paused', pause_time = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [id]);
    const session = result.rows[0];

    console.log('Sessão pausada:', id);

    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        pause_time: session.pause_time
      }
    });

  } catch (error) {
    console.error('Erro ao pausar sessão:', error);
    res.status(500).json({
      error: 'Erro ao pausar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Retomar sessão
export const resumeSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = getDbClient();

  try {
    await client.connect();

    // Verificar se sessão existe e está pausada
    const checkQuery = `
      SELECT * FROM sessions WHERE id = $1 AND status = 'paused'
    `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada ou não está pausada'
      });
    }

    const session = checkResult.rows[0];

    // Calcular duração da pausa
    const pauseStart = new Date(session.pause_time);
    const resumeTime = new Date();
    const pauseDuration = Math.floor((resumeTime.getTime() - pauseStart.getTime()) / 1000);

    // Retomar sessão
    const updateQuery = `
      UPDATE sessions 
      SET status = 'active', 
          resume_time = $2, 
          pause_duration = COALESCE(pause_duration, 0) + $3,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [id, resumeTime, pauseDuration]);
    const updatedSession = result.rows[0];

    console.log('Sessão retomada:', id);

    res.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        resume_time: updatedSession.resume_time,
        pause_duration: updatedSession.pause_duration
      }
    });

  } catch (error) {
    console.error('Erro ao retomar sessão:', error);
    res.status(500).json({
      error: 'Erro ao retomar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Finalizar sessão
export const completeSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const client = getDbClient();

  try {
    await client.connect();

    // Verificar se sessão existe e está ativa ou pausada
    const checkQuery = `
      SELECT * FROM sessions WHERE id = $1 AND status IN ('active', 'paused')
    `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada ou já foi finalizada'
      });
    }

    const session = checkResult.rows[0];
    const endTime = new Date();
    const startTime = new Date(session.start_time);

    // Calcular duração total
    let totalDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Subtrair tempo de pausa se houver
    if (session.pause_duration) {
      totalDuration -= session.pause_duration;
    }

    // Finalizar sessão
    const updateQuery = `
      UPDATE sessions 
      SET status = 'completed', 
          end_time = $2, 
          total_duration = $3,
          notes = COALESCE($4, notes),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [id, endTime, totalDuration, notes]);
    const completedSession = result.rows[0];

    console.log('Sessão finalizada:', id, `Duração: ${totalDuration}s`);

    res.json({
      success: true,
      session: {
        id: completedSession.id,
        status: completedSession.status,
        start_time: completedSession.start_time,
        end_time: completedSession.end_time,
        total_duration: completedSession.total_duration,
        pause_duration: completedSession.pause_duration,
        notes: completedSession.notes
      }
    });

  } catch (error) {
    console.error('Erro ao finalizar sessão:', error);
    res.status(500).json({
      error: 'Erro ao finalizar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Obter sessão ativa do terapeuta
export const getActiveSession = async (req: Request, res: Response) => {
  const { therapist_id } = req.params;
  const client = getDbClient();

  try {
    await client.connect();

    const query = `
      SELECT s.*, 
             p.name as patient_name,
             t.user_id as therapist_user_id
      FROM sessions s
      LEFT JOIN patients p ON s.patient_id = p.id
      LEFT JOIN therapists t ON s.therapist_id = t.id
      WHERE s.therapist_id = $1 
        AND s.status IN ('active', 'paused')
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    const result = await client.query(query, [therapist_id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        session: null
      });
    }

    const session = result.rows[0];

    res.json({
      success: true,
      session: {
        id: session.id,
        appointment_id: session.appointment_id,
        therapist_id: session.therapist_id,
        patient_id: session.patient_id,
        patient_name: session.patient_name,
        status: session.status,
        start_time: session.start_time,
        pause_time: session.pause_time,
        resume_time: session.resume_time,
        pause_duration: session.pause_duration,
        notes: session.notes,
        created_at: session.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao buscar sessão ativa:', error);
    res.status(500).json({
      error: 'Erro ao buscar sessão ativa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Listar histórico de sessões
export const getSessionHistory = async (req: Request, res: Response) => {
  const { therapist_id } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  const client = getDbClient();

  try {
    await client.connect();

    const query = `
      SELECT s.*, 
             p.name as patient_name,
             a.appointment_date
      FROM sessions s
      LEFT JOIN patients p ON s.patient_id = p.id
      LEFT JOIN appointments a ON s.appointment_id = a.id
      WHERE s.therapist_id = $1 
        AND s.status = 'completed'
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await client.query(query, [therapist_id, limit, offset]);

    const sessions = result.rows.map(session => ({
      id: session.id,
      appointment_id: session.appointment_id,
      patient_id: session.patient_id,
      patient_name: session.patient_name,
      appointment_date: session.appointment_date,
      start_time: session.start_time,
      end_time: session.end_time,
      total_duration: session.total_duration,
      pause_duration: session.pause_duration,
      notes: session.notes,
      created_at: session.created_at
    }));

    res.json({
      success: true,
      sessions,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: sessions.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de sessões:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico de sessões',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};