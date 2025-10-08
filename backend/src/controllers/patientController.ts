import { Response } from 'express';
import { Client } from 'pg';
import { AuthRequest } from '../middleware/auth';

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

// Listar todos os pacientes
export const getPatients = async (req: AuthRequest, res: Response) => {
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT s.id) as total_sessions,
        MAX(s.start_time) as last_session_date,
        COUNT(DISTINCT ad.id) as total_documents
      FROM patients p
      LEFT JOIN sessions s ON p.id = s.patient_id AND s.status != 'cancelled'
      LEFT JOIN anamnese_documents ad ON p.id = ad.patient_id AND ad.status = 'ready'
      WHERE p.active = true
      GROUP BY p.id, p.name, p.email, p.phone, p.date_of_birth, p.emergency_contact, p.medical_history, p.created_at, p.updated_at, p.active
      ORDER BY p.name ASC
    `;
    
    const result = await client.query(query);
    
    res.json({
      success: true,
      patients: result.rows.map(patient => ({
        ...patient,
        total_sessions: parseInt(patient.total_sessions) || 0,
        total_documents: parseInt(patient.total_documents) || 0,
        last_session_date: patient.last_session_date || null
      }))
    });
    
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
};

// Buscar paciente por ID
export const getPatientById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const client = getDbClient();
  
  try {
    await client.connect();
    
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT s.id) as total_sessions,
        MAX(s.start_time) as last_session_date,
        COUNT(DISTINCT ad.id) as total_documents,
        COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
        AVG(CASE WHEN s.status = 'completed' THEN EXTRACT(EPOCH FROM (s.end_time - s.start_time))/60 END) as avg_session_duration
      FROM patients p
      LEFT JOIN sessions s ON p.id = s.patient_id AND s.status != 'cancelled'
      LEFT JOIN anamnese_documents ad ON p.id = ad.patient_id AND ad.status = 'ready'
      WHERE p.id = $1 AND p.active = true
      GROUP BY p.id
    `;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }
    
    const patient = result.rows[0];
    
    res.json({
      success: true,
      patient: {
        ...patient,
        total_sessions: parseInt(patient.total_sessions) || 0,
        total_documents: parseInt(patient.total_documents) || 0,
        completed_sessions: parseInt(patient.completed_sessions) || 0,
        avg_session_duration: patient.avg_session_duration ? Math.round(patient.avg_session_duration) : null,
        last_session_date: patient.last_session_date || null
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
};

// Criar novo paciente
export const createPatient = async (req: AuthRequest, res: Response) => {
  const { name, email, phone, date_of_birth, emergency_contact, medical_history } = req.body;
  const client = getDbClient();
  
  try {
    await client.connect();
    
    // Verificar se email já existe
    if (email) {
      const emailCheck = await client.query(
        'SELECT id FROM patients WHERE email = $1 AND active = true',
        [email]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um paciente com este email'
        });
      }
    }
    
    const query = `
      INSERT INTO patients (name, email, phone, date_of_birth, emergency_contact, medical_history)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      name,
      email || null,
      phone || null,
      date_of_birth || null,
      emergency_contact || null,
      medical_history || null
    ]);
    
    res.status(201).json({
      success: true,
      patient: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
};

// Atualizar paciente
export const updatePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, date_of_birth, emergency_contact, medical_history } = req.body;
  const client = getDbClient();
  
  try {
    await client.connect();
    
    // Verificar se paciente existe
    const patientCheck = await client.query(
      'SELECT id FROM patients WHERE id = $1 AND active = true',
      [id]
    );
    
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }
    
    // Verificar se email já existe em outro paciente
    if (email) {
      const emailCheck = await client.query(
        'SELECT id FROM patients WHERE email = $1 AND active = true AND id != $2',
        [email, id]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Já existe outro paciente com este email'
        });
      }
    }
    
    const query = `
      UPDATE patients 
      SET name = $1, email = $2, phone = $3, date_of_birth = $4, 
          emergency_contact = $5, medical_history = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND active = true
      RETURNING *
    `;
    
    const result = await client.query(query, [
      name,
      email || null,
      phone || null,
      date_of_birth || null,
      emergency_contact || null,
      medical_history || null,
      id
    ]);
    
    res.json({
      success: true,
      patient: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
};

// Desativar paciente (soft delete)
export const deletePatient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const client = getDbClient();
  
  try {
    await client.connect();
    
    // Verificar se paciente existe
    const patientCheck = await client.query(
      'SELECT id, name FROM patients WHERE id = $1 AND active = true',
      [id]
    );
    
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Paciente não encontrado'
      });
    }
    
    // Verificar se tem sessões ativas
    const sessionsCheck = await client.query(
      'SELECT COUNT(*) as count FROM sessions WHERE patient_id = $1 AND status IN ($2, $3)',
      [id, 'scheduled', 'in_progress']
    );
    
    if (parseInt(sessionsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível desativar paciente com sessões ativas'
      });
    }
    
    // Desativar paciente
    await client.query(
      'UPDATE patients SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Paciente desativado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao desativar paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
};

// Buscar pacientes (com filtros)
export const searchPatients = async (req: AuthRequest, res: Response) => {
  const { search, page = 1, limit = 20 } = req.query;
  const client = getDbClient();
  
  try {
    await client.connect();
    
    let query = `
      SELECT 
        p.*,
        COUNT(DISTINCT s.id) as total_sessions,
        MAX(s.start_time) as last_session_date,
        COUNT(DISTINCT ad.id) as total_documents
      FROM patients p
      LEFT JOIN sessions s ON p.id = s.patient_id AND s.status != 'cancelled'
      LEFT JOIN anamnese_documents ad ON p.id = ad.patient_id AND ad.status = 'ready'
      WHERE p.active = true
    `;
    
    const queryParams: any[] = [];
    
    if (search) {
      query += ` AND (p.name ILIKE $${queryParams.length + 1} OR p.email ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` GROUP BY p.id ORDER BY p.name ASC`;
    
    // Adicionar paginação
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit as string), offset);
    
    const result = await client.query(query, queryParams);
    
    // Contar total de registros
    let countQuery = 'SELECT COUNT(*) FROM patients WHERE active = true';
    let countParams: any[] = [];
    
    if (search) {
      countQuery += ' AND (name ILIKE $1 OR email ILIKE $1)';
      countParams.push(`%${search}%`);
    }
    
    const countResult = await client.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      patients: result.rows.map(patient => ({
        ...patient,
        total_sessions: parseInt(patient.total_sessions) || 0,
        total_documents: parseInt(patient.total_documents) || 0,
        last_session_date: patient.last_session_date || null
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalRecords,
        pages: Math.ceil(totalRecords / parseInt(limit as string))
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
};