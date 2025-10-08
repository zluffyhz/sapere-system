import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

// Listar todas as especialidades
export const listSpecialties = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { category, active = 'true' } = req.query;

    let whereConditions = [];
    const queryParams: any[] = [];

    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (active === 'true') {
      whereConditions.push('active = ?');
      queryParams.push(true);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const result = await query(`
      SELECT 
        s.*,
        COUNT(ts.therapist_id) as therapist_count
      FROM specialties s
      LEFT JOIN therapist_specialties ts ON s.id = ts.specialty_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.category, s.name
    `, queryParams);

    res.json({
      specialties: result.rows || []
    });

  } catch (error) {
    console.error('Erro ao listar especialidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova especialidade
export const createSpecialty = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem criar especialidades' 
      });
    }

    const { name, description, category, icon, color } = req.body;

    if (!name || !category) {
      return res.status(400).json({ 
        error: 'Nome e categoria são obrigatórios' 
      });
    }

    // Verificar se já existe
    const existingSpecialty = await query(
      'SELECT id FROM specialties WHERE name = ?',
      [name]
    );

    if (existingSpecialty.rows && existingSpecialty.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Especialidade já existe' 
      });
    }

    const specialtyId = uuidv4();

    const result = await query(`
      INSERT INTO specialties (id, name, description, category, icon, color)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `, [specialtyId, name, description, category, icon, color]);

    console.log('✅ Especialidade criada:', name, 'por', req.user.name);

    res.status(201).json({
      message: 'Especialidade criada com sucesso',
      specialty: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar especialidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar especialidade
export const updateSpecialty = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem atualizar especialidades' 
      });
    }

    const { specialtyId } = req.params;
    const { name, description, category, icon, color, active } = req.body;

    // Verificar se existe
    const existingSpecialty = await query(
      'SELECT id FROM specialties WHERE id = ?',
      [specialtyId]
    );

    if (!existingSpecialty.rows || existingSpecialty.rows.length === 0) {
      return res.status(404).json({ error: 'Especialidade não encontrada' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      values.push(active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(specialtyId);

    await query(
      `UPDATE specialties SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    console.log('✅ Especialidade atualizada:', specialtyId, 'por', req.user.name);

    res.json({ message: 'Especialidade atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar especialidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar especialidade
export const deleteSpecialty = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem deletar especialidades' 
      });
    }

    const { specialtyId } = req.params;

    // Verificar se tem terapeutas associados
    const therapistCount = await query(
      'SELECT COUNT(*) as count FROM therapist_specialties WHERE specialty_id = ?',
      [specialtyId]
    );

    if (therapistCount.rows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar especialidade com terapeutas associados' 
      });
    }

    await query('DELETE FROM specialties WHERE id = ?', [specialtyId]);

    console.log('✅ Especialidade deletada:', specialtyId, 'por', req.user.name);

    res.json({ message: 'Especialidade deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar especialidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Associar especialidade a terapeuta
export const assignSpecialtyToTherapist = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem associar especialidades' 
      });
    }

    const { therapistId, specialtyId } = req.params;
    const { 
      experience_level = 1, 
      certified = false, 
      certification_date, 
      certification_body 
    } = req.body;

    // Verificar se já existe associação
    const existingAssociation = await query(
      'SELECT * FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapistId, specialtyId]
    );

    if (existingAssociation.rows && existingAssociation.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Associação já existe' 
      });
    }

    await query(`
      INSERT INTO therapist_specialties 
      (therapist_id, specialty_id, experience_level, certified, certification_date, certification_body)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [therapistId, specialtyId, experience_level, certified, certification_date, certification_body]);

    console.log('✅ Especialidade associada:', specialtyId, 'ao terapeuta:', therapistId);

    res.status(201).json({ 
      message: 'Especialidade associada ao terapeuta com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao associar especialidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Remover associação de especialidade
export const removeSpecialtyFromTherapist = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem remover associações' 
      });
    }

    const { therapistId, specialtyId } = req.params;

    await query(
      'DELETE FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapistId, specialtyId]
    );

    console.log('✅ Especialidade removida:', specialtyId, 'do terapeuta:', therapistId);

    res.json({ 
      message: 'Especialidade removida do terapeuta com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao remover especialidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar especialidades de um terapeuta
export const getTherapistSpecialties = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { therapistId } = req.params;

    const result = await query(`
      SELECT 
        s.*,
        ts.experience_level,
        ts.certified,
        ts.certification_date,
        ts.certification_body,
        ts.created_at as association_date
      FROM specialties s
      JOIN therapist_specialties ts ON s.id = ts.specialty_id
      WHERE ts.therapist_id = ?
      ORDER BY s.category, s.name
    `, [therapistId]);

    res.json({
      therapist_id: therapistId,
      specialties: result.rows || []
    });

  } catch (error) {
    console.error('Erro ao buscar especialidades do terapeuta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar terapeutas por especialidade
export const getTherapistsBySpecialty = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { specialtyId } = req.params;
    const { min_experience_level = '1' } = req.query;

    const result = await query(`
      SELECT 
        t.*,
        u.name, u.email, u.phone,
        ts.experience_level,
        ts.certified,
        ts.certification_date
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      JOIN therapist_specialties ts ON t.id = ts.therapist_id
      WHERE ts.specialty_id = ? 
        AND ts.experience_level >= ?
        AND t.active = true
        AND u.status = 'active'
      ORDER BY ts.experience_level DESC, u.name
    `, [specialtyId, parseInt(min_experience_level as string)]);

    res.json({
      specialty_id: specialtyId,
      therapists: result.rows || []
    });

  } catch (error) {
    console.error('Erro ao buscar terapeutas por especialidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};