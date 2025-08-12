"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.deleteAnamnese = exports.updateAnamnese = exports.getAnamnese = exports.listAnamneses = exports.createAnamnese = void 0;
const database_1 = require("../database/config/database");
const uuid_1 = require("uuid");
const syncService_1 = __importDefault(require("../services/syncService"));
// Criar anamnese
const createAnamnese = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const { titulo, categoria, pacienteId, pacienteNome, pacienteIdade, queixaPrincipal, historiaDoenca, avaliacaoInicial, objetivos, planoterapeutico, tags, visibilidade, observacoes } = req.body;
        const anamneseId = (0, uuid_1.v4)();
        const currentTime = new Date().toISOString();
        // Inserir anamnese
        await (0, database_1.query)(`
      INSERT INTO records (
        id, patient_id, therapist_id, record_type, title, content,
        assessment_data, goals, interventions, is_draft, record_date,
        created_at, updated_at, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            anamneseId,
            pacienteId,
            req.user.id,
            'anamnese',
            titulo,
            JSON.stringify({
                categoria,
                pacienteNome,
                pacienteIdade,
                queixaPrincipal,
                historiaDoenca,
                avaliacaoInicial,
                tags,
                visibilidade,
                observacoes
            }),
            JSON.stringify({ avaliacaoInicial }),
            JSON.stringify(objetivos),
            JSON.stringify({ planoterapeutico }),
            0,
            currentTime,
            currentTime,
            currentTime,
            req.user.id,
            req.user.id
        ]);
        // Buscar anamnese criada
        const result = await (0, database_1.query)(`
      SELECT r.*, u.name as criador_nome
      FROM records r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `, [anamneseId]);
        const createdAnamnese = result.rows[0];
        // Notificar criação via WebSocket
        syncService_1.default.notifyDataChange('anamnese', 'create', createdAnamnese, req.user.id);
        res.status(201).json({
            message: 'Anamnese criada com sucesso',
            anamnese: createdAnamnese
        });
    }
    catch (error) {
        console.error('Erro ao criar anamnese:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createAnamnese = createAnamnese;
// Listar anamneses
const listAnamneses = async (req, res) => {
    try {
        const { search, categoria, visibilidade, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = "WHERE r.record_type = 'anamnese'";
        const params = [];
        if (search) {
            whereClause += " AND (r.title LIKE ? OR r.content LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        if (categoria) {
            whereClause += " AND JSON_EXTRACT(r.content, '$.categoria') = ?";
            params.push(categoria);
        }
        if (visibilidade) {
            whereClause += " AND JSON_EXTRACT(r.content, '$.visibilidade') = ?";
            params.push(visibilidade);
        }
        // Buscar anamneses
        const result = await (0, database_1.query)(`
      SELECT 
        r.*,
        u.name as criador_nome,
        p.name as paciente_nome
      FROM records r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN patients p ON r.patient_id = p.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);
        // Contar total
        const countResult = await (0, database_1.query)(`
      SELECT COUNT(*) as total
      FROM records r
      ${whereClause}
    `, params);
        const anamneses = result.rows.map((row) => ({
            id: row.id,
            titulo: row.title,
            categoria: JSON.parse(row.content || '{}').categoria,
            pacienteId: row.patient_id,
            pacienteNome: JSON.parse(row.content || '{}').pacienteNome || row.paciente_nome,
            pacienteIdade: JSON.parse(row.content || '{}').pacienteIdade,
            queixaPrincipal: JSON.parse(row.content || '{}').queixaPrincipal,
            historiaDoenca: JSON.parse(row.content || '{}').historiaDoenca,
            avaliacaoInicial: JSON.parse(row.content || '{}').avaliacaoInicial,
            objetivos: JSON.parse(row.goals || '[]'),
            planoterapeutico: JSON.parse(row.interventions || '{}').planoterapeutico,
            tags: JSON.parse(row.content || '{}').tags || [],
            visibilidade: JSON.parse(row.content || '{}').visibilidade,
            observacoes: JSON.parse(row.content || '{}').observacoes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criadoPor: row.created_by,
            criador: { name: row.criador_nome },
            isFavorito: false, // Implementar sistema de favoritos posteriormente
            comentarios: [] // Implementar sistema de comentários posteriormente
        }));
        res.json({
            anamneses,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: countResult.rows[0].total,
                totalPages: Math.ceil(countResult.rows[0].total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar anamneses:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.listAnamneses = listAnamneses;
// Buscar anamnese por ID
const getAnamnese = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`
      SELECT 
        r.*,
        u.name as criador_nome,
        p.name as paciente_nome
      FROM records r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN patients p ON r.patient_id = p.id
      WHERE r.id = ? AND r.record_type = 'anamnese'
    `, [id]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: 'Anamnese não encontrada' });
        }
        const row = result.rows[0];
        const anamnese = {
            id: row.id,
            titulo: row.title,
            categoria: JSON.parse(row.content || '{}').categoria,
            pacienteId: row.patient_id,
            pacienteNome: JSON.parse(row.content || '{}').pacienteNome || row.paciente_nome,
            pacienteIdade: JSON.parse(row.content || '{}').pacienteIdade,
            queixaPrincipal: JSON.parse(row.content || '{}').queixaPrincipal,
            historiaDoenca: JSON.parse(row.content || '{}').historiaDoenca,
            avaliacaoInicial: JSON.parse(row.content || '{}').avaliacaoInicial,
            objetivos: JSON.parse(row.goals || '[]'),
            planoterapeutico: JSON.parse(row.interventions || '{}').planoterapeutico,
            tags: JSON.parse(row.content || '{}').tags || [],
            visibilidade: JSON.parse(row.content || '{}').visibilidade,
            observacoes: JSON.parse(row.content || '{}').observacoes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            criadoPor: row.created_by,
            criador: { name: row.criador_nome },
            isFavorito: false,
            comentarios: []
        };
        res.json({ anamnese });
    }
    catch (error) {
        console.error('Erro ao buscar anamnese:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getAnamnese = getAnamnese;
// Atualizar anamnese
const updateAnamnese = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const { id } = req.params;
        const { titulo, categoria, pacienteId, pacienteNome, pacienteIdade, queixaPrincipal, historiaDoenca, avaliacaoInicial, objetivos, planoterapeutico, tags, visibilidade, observacoes } = req.body;
        // Verificar se existe
        const checkResult = await (0, database_1.query)('SELECT id FROM records WHERE id = ? AND record_type = ?', [id, 'anamnese']);
        if (!checkResult.rows || checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Anamnese não encontrada' });
        }
        const currentTime = new Date().toISOString();
        // Atualizar anamnese
        await (0, database_1.query)(`
      UPDATE records SET
        patient_id = ?, title = ?, content = ?,
        assessment_data = ?, goals = ?, interventions = ?,
        updated_at = ?, updated_by = ?
      WHERE id = ?
    `, [
            pacienteId,
            titulo,
            JSON.stringify({
                categoria,
                pacienteNome,
                pacienteIdade,
                queixaPrincipal,
                historiaDoenca,
                avaliacaoInicial,
                tags,
                visibilidade,
                observacoes
            }),
            JSON.stringify({ avaliacaoInicial }),
            JSON.stringify(objetivos),
            JSON.stringify({ planoterapeutico }),
            currentTime,
            req.user.id,
            id
        ]);
        // Notificar atualização via WebSocket
        syncService_1.default.notifyDataChange('anamnese', 'update', { id, ...req.body }, req.user.id);
        res.json({ message: 'Anamnese atualizada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao atualizar anamnese:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateAnamnese = updateAnamnese;
// Excluir anamnese
const deleteAnamnese = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const { id } = req.params;
        // Verificar se existe
        const checkResult = await (0, database_1.query)('SELECT id FROM records WHERE id = ? AND record_type = ?', [id, 'anamnese']);
        if (!checkResult.rows || checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Anamnese não encontrada' });
        }
        // Excluir anamnese
        await (0, database_1.query)('DELETE FROM records WHERE id = ?', [id]);
        // Notificar exclusão via WebSocket
        syncService_1.default.notifyDataChange('anamnese', 'delete', { id }, req.user.id);
        res.json({ message: 'Anamnese excluída com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir anamnese:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deleteAnamnese = deleteAnamnese;
// Obter estatísticas
const getStats = async (req, res) => {
    try {
        const totalResult = await (0, database_1.query)("SELECT COUNT(*) as total FROM records WHERE record_type = 'anamnese'");
        const publicasResult = await (0, database_1.query)("SELECT COUNT(*) as total FROM records WHERE record_type = 'anamnese' AND JSON_EXTRACT(content, '$.visibilidade') = 'publica'");
        const privativasResult = await (0, database_1.query)("SELECT COUNT(*) as total FROM records WHERE record_type = 'anamnese' AND JSON_EXTRACT(content, '$.visibilidade') = 'privativa'");
        const favoritasResult = await (0, database_1.query)("SELECT COUNT(*) as total FROM records WHERE record_type = 'anamnese'"); // Implementar favoritas posteriormente
        res.json({
            total: totalResult.rows[0].total,
            publicas: publicasResult.rows[0].total,
            privativas: privativasResult.rows[0].total,
            favoritas: 0 // Implementar posteriormente
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=anamneseController.js.map