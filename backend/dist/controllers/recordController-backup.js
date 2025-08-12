"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordController = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database/config/database");
exports.recordController = {
    // Listar registros de um paciente
    async getPatientRecords(req, res) {
        try {
            const { patientId } = req.params;
            const { specialty, record_type, start_date, end_date, therapist_id, status, limit = '50', offset = '0' } = req.query;
            let query = `
        SELECT 
          r.*,
          u.name as therapist_name,
          t.specialties,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ra.id,
                'filename', ra.filename,
                'original_filename', ra.original_filename,
                'file_size', ra.file_size,
                'mime_type', ra.mime_type,
                'attachment_type', ra.attachment_type,
                'title', ra.title,
                'description', ra.description,
                'uploaded_by', ra.uploaded_by,
                'created_at', ra.created_at
              )
            ) FILTER (WHERE ra.id IS NOT NULL), 
            '[]'
          ) as attachments
        FROM records r
        JOIN users u ON r.therapist_id = u.id
        LEFT JOIN therapists t ON r.therapist_id = t.user_id
        LEFT JOIN record_attachments ra ON r.id = ra.record_id
        WHERE r.patient_id = $1
      `;
            const queryParams = [patientId];
            let paramCount = 1;
            if (specialty) {
                paramCount++;
                query += ` AND $${paramCount} = ANY(t.specialties)`;
                queryParams.push(specialty);
            }
            if (record_type) {
                paramCount++;
                query += ` AND r.record_type = $${paramCount}`;
                queryParams.push(record_type);
            }
            if (start_date) {
                paramCount++;
                query += ` AND r.record_date >= $${paramCount}`;
                queryParams.push(start_date);
            }
            if (end_date) {
                paramCount++;
                query += ` AND r.record_date <= $${paramCount}`;
                queryParams.push(end_date);
            }
            if (therapist_id) {
                paramCount++;
                query += ` AND r.therapist_id = $${paramCount}`;
                queryParams.push(therapist_id);
            }
            if (status === 'draft') {
                query += ` AND r.is_draft = true`;
            }
            else if (status === 'completed') {
                query += ` AND r.is_draft = false`;
            }
            query += `
        GROUP BY r.id, u.name, t.specialties
        ORDER BY r.record_date DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
            queryParams.push(parseInt(limit), parseInt(offset));
            const result = await (0, database_1.query)(query, queryParams);
            // Processar os dados para o formato esperado pelo frontend
            const records = result.rows.map(row => ({
                id: row.id,
                patient_id: row.patient_id,
                session_date: row.record_date,
                therapist_id: row.therapist_id,
                therapist_name: row.therapist_name,
                specialty: row.specialties?.[0] || 'Geral',
                session_type: row.title,
                template_id: row.assessment_data?.template_id,
                duration_minutes: 60, // Valor padrão, pode ser configurável
                content: {
                    evolution: row.content,
                    structured_data: row.evolution_data || {},
                    behavioral_observations: row.assessment_data?.behavioral_observations || [],
                    milestones_achieved: row.assessment_data?.milestones || [],
                    next_session_plan: row.next_steps || '',
                    family_guidance: row.family_guidelines || ''
                },
                attachments: row.attachments.filter((att) => att.id !== null),
                assessments: row.assessment_data?.assessments || [],
                goals: row.goals || [],
                digital_signature: row.assessment_data?.digital_signature || null,
                shared_with: [],
                created_at: row.created_at,
                updated_at: row.updated_at,
                is_template: false,
                tags: row.assessment_data?.tags || [],
                status: row.is_draft ? 'draft' : (row.reviewed_at ? 'reviewed' : 'completed')
            }));
            res.json({
                success: true,
                data: records,
                total: result.rows.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar registros:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    },
    // Buscar registro específico
    async getRecord(req, res) {
        try {
            const { recordId } = req.params;
            const query = `
        SELECT 
          r.*,
          u.name as therapist_name,
          t.specialties,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ra.id,
                'filename', ra.filename,
                'original_filename', ra.original_filename,
                'file_size', ra.file_size,
                'mime_type', ra.mime_type,
                'attachment_type', ra.attachment_type,
                'title', ra.title,
                'description', ra.description,
                'uploaded_by', ra.uploaded_by,
                'created_at', ra.created_at
              )
            ) FILTER (WHERE ra.id IS NOT NULL), 
            '[]'
          ) as attachments
        FROM records r
        JOIN users u ON r.therapist_id = u.id
        LEFT JOIN therapists t ON r.therapist_id = t.user_id
        LEFT JOIN record_attachments ra ON r.id = ra.record_id
        WHERE r.id = $1
        GROUP BY r.id, u.name, t.specialties
      `;
            const result = await (0, database_1.query)(query, [recordId]);
            if (result.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Registro não encontrado'
                });
                return;
            }
            const row = result.rows[0];
            const record = {
                id: row.id,
                patient_id: row.patient_id,
                session_date: row.record_date,
                therapist_id: row.therapist_id,
                therapist_name: row.therapist_name,
                specialty: row.specialties?.[0] || 'Geral',
                session_type: row.title,
                template_id: row.assessment_data?.template_id,
                duration_minutes: 60,
                content: {
                    evolution: row.content,
                    structured_data: row.evolution_data || {},
                    behavioral_observations: row.assessment_data?.behavioral_observations || [],
                    milestones_achieved: row.assessment_data?.milestones || [],
                    next_session_plan: row.next_steps || '',
                    family_guidance: row.family_guidelines || ''
                },
                attachments: row.attachments.filter((att) => att.id !== null),
                assessments: row.assessment_data?.assessments || [],
                goals: row.goals || [],
                digital_signature: row.assessment_data?.digital_signature || null,
                shared_with: [],
                created_at: row.created_at,
                updated_at: row.updated_at,
                is_template: false,
                tags: row.assessment_data?.tags || [],
                status: row.is_draft ? 'draft' : (row.reviewed_at ? 'reviewed' : 'completed')
            };
            res.json({
                success: true,
                data: record
            });
        }
        catch (error) {
            console.error('Erro ao buscar registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    },
    // Criar novo registro
    async createRecord(req, res) {
        // SQLite não precisa de client
        try {
            await client.query('BEGIN');
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
                return;
            }
            const { patient_id, appointment_id, record_type = 'evolution', title, content, assessment_data, evolution_data, goals, interventions, mood, attention_level, cooperation_level, family_guidelines, homework, next_steps, next_appointment_notes, is_draft = false, record_date, attachments = [] } = req.body;
            const recordId = (0, uuid_1.v4)();
            // Inserir o registro principal
            const insertRecordQuery = `
        INSERT INTO records (
          id, patient_id, therapist_id, appointment_id, record_type, title, content,
          assessment_data, evolution_data, goals, interventions, mood, attention_level,
          cooperation_level, family_guidelines, homework, next_steps, next_appointment_notes,
          version, is_draft, record_date, created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 1,
          $19, $20, $21, $21, NOW(), NOW()
        ) RETURNING *
      `;
            const recordResult = await client.query(insertRecordQuery, [
                recordId, patient_id, userId, appointment_id, record_type, title, content,
                JSON.stringify(assessment_data), JSON.stringify(evolution_data), JSON.stringify(goals),
                interventions, mood, attention_level, cooperation_level, family_guidelines, homework,
                next_steps, next_appointment_notes, is_draft, record_date || new Date(), userId
            ]);
            // Inserir anexos se existirem
            if (attachments && attachments.length > 0) {
                for (const attachment of attachments) {
                    const attachmentId = (0, uuid_1.v4)();
                    const insertAttachmentQuery = `
            INSERT INTO record_attachments (
              id, record_id, filename, original_filename, file_path, file_size,
              mime_type, attachment_type, title, description, uploaded_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          `;
                    await client.query(insertAttachmentQuery, [
                        attachmentId, recordId, attachment.filename, attachment.original_filename,
                        attachment.file_path, attachment.file_size, attachment.mime_type,
                        attachment.attachment_type, attachment.title, attachment.description, userId
                    ]);
                }
            }
            await client.query('COMMIT');
            // Buscar o registro criado com todos os dados
            const createdRecord = await (0, database_1.query)(`
        SELECT 
          r.*,
          u.name as therapist_name,
          t.specialties
        FROM records r
        JOIN users u ON r.therapist_id = u.id
        LEFT JOIN therapists t ON r.therapist_id = t.user_id
        WHERE r.id = $1
      `, [recordId]);
            res.status(201).json({
                success: true,
                message: 'Registro criado com sucesso',
                data: createdRecord.rows[0]
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao criar registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
        finally {
            client.release();
        }
    },
    // Atualizar registro
    async updateRecord(req, res) {
        // SQLite não precisa de client
        try {
            await client.query('BEGIN');
            const userId = req.user?.id;
            const { recordId } = req.params;
            // Verificar se o registro existe e se o usuário tem permissão
            const existingRecord = await client.query('SELECT * FROM records WHERE id = $1', [recordId]);
            if (existingRecord.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Registro não encontrado'
                });
                return;
            }
            const { title, content, assessment_data, evolution_data, goals, interventions, mood, attention_level, cooperation_level, family_guidelines, homework, next_steps, next_appointment_notes, is_draft, attachments_to_add = [], attachments_to_remove = [] } = req.body;
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
          updated_by = $15,
          updated_at = NOW()
        WHERE id = $16
        RETURNING *
      `;
            await client.query(updateQuery, [
                title, content, JSON.stringify(assessment_data), JSON.stringify(evolution_data),
                JSON.stringify(goals), interventions, mood, attention_level, cooperation_level,
                family_guidelines, homework, next_steps, next_appointment_notes, is_draft,
                userId, recordId
            ]);
            // Remover anexos
            if (attachments_to_remove.length > 0) {
                await client.query('DELETE FROM record_attachments WHERE id = ANY($1)', [attachments_to_remove]);
            }
            // Adicionar novos anexos
            for (const attachment of attachments_to_add) {
                const attachmentId = (0, uuid_1.v4)();
                const insertAttachmentQuery = `
          INSERT INTO record_attachments (
            id, record_id, filename, original_filename, file_path, file_size,
            mime_type, attachment_type, title, description, uploaded_by, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        `;
                await client.query(insertAttachmentQuery, [
                    attachmentId, recordId, attachment.filename, attachment.original_filename,
                    attachment.file_path, attachment.file_size, attachment.mime_type,
                    attachment.attachment_type, attachment.title, attachment.description, userId
                ]);
            }
            await client.query('COMMIT');
            res.json({
                success: true,
                message: 'Registro atualizado com sucesso'
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao atualizar registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
        finally {
            client.release();
        }
    },
    // Excluir registro
    async deleteRecord(req, res) {
        // SQLite não precisa de client
        try {
            await client.query('BEGIN');
            const { recordId } = req.params;
            const userId = req.user?.id;
            // Verificar se o registro existe
            const existingRecord = await client.query('SELECT * FROM records WHERE id = $1', [recordId]);
            if (existingRecord.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Registro não encontrado'
                });
                return;
            }
            // Excluir anexos primeiro
            await client.query('DELETE FROM record_attachments WHERE record_id = $1', [recordId]);
            // Excluir o registro
            await client.query('DELETE FROM records WHERE id = $1', [recordId]);
            await client.query('COMMIT');
            res.json({
                success: true,
                message: 'Registro excluído com sucesso'
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao excluir registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
        finally {
            client.release();
        }
    },
    // Buscar templates de registro
    async getRecordTemplates(req, res) {
        try {
            const { category, specialty } = req.query;
            // Por enquanto, retornar templates hardcoded
            // Em produção, estes viriam do banco de dados
            const templates = [
                {
                    id: 'tea-aba',
                    name: 'TEA - Análise do Comportamento (ABA)',
                    category: 'TEA',
                    specialty: 'ABA',
                    fields: [
                        { id: 'target_behaviors', name: 'target_behaviors', label: 'Comportamentos Alvo', type: 'textarea', required: true, order: 1 },
                        { id: 'prompts_used', name: 'prompts_used', label: 'Prompts Utilizados', type: 'multiselect', required: true, order: 2, options: ['Físico', 'Gestual', 'Verbal', 'Visual', 'Posicional'] },
                        { id: 'reinforcement', name: 'reinforcement', label: 'Reforçadores', type: 'textarea', required: true, order: 3 },
                        { id: 'data_collection', name: 'data_collection', label: 'Coleta de Dados', type: 'textarea', required: true, order: 4 }
                    ],
                    behavioral_categories: ['Comunicação', 'Interação Social', 'Comportamento Repetitivo', 'Adaptação', 'Autorregulação'],
                    assessment_scales: ['CARS-2', 'ABC', 'VB-MAPP', 'ABLLS-R'],
                    common_goals: [
                        'Aumentar tempo de atenção compartilhada',
                        'Desenvolver comunicação funcional',
                        'Reduzir comportamentos disruptivos'
                    ]
                },
                {
                    id: 'tea-to',
                    name: 'TEA - Terapia Ocupacional',
                    category: 'TEA',
                    specialty: 'Terapia Ocupacional',
                    fields: [
                        { id: 'sensory_profile', name: 'sensory_profile', label: 'Perfil Sensorial', type: 'textarea', required: true, order: 1 },
                        { id: 'sensory_activities', name: 'sensory_activities', label: 'Atividades Sensoriais', type: 'textarea', required: true, order: 2 },
                        { id: 'motor_skills', name: 'motor_skills', label: 'Habilidades Motoras', type: 'textarea', required: true, order: 3 }
                    ],
                    behavioral_categories: ['Processamento Sensorial', 'Coordenação Motora', 'AVDs', 'Regulação Emocional'],
                    assessment_scales: ['SPM-2', 'SIPT', 'BOT-2', 'WeeFIM'],
                    common_goals: [
                        'Melhorar processamento sensorial',
                        'Desenvolver coordenação motora fina',
                        'Aumentar independência em AVDs'
                    ]
                }
            ];
            let filteredTemplates = templates;
            if (category) {
                filteredTemplates = filteredTemplates.filter(t => t.category === category);
            }
            if (specialty) {
                filteredTemplates = filteredTemplates.filter(t => t.specialty === specialty);
            }
            res.json({
                success: true,
                data: filteredTemplates
            });
        }
        catch (error) {
            console.error('Erro ao buscar templates:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
};
exports.default = exports.recordController;
//# sourceMappingURL=recordController-backup.js.map