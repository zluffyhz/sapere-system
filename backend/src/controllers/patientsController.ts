import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

console.log('👥 Controlador de pacientes carregado com PostgreSQL - Versão Corrigida');

// Função para calcular idade
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Listar todos os pacientes
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let whereClause = 'WHERE p.active = true';
    let params: any[] = [];
    let paramIndex = 1;

    // Aplicar filtros de busca se fornecidos
    const { search, active } = req.query;
    
    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.contacts->>'email' ILIKE $${paramIndex+1} OR p.contacts->>'phone' ILIKE $${paramIndex+2})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    if (active !== undefined) {
      whereClause = whereClause.replace('WHERE p.active = true', `WHERE p.active = $${paramIndex}`);
      params.push(active === 'true');
      paramIndex++;
    }

    // Buscar pacientes do banco
    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.birth_date,
        p.gender,
        p.contacts,
        p.active,
        p.created_at,
        p.updated_at,
        u.name as created_by_name
      FROM patients p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, params);

    const patients = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      birth_date: row.birth_date,
      age: row.birth_date ? calculateAge(row.birth_date) : null,
      gender: row.gender,
      contacts: row.contacts || {},
      active: row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by_name: row.created_by_name
    }));

    res.json({
      patients,
      total: patients.length,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar um paciente específico
export const getPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    const result = await query(`
      SELECT 
        p.*,
        u.name as created_by_name
      FROM patients p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `, [patientId]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const row = result.rows[0];
    const patient = {
      id: row.id,
      name: row.name,
      birth_date: row.birth_date,
      age: row.birth_date ? calculateAge(row.birth_date) : null,
      gender: row.gender,
      cpf: row.cpf,
      contacts: row.contacts || {},
      responsible: row.responsible || {},
      insurance: row.insurance || {},
      consent: row.consent || {},
      tags: row.tags || [],
      observations: row.observations,
      active: row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by_name: row.created_by_name
    };

    res.json({
      patient,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo paciente
export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // Apenas Admin e Terapeuta podem criar pacientes
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    const {
      name, birth_date, gender, cpf, contacts, responsible, 
      insurance, consent, tags, observations
    } = req.body;

    if (!name || !consent) {
      return res.status(400).json({ 
        error: 'Nome e consentimento são obrigatórios' 
      });
    }

    const patientId = uuidv4();

    // Inserir paciente no banco
    await query(`
      INSERT INTO patients (
        id, name, birth_date, gender, cpf, contacts, responsible,
        insurance, consent, tags, observations, active, created_at, updated_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      patientId, name, birth_date, gender, cpf,
      JSON.stringify(contacts || {}), JSON.stringify(responsible || {}),
      JSON.stringify(insurance || {}), JSON.stringify(consent),
      tags || [], observations, true, new Date(), new Date(), user.id
    ]);

    // Buscar paciente criado
    const result = await query('SELECT * FROM patients WHERE id = $1', [patientId]);
    const newPatient = result.rows[0];

    res.status(201).json({
      message: 'Paciente criado com sucesso',
      patient: {
        ...newPatient,
        age: newPatient.birth_date ? calculateAge(newPatient.birth_date) : null
      }
    });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar paciente
export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const user = req.user;
    
    // Apenas Admin e Terapeuta podem atualizar pacientes
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    // Verificar se paciente existe
    const checkResult = await query('SELECT id FROM patients WHERE id = $1', [patientId]);
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const {
      name, birth_date, gender, cpf, contacts, responsible,
      insurance, consent, tags, observations
    } = req.body;

    // Atualizar paciente no banco
    await query(`
      UPDATE patients SET
        name = $1, birth_date = $2, gender = $3, cpf = $4, contacts = $5,
        responsible = $6, insurance = $7, consent = $8, tags = $9,
        observations = $10, updated_at = $11
      WHERE id = $12
    `, [
      name, birth_date, gender, cpf,
      JSON.stringify(contacts || {}), JSON.stringify(responsible || {}),
      JSON.stringify(insurance || {}), JSON.stringify(consent || {}),
      tags || [], observations, new Date(), patientId
    ]);

    // Buscar paciente atualizado
    const result = await query('SELECT * FROM patients WHERE id = $1', [patientId]);
    const updatedPatient = result.rows[0];

    res.json({
      message: 'Paciente atualizado com sucesso',
      patient: {
        ...updatedPatient,
        age: updatedPatient.birth_date ? calculateAge(updatedPatient.birth_date) : null
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Desativar paciente (soft delete)
export const deactivatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const user = req.user;
    
    // Apenas Admin pode desativar pacientes
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem desativar pacientes' });
    }

    // Verificar se paciente existe
    const checkResult = await query('SELECT id FROM patients WHERE id = $1', [patientId]);
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Desativar paciente no banco
    await query(
      'UPDATE patients SET active = false, updated_at = $1 WHERE id = $2',
      [new Date(), patientId]
    );

    res.json({
      message: 'Paciente desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar paciente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Estatísticas dos pacientes
export const getPatientsStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    // Buscar estatísticas do banco
    const totalResult = await query('SELECT COUNT(*) as total FROM patients');
    const activeResult = await query('SELECT COUNT(*) as total FROM patients WHERE active = true');
    
    // Buscar pacientes para calcular estatísticas detalhadas
    const patientsResult = await query('SELECT birth_date, tags FROM patients WHERE active = true');
    
    const patients = patientsResult.rows.map((row: any) => ({
      age: row.birth_date ? calculateAge(row.birth_date) : 0,
      tags: row.tags || []
    }));

    const stats = {
      total: parseInt(totalResult.rows[0].total),
      active: parseInt(activeResult.rows[0].total),
      by_age_group: {
        '0-5': patients.filter(p => p.age <= 5).length,
        '6-12': patients.filter(p => p.age >= 6 && p.age <= 12).length,
        '13-17': patients.filter(p => p.age >= 13 && p.age <= 17).length,
        '18+': patients.filter(p => p.age >= 18).length,
      },
      by_tags: patients.reduce((acc: any, patient) => {
        if (Array.isArray(patient.tags)) {
          patient.tags.forEach((tag: string) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
        }
        return acc;
      }, {})
    };

    res.json({
      stats,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export default {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deactivatePatient,
  getPatientsStats
};