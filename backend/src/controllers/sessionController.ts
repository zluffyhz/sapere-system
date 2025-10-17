import { Request, Response } from 'express';
import { Client } from 'pg';

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
  therapist_id?: string;
  patient_id: string;
  notes?: string;
}

// Iniciar nova sessão/consulta
export const startSession = async (req: Request, res: Response) => {
  const client = getDbClient();

  try {
    const { patient_id, appointment_id, notes } = req.body as SessionRequest;
    // @ts-ignore - req.user é adicionado pelo middleware de autenticação
    const therapist_id = req.user?.therapist_id || req.body.therapist_id;

    if (!patient_id) {
      return res.status(400).json({
        error: 'patient_id é obrigatório'
      });
    }

    if (!therapist_id) {
      return res.status(400).json({
        error: 'therapist_id não encontrado. Verifique autenticação.'
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

    // Buscar informações do paciente
    const patientQuery = `
      SELECT id, name, email, phone, birth_date
      FROM patients
      WHERE id = $1
    `;
    const patientResult = await client.query(patientQuery, [patient_id]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Paciente não encontrado'
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
      'active',
      new Date(),
      notes || null
    ];

    const result = await client.query(insertQuery, values);
    const session = result.rows[0];

    console.log('✅ Nova sessão iniciada:', session.id);

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
        created_at: session.created_at,
        patient: patientResult.rows[0]
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao iniciar sessão:', error);
    res.status(500).json({
      error: 'Erro ao iniciar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Atualizar evolução durante a consulta (salvar rascunho)
export const updateSessionEvolution = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { evolution, observations, activities } = req.body;
  const client = getDbClient();

  try {
    await client.connect();

    // Verificar se sessão existe e está ativa
    const checkQuery = `
      SELECT * FROM sessions WHERE id = $1 AND status IN ('active', 'paused')
    `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada ou já foi finalizada'
      });
    }

    // Atualizar evolução
    const updateQuery = `
      UPDATE sessions
      SET evolution = $2,
          observations = $3,
          activities = $4,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [id, evolution, observations, activities]);
    const session = result.rows[0];

    console.log('✅ Evolução atualizada:', id);

    res.json({
      success: true,
      session: {
        id: session.id,
        evolution: session.evolution,
        observations: session.observations,
        activities: session.activities,
        updated_at: session.updated_at
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao atualizar evolução:', error);
    res.status(500).json({
      error: 'Erro ao atualizar evolução',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Finalizar consulta/sessão
export const endSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    evolution,
    observations,
    activities,
    homework,
    next_steps,
    patient_mood,
    session_quality
  } = req.body;
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

    // Calcular duração total em minutos
    let totalDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

    // Subtrair tempo de pausa se houver
    if (session.pause_duration) {
      totalDuration -= Math.floor(session.pause_duration / 60);
    }

    // Validar que evolution foi preenchido
    if (!evolution || evolution.trim() === '') {
      return res.status(400).json({
        error: 'O campo "evolução" é obrigatório para finalizar a sessão'
      });
    }

    // Finalizar sessão
    const updateQuery = `
      UPDATE sessions
      SET status = 'completed',
          end_time = $2,
          total_duration = $3,
          evolution = $4,
          observations = $5,
          activities = $6,
          homework = $7,
          next_steps = $8,
          patient_mood = $9,
          session_quality = $10,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      id,
      endTime,
      totalDuration,
      evolution,
      observations,
      activities,
      homework,
      next_steps,
      patient_mood,
      session_quality
    ]);

    const completedSession = result.rows[0];

    // Buscar informações do paciente
    const patientQuery = `
      SELECT id, name, email, phone
      FROM patients
      WHERE id = $1
    `;
    const patientResult = await client.query(patientQuery, [completedSession.patient_id]);

    console.log('✅ Sessão finalizada:', id, `| Duração: ${totalDuration} minutos`);

    res.json({
      success: true,
      session: {
        id: completedSession.id,
        status: completedSession.status,
        start_time: completedSession.start_time,
        end_time: completedSession.end_time,
        total_duration: completedSession.total_duration,
        evolution: completedSession.evolution,
        observations: completedSession.observations,
        activities: completedSession.activities,
        homework: completedSession.homework,
        next_steps: completedSession.next_steps,
        patient_mood: completedSession.patient_mood,
        session_quality: completedSession.session_quality,
        patient: patientResult.rows[0]
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao finalizar sessão:', error);
    res.status(500).json({
      error: 'Erro ao finalizar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Buscar sessão ativa do terapeuta
export const getActiveSession = async (req: Request, res: Response) => {
  const client = getDbClient();

  try {
    // @ts-ignore - req.user é adicionado pelo middleware de autenticação
    const therapist_id = req.user?.therapist_id || req.params.therapist_id;

    if (!therapist_id) {
      return res.status(400).json({
        error: 'therapist_id não encontrado'
      });
    }

    await client.connect();

    const query = `
      SELECT s.*,
             p.name as patient_name,
             p.email as patient_email,
             p.phone as patient_phone,
             p.birth_date as patient_birth_date
      FROM sessions s
      LEFT JOIN patients p ON s.patient_id = p.id
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
        status: session.status,
        start_time: session.start_time,
        evolution: session.evolution,
        observations: session.observations,
        activities: session.activities,
        notes: session.notes,
        created_at: session.created_at,
        patient: {
          id: session.patient_id,
          name: session.patient_name,
          email: session.patient_email,
          phone: session.patient_phone,
          birthDate: session.patient_birth_date
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar sessão ativa:', error);
    res.status(500).json({
      error: 'Erro ao buscar sessão ativa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Listar histórico de sessões de um paciente
export const getPatientSessions = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const client = getDbClient();

  try {
    await client.connect();

    const query = `
      SELECT s.*,
             t.professional_name as therapist_name,
             t.specialties as therapist_specialties
      FROM sessions s
      LEFT JOIN therapists t ON s.therapist_id = t.id
      WHERE s.patient_id = $1
        AND s.status = 'completed'
      ORDER BY s.start_time DESC
    `;

    const result = await client.query(query, [patientId]);

    const sessions = result.rows.map(session => ({
      id: session.id,
      therapist_id: session.therapist_id,
      therapist_name: session.therapist_name,
      therapist_specialties: session.therapist_specialties,
      start_time: session.start_time,
      end_time: session.end_time,
      total_duration: session.total_duration,
      evolution: session.evolution,
      observations: session.observations,
      activities: session.activities,
      homework: session.homework,
      next_steps: session.next_steps,
      patient_mood: session.patient_mood,
      session_quality: session.session_quality,
      created_at: session.created_at
    }));

    res.json({
      success: true,
      sessions
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar sessões do paciente:', error);
    res.status(500).json({
      error: 'Erro ao buscar sessões',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Pausar sessão (mantido do código original)
export const pauseSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = getDbClient();

  try {
    await client.connect();

    const checkQuery = `
      SELECT * FROM sessions WHERE id = $1 AND status = 'active'
    `;
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada ou não está ativa'
      });
    }

    const updateQuery = `
      UPDATE sessions
      SET status = 'paused', pause_time = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [id]);
    const session = result.rows[0];

    console.log('⏸️ Sessão pausada:', id);

    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        pause_time: session.pause_time
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao pausar sessão:', error);
    res.status(500).json({
      error: 'Erro ao pausar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Retomar sessão (mantido do código original)
export const resumeSession = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = getDbClient();

  try {
    await client.connect();

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
    const pauseStart = new Date(session.pause_time);
    const resumeTime = new Date();
    const pauseDuration = Math.floor((resumeTime.getTime() - pauseStart.getTime()) / 1000);

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

    console.log('▶️ Sessão retomada:', id);

    res.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        resume_time: updatedSession.resume_time,
        pause_duration: updatedSession.pause_duration
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao retomar sessão:', error);
    res.status(500).json({
      error: 'Erro ao retomar sessão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
};

// Alias para manter compatibilidade com rotas antigas
export const completeSession = endSession;
export const getSessionHistory = getPatientSessions;
