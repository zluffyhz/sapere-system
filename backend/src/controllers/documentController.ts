import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';

// Interface para documentos de anamnese
export interface AnamneseDocument {
  id: string;
  patient_id: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  version: number;
  parent_document_id?: string;
  is_latest_version: boolean;
  document_type: string;
  title?: string;
  description?: string;
  tags: string[];
  metadata: any;
  page_count?: number;
  status: string;
  visibility: string;
  uploaded_by: string;
  uploaded_at: Date;
  updated_by?: string;
  updated_at?: Date;
}

// Upload de documento
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const { 
      patient_id, 
      document_type = 'anamnese', 
      title, 
      description, 
      tags = '[]',
      visibility = 'private'
    } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: 'ID do paciente é obrigatório' });
    }

    // Verificar se o paciente existe
    const patientCheck = await query(
      'SELECT id FROM patients WHERE id = $1',
      [patient_id]
    );

    if (!patientCheck.rows || patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    const file = req.file;
    const documentId = uuidv4();
    const storedFilename = `${Date.now()}_${documentId}_${file.originalname}`;
    
    // Definir caminho do arquivo organizado por paciente
    const patientDir = path.join(process.env.UPLOAD_DIR || './uploads', 'anamnese', patient_id);
    const filePath = path.join(patientDir, storedFilename);

    // Criar diretório se não existir
    await fs.ensureDir(patientDir);

    // Mover arquivo para o diretório correto
    await fs.move(file.path, filePath);

    // Parse das tags
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = typeof tags === 'string' ? [tags] : [];
    }

    // Inserir documento no banco
    const result = await query(`
      INSERT INTO anamnese_documents (
        id, patient_id, original_filename, stored_filename, file_path,
        file_size, mime_type, document_type, title, description,
        tags, status, visibility, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      documentId, patient_id, file.originalname, storedFilename, filePath,
      file.size, file.mimetype, document_type, title, description,
      parsedTags, 'active', visibility, req.user.id
    ]);

    const document = result.rows[0];

    console.log('✅ Documento enviado:', file.originalname, 'para paciente:', patient_id);

    return res.status(201).json({
      message: 'Documento enviado com sucesso',
      document: {
        id: document.id,
        original_filename: document.original_filename,
        file_size: document.file_size,
        mime_type: document.mime_type,
        document_type: document.document_type,
        title: document.title,
        description: document.description,
        tags: document.tags,
        version: document.version,
        is_latest_version: document.is_latest_version,
        uploaded_at: document.uploaded_at,
        uploaded_by: document.uploaded_by
      }
    });

  } catch (error) {
    console.error('Erro no upload de documento:', error);
    
    // Limpar arquivo em caso de erro
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Erro ao limpar arquivo:', cleanupError);
      }
    }

    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar documentos por paciente
export const getPatientDocuments = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { patientId } = req.params;
    const { 
      document_type, 
      status = 'active',
      latest_only = 'true',
      page = '1',
      limit = '10'
    } = req.query;

    let whereConditions = ['d.patient_id = $1', 'd.status = $2'];
    let queryParams: any[] = [patientId, status];
    let paramCounter = 2;

    if (document_type) {
      whereConditions.push(`d.document_type = $${++paramCounter}`);
      queryParams.push(document_type);
    }

    if (latest_only === 'true') {
      whereConditions.push('d.is_latest_version = TRUE');
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const result = await query(`
      SELECT 
        d.*,
        u.name as uploaded_by_name,
        p.name as patient_name
      FROM anamnese_documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN patients p ON d.patient_id = p.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY d.uploaded_at DESC
      LIMIT $${++paramCounter} OFFSET $${++paramCounter}
    `, [...queryParams, parseInt(limit as string), offset]);

    // Contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM anamnese_documents d
      WHERE ${whereConditions.join(' AND ')}
    `, queryParams);

    const documents = result.rows.map(doc => ({
      ...doc,
      file_path: undefined, // Não expor caminho interno
    }));

    return res.json({
      documents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar documento por ID
export const getDocumentById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        d.*,
        u.name as uploaded_by_name,
        p.name as patient_name
      FROM anamnese_documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN patients p ON d.patient_id = p.id
      WHERE d.id = $1 AND d.status != 'deleted'
    `, [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const document = result.rows[0];
    
    // Log da ação de visualização
    await query(`
      INSERT INTO anamnese_document_history (
        document_id, action_type, action_description, performed_by
      ) VALUES ($1, $2, $3, $4)
    `, [id, 'view', 'Documento visualizado', req.user?.id]);

    return res.json({
      document: {
        ...document,
        file_path: undefined // Não expor caminho interno
      }
    });

  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Download de documento
export const downloadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT * FROM anamnese_documents 
      WHERE id = $1 AND status = 'active'
    `, [id]);

    if (!result.rows || result.rows.length === 0) {
      res.status(404).json({ error: 'Documento não encontrado' });
      return;
    }

    const document = result.rows[0];
    
    // Verificar se o arquivo existe
    if (!await fs.pathExists(document.file_path)) {
      res.status(404).json({ error: 'Arquivo físico não encontrado' });
      return;
    }

    // Log da ação de download
    await query(`
      INSERT INTO anamnese_document_history (
        document_id, action_type, action_description, performed_by, ip_address
      ) VALUES ($1, $2, $3, $4, $5)
    `, [id, 'download', 'Documento baixado', req.user?.id, req.ip]);

    // Configurar headers para download
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
    res.setHeader('Content-Length', document.file_size);

    // Stream do arquivo
    const fileStream = fs.createReadStream(document.file_path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar metadados do documento
export const updateDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { id } = req.params;
    const { title, description, tags, visibility } = req.body;

    // Verificar se o documento existe
    const checkResult = await query(
      'SELECT id FROM anamnese_documents WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 0;

    if (title !== undefined) {
      updates.push(`title = $${++paramCounter}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${++paramCounter}`);
      values.push(description);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${++paramCounter}`);
      values.push(Array.isArray(tags) ? tags : [tags]);
    }
    if (visibility !== undefined) {
      updates.push(`visibility = $${++paramCounter}`);
      values.push(visibility);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push(`updated_by = $${++paramCounter}`);
    values.push(req.user.id);
    updates.push(`updated_at = $${++paramCounter}`);
    values.push(new Date());

    values.push(id);

    await query(
      `UPDATE anamnese_documents SET ${updates.join(', ')} WHERE id = $${++paramCounter}`,
      values
    );

    return res.json({ message: 'Documento atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova versão do documento
export const createNewVersion = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const { parentId } = req.params;
    const { description } = req.body;

    // Buscar documento pai
    const parentResult = await query(
      'SELECT * FROM anamnese_documents WHERE id = $1 AND status = $2',
      [parentId, 'active']
    );

    if (!parentResult.rows || parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Documento pai não encontrado' });
    }

    const parentDocument = parentResult.rows[0];
    const file = req.file;
    const documentId = uuidv4();
    const newVersion = parentDocument.version + 1;
    const storedFilename = `${Date.now()}_v${newVersion}_${documentId}_${file.originalname}`;
    
    // Usar mesmo diretório do documento pai
    const filePath = path.join(path.dirname(parentDocument.file_path), storedFilename);

    // Mover arquivo
    await fs.move(file.path, filePath);

    // Inserir nova versão
    const result = await query(`
      INSERT INTO anamnese_documents (
        id, patient_id, original_filename, stored_filename, file_path,
        file_size, mime_type, document_type, title, description,
        tags, status, visibility, version, parent_document_id,
        is_latest_version, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      documentId, parentDocument.patient_id, file.originalname, storedFilename, filePath,
      file.size, file.mimetype, parentDocument.document_type, parentDocument.title,
      description || `Nova versão (v${newVersion})`,
      parentDocument.tags, 'active', parentDocument.visibility, newVersion, parentId,
      true, req.user.id
    ]);

    const newDocument = result.rows[0];

    console.log('✅ Nova versão criada:', newVersion, 'para documento:', parentId);

    return res.status(201).json({
      message: 'Nova versão criada com sucesso',
      document: {
        id: newDocument.id,
        original_filename: newDocument.original_filename,
        version: newDocument.version,
        file_size: newDocument.file_size,
        uploaded_at: newDocument.uploaded_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar nova versão:', error);
    
    // Limpar arquivo em caso de erro
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Erro ao limpar arquivo:', cleanupError);
      }
    }

    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar versões do documento
export const getDocumentVersions = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Buscar documento base
    const baseResult = await query(
      'SELECT * FROM anamnese_documents WHERE id = $1',
      [id]
    );

    if (!baseResult.rows || baseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const baseDocument = baseResult.rows[0];
    
    // Buscar todas as versões (incluindo o documento base e suas versões filhas)
    const result = await query(`
      SELECT 
        d.*,
        u.name as uploaded_by_name
      FROM anamnese_documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE (d.id = $1 OR d.parent_document_id = $1 OR 
             (d.parent_document_id = $2 OR d.id = $2))
      AND d.status != 'deleted'
      ORDER BY d.version ASC
    `, [id, baseDocument.parent_document_id || id]);

    const versions = result.rows.map(doc => ({
      ...doc,
      file_path: undefined // Não expor caminho interno
    }));

    return res.json({ versions });

  } catch (error) {
    console.error('Erro ao listar versões:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir documento (soft delete)
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { id } = req.params;
    const { permanent = false } = req.body;

    if (permanent) {
      // Exclusão permanente - remover arquivo físico e registro
      const result = await query(
        'SELECT file_path FROM anamnese_documents WHERE id = $1',
        [id]
      );

      if (result.rows && result.rows.length > 0) {
        const filePath = result.rows[0].file_path;
        
        // Remover arquivo físico
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      }

      // Remover do banco
      await query('DELETE FROM anamnese_documents WHERE id = $1', [id]);
      
      console.log('✅ Documento excluído permanentemente:', id);
    } else {
      // Soft delete
      await query(
        `UPDATE anamnese_documents 
         SET status = 'deleted', updated_by = $1, updated_at = $2 
         WHERE id = $3`,
        [req.user.id, new Date(), id]
      );
      
      console.log('✅ Documento marcado como excluído:', id);
    }

    return res.json({ 
      message: permanent ? 'Documento excluído permanentemente' : 'Documento excluído' 
    });

  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar documentos com filtros
export const searchDocuments = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      search,
      patient_id,
      document_type,
      tags,
      date_from,
      date_to,
      page = '1',
      limit = '10'
    } = req.query;

    let whereConditions = ["d.status = 'active'"];
    let queryParams: any[] = [];
    let paramCounter = 0;

    if (search) {
      whereConditions.push(`(
        d.original_filename ILIKE $${++paramCounter} OR 
        d.title ILIKE $${paramCounter} OR 
        d.description ILIKE $${paramCounter}
      )`);
      queryParams.push(`%${search}%`);
    }

    if (patient_id) {
      whereConditions.push(`d.patient_id = $${++paramCounter}`);
      queryParams.push(patient_id);
    }

    if (document_type) {
      whereConditions.push(`d.document_type = $${++paramCounter}`);
      queryParams.push(document_type);
    }

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      whereConditions.push(`d.tags && $${++paramCounter}::text[]`);
      queryParams.push(tagsArray);
    }

    if (date_from) {
      whereConditions.push(`d.uploaded_at >= $${++paramCounter}`);
      queryParams.push(date_from);
    }

    if (date_to) {
      whereConditions.push(`d.uploaded_at <= $${++paramCounter}`);
      queryParams.push(date_to);
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const result = await query(`
      SELECT 
        d.*,
        u.name as uploaded_by_name,
        p.name as patient_name
      FROM anamnese_documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN patients p ON d.patient_id = p.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY d.uploaded_at DESC
      LIMIT $${++paramCounter} OFFSET $${++paramCounter}
    `, [...queryParams, parseInt(limit as string), offset]);

    // Contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM anamnese_documents d
      WHERE ${whereConditions.join(' AND ')}
    `, queryParams);

    const documents = result.rows.map(doc => ({
      ...doc,
      file_path: undefined
    }));

    return res.json({
      documents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Erro na busca de documentos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter estatísticas de documentos
export const getDocumentStats = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { patient_id } = req.query;

    let whereClause = "WHERE status = 'active'";
    let queryParams: any[] = [];

    if (patient_id) {
      whereClause += " AND patient_id = $1";
      queryParams.push(patient_id);
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(DISTINCT patient_id) as total_patients,
        AVG(file_size) as avg_file_size,
        SUM(file_size) as total_storage_used,
        COUNT(*) FILTER (WHERE document_type = 'anamnese') as anamnese_count,
        COUNT(*) FILTER (WHERE visibility = 'private') as private_count,
        COUNT(*) FILTER (WHERE visibility = 'shared') as shared_count
      FROM anamnese_documents 
      ${whereClause}
    `, queryParams);

    const stats = result.rows[0];

    return res.json({
      stats: {
        total_documents: parseInt(stats.total_documents),
        total_patients: parseInt(stats.total_patients),
        avg_file_size: Math.round(parseFloat(stats.avg_file_size) || 0),
        total_storage_used: parseInt(stats.total_storage_used || 0),
        anamnese_count: parseInt(stats.anamnese_count),
        private_count: parseInt(stats.private_count),
        shared_count: parseInt(stats.shared_count)
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};