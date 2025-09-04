import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query as dbQuery } from '../database/config/database';
import { AuthRequest } from '../middleware/auth';

// Interfaces
interface MedicalRecord {
  id: string;
  patient_id: string;
  therapist_id: string;
  appointment_id?: string;
  record_type: string;
  title: string;
  content: string;
  assessment_data?: object;
  evolution_data?: object;
  goals?: object[];
  interventions?: string[];
  mood?: string;
  attention_level?: number;
  cooperation_level?: number;
  family_guidelines?: string;
  homework?: string;
  next_steps?: string;
  next_appointment_notes?: string;
  version: number;
  parent_record_id?: string;
  is_draft: boolean;
  reviewed_by?: string;
  reviewed_at?: Date;
  record_date: Date;
  created_by: string;
  updated_by: string;
}

interface RecordAttachment {
  id: string;
  record_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  attachment_type: string;
  title?: string;
  description?: string;
  uploaded_by: string;
}

// Listar registros com filtros
export const getRecords = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patient_id,
      therapist_id,
      record_type,
      start_date,
      end_date,
      status,
      limit = '20',
      offset = '0'
    } = req.query;

    let query = `
      SELECT 
        r.*,
        u.name as therapist_name,
        p.name as patient_name
      FROM records r
      LEFT JOIN users u ON r.therapist_id = u.id
      LEFT JOIN patients p ON r.patient_id = p.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (patient_id) {
      query += ` AND r.patient_id = $${paramIndex++}`;
      queryParams.push(patient_id);
    }

    if (therapist_id) {
      query += ` AND r.therapist_id = $${paramIndex++}`;
      queryParams.push(therapist_id);
    }

    if (record_type) {
      query += ` AND r.record_type = $${paramIndex++}`;
      queryParams.push(record_type);
    }

    if (start_date) {
      query += ` AND r.record_date >= $${paramIndex++}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ` AND r.record_date <= $${paramIndex++}`;
      queryParams.push(end_date);
    }

    if (status === 'draft') {
      query += ` AND r.is_draft = 1`;
    } else if (status === 'completed') {
      query += ` AND r.is_draft = 0 AND r.reviewed_by IS NULL`;
    } else if (status === 'reviewed') {
      query += ` AND r.reviewed_by IS NOT NULL`;
    }

    // Filtrar por terapeuta se não for admin
    if (req.user?.role === 'therapist') {
      query += ` AND r.therapist_id = $${paramIndex++}`;
      queryParams.push(req.user.id);
    }

    query += ` ORDER BY r.record_date DESC, r.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    queryParams.push(parseInt(limit as string), parseInt(offset as string));

    const result = await dbQuery(query, queryParams);

    // Processar os dados para o formato esperado pelo frontend
    const records = result.rows.map(row => ({
      id: row.id,
      patient_id: row.patient_id,
      patient_name: row.patient_name,
      session_date: row.record_date,
      therapist_id: row.therapist_id,
      therapist_name: row.therapist_name,
      title: row.title,
      content: row.content.substring(0, 200) + (row.content.length > 200 ? '...' : ''),
      record_type: row.record_type,
      is_draft: Boolean(row.is_draft),
      reviewed_by: row.reviewed_by,
      reviewed_at: row.reviewed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({
      success: true,
      data: records,
      total: records.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      message: 'Registros recuperados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar registro específico por ID
export const getRecordById = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;

    const query = `
      SELECT 
        r.*,
        u.name as therapist_name,
        p.name as patient_name,
        t.specialties
      FROM records r
        LEFT JOIN users u ON r.therapist_id = u.id  
        LEFT JOIN patients p ON r.patient_id = p.id
        LEFT JOIN therapists t ON r.therapist_id = t.id
      WHERE r.id = $1
    `;

    const result = await dbQuery(query, [recordId]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
      return;
    }

    const record = result.rows[0];

    // Buscar anexos do registro
    const attachmentsResult = await dbQuery(
      'SELECT * FROM record_attachments WHERE record_id = $1 ORDER BY created_at DESC',
      [recordId]
    );

    const processedRecord = {
      ...record,
      assessment_data: record.assessment_data ? JSON.parse(record.assessment_data) : null,
      evolution_data: record.evolution_data ? JSON.parse(record.evolution_data) : null,
      goals: record.goals ? JSON.parse(record.goals) : [],
      interventions: record.interventions ? JSON.parse(record.interventions) : [],
      attachments: attachmentsResult.rows,
      is_draft: Boolean(record.is_draft)
    };

    res.json({
      success: true,
      data: processedRecord,
      message: 'Registro encontrado'
    });
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo registro
export const createRecord = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patient_id,
      appointment_id,
      record_type = 'evolution',
      title,
      content,
      assessment_data,
      evolution_data,
      goals,
      interventions,
      mood,
      attention_level,
      cooperation_level,
      family_guidelines,
      homework,
      next_steps,
      next_appointment_notes,
      is_draft = false,
      attachments = []
    } = req.body;

    const recordId = uuidv4();
    const therapistId = req.user?.id;

    // Criar o registro
    const insertRecordQuery = `
      INSERT INTO records (
        id, patient_id, therapist_id, appointment_id, record_type,
        title, content, assessment_data, evolution_data, goals,
        interventions, mood, attention_level, cooperation_level,
        family_guidelines, homework, next_steps, next_appointment_notes,
        is_draft, record_date, created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      )
      RETURNING *
    `;

    const createdRecord = await dbQuery(insertRecordQuery, [
      recordId, patient_id, therapistId, appointment_id, record_type,
      title, content, 
      assessment_data ? JSON.stringify(assessment_data) : null,
      evolution_data ? JSON.stringify(evolution_data) : null,
      goals ? JSON.stringify(goals) : null,
      interventions ? JSON.stringify(interventions) : null,
      mood, attention_level, cooperation_level,
      family_guidelines, homework, next_steps, next_appointment_notes,
      is_draft, new Date().toISOString(), therapistId, therapistId
    ]);

    // Processar anexos se existirem
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const attachmentId = uuidv4();
        const insertAttachmentQuery = `
          INSERT INTO record_attachments (
            id, record_id, filename, original_filename, file_path,
            file_size, mime_type, attachment_type, title, description, uploaded_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

        await dbQuery(insertAttachmentQuery, [
          attachmentId, recordId, attachment.filename, attachment.original_filename,
          attachment.file_path, attachment.file_size, attachment.mime_type,
          attachment.attachment_type, attachment.title, attachment.description, therapistId
        ]);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...createdRecord.rows[0],
        is_draft: Boolean(createdRecord.rows[0].is_draft)
      },
      message: 'Registro criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar registro existente
