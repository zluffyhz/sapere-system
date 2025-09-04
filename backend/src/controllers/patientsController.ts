import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

console.log('👥 Controlador de pacientes carregado com PostgreSQL');
/*const PATIENTS = [
  {
    id: 'p1',
    name: 'João Silva Santos',
    social_name: 'João',
    email: 'joao.santos@email.com',
    phone: '(92) 99111-1111',
    birth_date: '2010-05-15',
    age: 13,
    cpf: '123.456.789-01',
    rg: '1234567-8',
    gender: 'masculino',
    address: {
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'Manaus',
      state: 'AM',
      zip_code: '69000-000'
    },
    diagnosis: ['TDAH', 'Ansiedade'],
    severity: 'moderado',
    medications: [
      { name: 'Ritalina 10mg', frequency: '2x ao dia', notes: 'Tomar com alimento' }
    ],
    allergies: ['Lactose'],
    special_needs: 'Precisa de ambiente calmo para concentração',
    school_info: {
      name: 'Escola Municipal Santos Dumont',
      grade: '8º ano',
      teacher: 'Prof. Maria Oliveira',
      needs_support: true,
      support_description: 'Acompanhamento pedagógico especializado'
    },
    emergency_contacts: [
      { name: 'Maria Santos (mãe)', phone: '(92) 99222-2222', relation: 'mãe' },
      { name: 'Pedro Santos (pai)', phone: '(92) 99333-3333', relation: 'pai' }
    ],
    responsible_users: ['1'], // Admin
    therapists: ['2'], // Dra. Maria
    active: true,
    first_appointment_at: '2024-01-15T14:00:00Z',
    last_appointment_at: '2025-01-05T15:30:00Z',
    next_appointment_at: '2025-01-12T14:00:00Z',
    total_sessions: 24,
    progress_notes: 'Paciente apresentando ótima evolução na concentração e controle de impulsos',
    goals: [
      'Melhorar concentração nas atividades escolares',
      'Desenvolver estratégias de autocontrole',
      'Fortalecer vínculos sociais'
    ],
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2025-01-05T16:00:00Z',
    created_by: '1'
  },
  {
    id: 'p2',
    name: 'Ana Maria Ferreira',
    social_name: 'Ana',
    email: 'ana.ferreira@email.com',
    phone: '(92) 98888-8888',
    birth_date: '2012-08-20',
    age: 12,
    cpf: '987.654.321-01',
    rg: '8765432-1',
    gender: 'feminino',
    address: {
      street: 'Av. Eduardo Ribeiro, 456',
      neighborhood: 'Adrianópolis',
      city: 'Manaus',
      state: 'AM',
      zip_code: '69057-000'
    },
    diagnosis: ['TEA Nível 1', 'Hipersensibilidade sensorial'],
    severity: 'leve',
    medications: [],
    allergies: ['Corante artificial'],
    special_needs: 'Sensível a ruídos altos e luzes muito fortes',
    school_info: {
      name: 'Colégio Particular Amazonas',
      grade: '6º ano',
      teacher: 'Prof. Carlos Lima',
      needs_support: true,
      support_description: 'Monitora educacional para apoio social'
    },
    emergency_contacts: [
      { name: 'Lucia Ferreira (mãe)', phone: '(92) 97777-7777', relation: 'mãe' },
      { name: 'Roberto Ferreira (pai)', phone: '(92) 96666-6666', relation: 'pai' }
    ],
    responsible_users: ['1'],
    therapists: ['2'],
    active: true,
    first_appointment_at: '2024-02-01T09:00:00Z',
    last_appointment_at: '2025-01-03T10:30:00Z',
    next_appointment_at: '2025-01-10T09:00:00Z',
    total_sessions: 20,
    progress_notes: 'Significativa melhora na comunicação social e redução de comportamentos repetitivos',
    goals: [
      'Expandir comunicação verbal',
      'Melhorar interação social com pares',
      'Desenvolver tolerância a mudanças de rotina'
    ],
    created_at: '2024-01-25T11:30:00Z',
    updated_at: '2025-01-03T11:00:00Z',
    created_by: '1'
  },
  {
    id: 'p3',
    name: 'Carlos Eduardo Mendes',
    social_name: 'Carlos',
    email: 'carlos.mendes@email.com',
    phone: '(92) 95555-5555',
    birth_date: '2015-03-10',
    age: 9,
    cpf: '456.789.123-01',
    rg: '4567891-2',
    gender: 'masculino',
    address: {
      street: 'Rua José Paranaguá, 789',
      neighborhood: 'Ponta Negra',
      city: 'Manaus',
      state: 'AM',
      zip_code: '69037-000'
    },
    diagnosis: ['Atraso no desenvolvimento da linguagem', 'Dislexia'],
    severity: 'moderado',
    medications: [],
    allergies: [],
    special_needs: 'Necessita de métodos alternativos de aprendizagem para leitura',
    school_info: {
      name: 'Escola Estadual Amazonas',
      grade: '3º ano',
      teacher: 'Prof. Ana Souza',
      needs_support: true,
      support_description: 'Apoio pedagógico para desenvolvimento da linguagem'
    },
    emergency_contacts: [
      { name: 'Patricia Mendes (mãe)', phone: '(92) 94444-4444', relation: 'mãe' },
      { name: 'Eduardo Mendes (pai)', phone: '(92) 93333-3333', relation: 'pai' }
    ],
    responsible_users: ['1'],
    therapists: ['2'],
    active: true,
    first_appointment_at: '2024-03-15T16:00:00Z',
    last_appointment_at: '2025-01-08T14:30:00Z',
    next_appointment_at: '2025-01-15T16:00:00Z',
    total_sessions: 18,
    progress_notes: 'Evolução consistente na linguagem expressiva e habilidades pré-acadêmicas',
    goals: [
      'Expandir vocabulário ativo',
      'Desenvolver habilidades de leitura',
      'Melhorar coordenação motora fina'
    ],
    created_at: '2024-03-10T14:20:00Z',
    updated_at: '2025-01-08T15:00:00Z',
    created_by: '1'
  }
];*/

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

// Listar todos os pacientes (Admin/Terapeuta) ou apenas os próprios (Responsável)
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let whereClause = 'WHERE p.active = 1';
    let params: any[] = [];

    // Aplicar filtros de busca se fornecidos
    const { search, diagnosis, therapist_id, active } = req.query;
    
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.social_name LIKE ? OR p.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (diagnosis) {
      whereClause += " AND p.diagnosis LIKE ?";
      params.push(`%${diagnosis}%`);
    }

    if (active !== undefined) {
      whereClause = whereClause.replace('WHERE p.active = 1', 'WHERE p.active = ?');
      params.unshift(active === 'true' ? 1 : 0);
    }

    // Buscar pacientes do banco
    const result = await query(`
      SELECT 
        p.*,
        u.name as created_by_name
      FROM patients p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, params);

    const patients = result.rows.map((row: any) => {
      let parsedData: any = {
        id: row.id,
        name: row.name,
        social_name: row.social_name,
        email: row.email,
        phone: row.phone,
        birth_date: row.birth_date,
        age: row.birth_date ? calculateAge(row.birth_date) : null,
        cpf: user?.role === 'admin' ? row.cpf : undefined,
        rg: user?.role === 'admin' ? row.rg : undefined,
        gender: row.gender,
        active: row.active === 1,
        first_appointment_at: row.first_appointment_at,
        last_appointment_at: row.last_appointment_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      };

      // Parse JSON fields
      try {
        parsedData.address = row.address ? JSON.parse(row.address) : null;
        parsedData.diagnosis = row.diagnosis ? JSON.parse(row.diagnosis) : [];
        parsedData.medications = row.medications ? JSON.parse(row.medications) : [];
        parsedData.allergies = row.allergies ? JSON.parse(row.allergies) : [];
        parsedData.responsible_users = row.responsible_users ? JSON.parse(row.responsible_users) : [];
        parsedData.emergency_contacts = row.emergency_contacts ? JSON.parse(row.emergency_contacts) : [];
      } catch (e) {
        console.error('Erro ao fazer parse dos dados JSON:', e);
      }

      return parsedData;
    });

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
      WHERE p.id = ?
    `, [patientId]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const row = result.rows[0];
    let patient: any = {
      id: row.id,
      name: row.name,
      social_name: row.social_name,
      email: row.email,
      phone: row.phone,
      birth_date: row.birth_date,
      age: row.birth_date ? calculateAge(row.birth_date) : null,
      cpf: row.cpf,
      rg: row.rg,
      gender: row.gender,
      special_needs: row.special_needs,
      school_info: row.school_info,
      work_info: row.work_info,
      general_notes: row.general_notes,
      internal_notes: row.internal_notes,
      active: row.active === 1,
      first_appointment_at: row.first_appointment_at,
      last_appointment_at: row.last_appointment_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by_name: row.created_by_name
    };

    // Parse JSON fields
    try {
      patient.address = row.address ? JSON.parse(row.address) : null;
      patient.diagnosis = row.diagnosis ? JSON.parse(row.diagnosis) : [];
      patient.medications = row.medications ? JSON.parse(row.medications) : [];
      patient.allergies = row.allergies ? JSON.parse(row.allergies) : [];
      patient.responsible_users = row.responsible_users ? JSON.parse(row.responsible_users) : [];
      patient.emergency_contacts = row.emergency_contacts ? JSON.parse(row.emergency_contacts) : [];
    } catch (e) {
      console.error('Erro ao fazer parse dos dados JSON:', e);
    }

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
      name, social_name, email, phone, birth_date, cpf, rg, gender,
      address, diagnosis, medications, allergies, special_needs,
      school_info, work_info, responsible_users, emergency_contacts,
      general_notes, internal_notes
    } = req.body;

    const patientId = uuidv4();
    const currentTime = new Date().toISOString();

    // Inserir paciente no banco
    await query(`
      INSERT INTO patients (
        id, name, social_name, email, phone, birth_date, cpf, rg, gender,
        address, diagnosis, medications, allergies, special_needs,
        school_info, work_info, responsible_users, emergency_contacts,
        general_notes, internal_notes, active, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientId, name, social_name, email, phone, birth_date, cpf, rg, gender,
      JSON.stringify(address), JSON.stringify(diagnosis), JSON.stringify(medications),
      JSON.stringify(allergies), special_needs, school_info, work_info,
      JSON.stringify(responsible_users), JSON.stringify(emergency_contacts),
      general_notes, internal_notes, 1, currentTime, currentTime, user.id
    ]);

    // Buscar paciente criado
    const result = await query('SELECT * FROM patients WHERE id = ?', [patientId]);
    const newPatient = result.rows[0];

    res.status(201).json({
      message: 'Paciente criado com sucesso',
      patient: {
        ...newPatient,
        age: newPatient.birth_date ? calculateAge(newPatient.birth_date) : null,
        active: newPatient.active === 1
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
    const checkResult = await query('SELECT id FROM patients WHERE id = ?', [patientId]);
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const {
      name, social_name, email, phone, birth_date, cpf, rg, gender,
      address, diagnosis, medications, allergies, special_needs,
      school_info, work_info, responsible_users, emergency_contacts,
      general_notes, internal_notes
    } = req.body;

    const currentTime = new Date().toISOString();

    // Atualizar paciente no banco
    await query(`
      UPDATE patients SET
        name = ?, social_name = ?, email = ?, phone = ?, birth_date = ?,
        cpf = ?, rg = ?, gender = ?, address = ?, diagnosis = ?,
        medications = ?, allergies = ?, special_needs = ?, school_info = ?,
        work_info = ?, responsible_users = ?, emergency_contacts = ?,
        general_notes = ?, internal_notes = ?, updated_at = ?, updated_by = ?
      WHERE id = ?
    `, [
      name, social_name, email, phone, birth_date, cpf, rg, gender,
      JSON.stringify(address), JSON.stringify(diagnosis), JSON.stringify(medications),
      JSON.stringify(allergies), special_needs, school_info, work_info,
      JSON.stringify(responsible_users), JSON.stringify(emergency_contacts),
      general_notes, internal_notes, currentTime, user.id, patientId
    ]);

    // Buscar paciente atualizado
    const result = await query('SELECT * FROM patients WHERE id = ?', [patientId]);
    const updatedPatient = result.rows[0];

    res.json({
      message: 'Paciente atualizado com sucesso',
      patient: {
        ...updatedPatient,
        age: updatedPatient.birth_date ? calculateAge(updatedPatient.birth_date) : null,
        active: updatedPatient.active === 1
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
    const checkResult = await query('SELECT id FROM patients WHERE id = ?', [patientId]);
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const currentTime = new Date().toISOString();

    // Desativar paciente no banco
    await query(
      'UPDATE patients SET active = 0, updated_at = ?, updated_by = ? WHERE id = ?',
      [currentTime, user.id, patientId]
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
    const activeResult = await query('SELECT COUNT(*) as total FROM patients WHERE active = 1');
    
    // Buscar pacientes para calcular estatísticas detalhadas
    const patientsResult = await query('SELECT birth_date, diagnosis FROM patients WHERE active = 1');
    
    const patients = patientsResult.rows.map((row: any) => ({
      age: row.birth_date ? calculateAge(row.birth_date) : 0,
      diagnosis: row.diagnosis ? JSON.parse(row.diagnosis) : []
    }));

    const stats = {
      total: totalResult.rows[0].total,
      active: activeResult.rows[0].total,
      by_age_group: {
        '0-5': patients.filter(p => p.age <= 5).length,
        '6-12': patients.filter(p => p.age >= 6 && p.age <= 12).length,
        '13-17': patients.filter(p => p.age >= 13 && p.age <= 17).length,
        '18+': patients.filter(p => p.age >= 18).length,
      },
      by_diagnosis: patients.reduce((acc: any, patient) => {
        if (Array.isArray(patient.diagnosis)) {
          patient.diagnosis.forEach((diag: string) => {
            acc[diag] = (acc[diag] || 0) + 1;
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