export const updateRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { recordId } = req.params;
    const {
      title,
      content,
      assessment_data,
      evolution_data,
      goals,
      interventions,
      mood,
      attention_level,
      cooperation_level,
      family_guidelines,
      homework,
      next_steps,
      next_appointment_notes,
      is_draft,
      attachments_to_add = [],
      attachments_to_remove = []
    } = req.body;

    // Verificar se o registro existe e se o usuário tem permissão
    const existingRecord = await dbQuery(
      'SELECT * FROM records WHERE id = $1',
      [recordId]
    );

    if (existingRecord.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
      return;
    }

    const record = existingRecord.rows[0];

    // Verificar permissões
    if (req.user?.role === 'therapist' && record.therapist_id !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Sem permissão para editar este registro'
      });
      return;
    }

    // Atualizar o registro
    const updateQuery = `
      UPDATE records SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        assessment_data = COALESCE($3, assessment_data),
        evolution_data = COALESCE($4, evolution_data),
        goals = COALESCE($5, goals),
        interventions = COALESCE($6, interventions),
        mood = COALESCE($7, mood),
        attention_level = COALESCE($8, attention_level),
        cooperation_level = COALESCE($9, cooperation_level),
        family_guidelines = COALESCE($10, family_guidelines),
        homework = COALESCE($11, homework),
        next_steps = COALESCE($12, next_steps),
        next_appointment_notes = COALESCE($13, next_appointment_notes),
        is_draft = COALESCE($14, is_draft),
        version = version + 1,
        updated_at = $15,
        updated_by = $16
      WHERE id = $17
      RETURNING *
    `;

    await dbQuery(updateQuery, [
      title, content,
      assessment_data ? JSON.stringify(assessment_data) : null,
      evolution_data ? JSON.stringify(evolution_data) : null,
      goals ? JSON.stringify(goals) : null,
      interventions ? JSON.stringify(interventions) : null,
      mood, attention_level, cooperation_level,
      family_guidelines, homework, next_steps, next_appointment_notes,
      is_draft, new Date().toISOString(), req.user?.id, recordId
    ]);

    // Processar remoção de anexos
    if (attachments_to_remove.length > 0) {
      for (const attachmentId of attachments_to_remove) {
        await dbQuery(
          'DELETE FROM record_attachments WHERE id = $1 AND record_id = $2',
          [attachmentId, recordId]
        );
      }
    }

    // Processar adição de anexos
    if (attachments_to_add.length > 0) {
      for (const attachment of attachments_to_add) {
        const attachmentId = uuidv4();
        const insertAttachmentQuery = `
          INSERT INTO record_attachments (
            id, record_id, filename, original_filename, file_path,
            file_size, mime_type, attachment_type, title, description, uploaded_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

        await dbQuery(insertAttachmentQuery, [
          attachmentId, recordId, attachment.filename, attachment.original_filename,
          attachment.file_path, attachment.file_size, attachment.mime_type,
          attachment.attachment_type, attachment.title, attachment.description, req.user?.id
        ]);
      }
    }

    res.json({
      success: true,
      message: 'Registro atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir registro (soft delete)
export const deleteRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { recordId } = req.params;

    // Verificar se o registro existe
    const existingRecord = await dbQuery(
      'SELECT * FROM records WHERE id = $1',
      [recordId]
    );

    if (existingRecord.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
      return;
    }

    // Apenas admin pode excluir permanentemente
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Apenas administradores podem excluir registros'
      });
      return;
    }

    // Excluir anexos primeiro
    await dbQuery('DELETE FROM record_attachments WHERE record_id = $1', [recordId]);

    // Excluir registro
    await dbQuery('DELETE FROM records WHERE id = $1', [recordId]);

    res.json({
      success: true,
      message: 'Registro excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar registros de um paciente específico
export const getPatientRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const query = `
      SELECT 
        r.*,
        u.name as therapist_name
      FROM records r
      LEFT JOIN users u ON r.therapist_id = u.id
      WHERE r.patient_id = $1
      ORDER BY r.record_date DESC, r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await dbQuery(query, [patientId, parseInt(limit as string), parseInt(offset as string)]);

    const records = result.rows.map(row => ({
      ...row,
      is_draft: Boolean(row.is_draft),
      assessment_data: row.assessment_data ? JSON.parse(row.assessment_data) : null,
      evolution_data: row.evolution_data ? JSON.parse(row.evolution_data) : null,
      goals: row.goals ? JSON.parse(row.goals) : [],
      interventions: row.interventions ? JSON.parse(row.interventions) : []
    }));

    res.json({
      success: true,
      data: records,
      total: records.length,
      message: 'Registros do paciente recuperados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar registros do paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar templates de registro disponíveis
export const getRecordTemplates = async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 'initial_assessment',
        name: 'Avaliação Inicial',
        description: 'Template para primeira consulta e avaliação',
        fields: ['assessment_data', 'goals', 'next_steps']
      },
      {
        id: 'evolution',
        name: 'Evolução',
        description: 'Template para consultas de acompanhamento',
        fields: ['evolution_data', 'interventions', 'mood', 'attention_level', 'cooperation_level']
      },
      {
        id: 'family_guidance',
        name: 'Orientação Familiar',
        description: 'Template para orientações à família',
        fields: ['family_guidelines', 'homework']
      }
    ];

    res.json({
      success: true,
      data: templates,
      message: 'Templates recuperados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};