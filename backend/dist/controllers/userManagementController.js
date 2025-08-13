"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUser = exports.resetUserPassword = exports.updateUser = exports.listUsers = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../database/config/database");
const uuid_1 = require("uuid");
console.log('👥 UserManagementController carregado - Gerenciamento de usuários por admins');
const createUser = async (req, res) => {
    try {
        console.log('🆕 Admin criando novo usuário:', req.body);
        const { username, email, password, name, role = 'therapist', phone } = req.body;
        // Validações básicas
        if (!username && !email) {
            return res.status(400).json({
                error: 'Username ou email é obrigatório'
            });
        }
        if (!password) {
            return res.status(400).json({
                error: 'Senha é obrigatória'
            });
        }
        if (!name) {
            return res.status(400).json({
                error: 'Nome é obrigatório'
            });
        }
        if (!['admin', 'therapist', 'responsible'].includes(role)) {
            return res.status(400).json({
                error: 'Role inválido. Use: admin, therapist ou responsible'
            });
        }
        // Verificar se username ou email já existem
        let checkQuery = '';
        let checkParams = [];
        if (username && email) {
            checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
            checkParams = [username.toLowerCase(), email.toLowerCase()];
        }
        else if (username) {
            checkQuery = 'SELECT id FROM users WHERE username = $1';
            checkParams = [username.toLowerCase()];
        }
        else {
            checkQuery = 'SELECT id FROM users WHERE email = $1';
            checkParams = [email.toLowerCase()];
        }
        const existingResult = await (0, database_1.query)(checkQuery, checkParams);
        if (existingResult.rows && existingResult.rows.length > 0) {
            return res.status(400).json({
                error: 'Username ou email já está em uso'
            });
        }
        // Hash da senha
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        // Criar usuário no banco
        await (0, database_1.query)(`INSERT INTO users (id, username, email, password, name, role, status, phone, created_at, updated_at, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
            userId,
            username?.toLowerCase() || null,
            email?.toLowerCase() || null,
            hashedPassword,
            name,
            role,
            'active',
            phone || null,
            new Date().toISOString(),
            new Date().toISOString(),
            req.user.id
        ]);
        console.log(`✅ Usuário criado por admin: ${name} (${username || email})`);
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: userId,
                username: username?.toLowerCase() || null,
                email: email?.toLowerCase() || null,
                name: name,
                role: role,
                status: 'active',
                phone: phone || null,
                created_by: req.user.id
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.createUser = createUser;
const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        if (role) {
            whereClause += ` AND role = $${paramIndex++}`;
            params.push(role);
        }
        if (status) {
            whereClause += ` AND status = $${paramIndex++}`;
            params.push(status);
        }
        if (search) {
            whereClause += ` AND (name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++} OR username ILIKE $${paramIndex++})`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const result = await (0, database_1.query)(`SELECT id, username, email, name, role, status, phone, created_at, updated_at, created_by
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, [...params, Number(limit), offset]);
        // Contar total
        const countResult = await (0, database_1.query)(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
        const total = Number(countResult.rows[0].total);
        const totalPages = Math.ceil(total / Number(limit));
        res.json({
            users: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.listUsers = listUsers;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, status, phone, email, username } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID do usuário é obrigatório' });
        }
        // Verificar se usuário existe
        const userResult = await (0, database_1.query)('SELECT id FROM users WHERE id = $1', [id]);
        if (!userResult.rows || userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        // Construir query de atualização dinamicamente
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (role && ['admin', 'therapist', 'responsible'].includes(role)) {
            updates.push(`role = $${paramIndex++}`);
            values.push(role);
        }
        if (status && ['active', 'inactive'].includes(status)) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(phone || null);
        }
        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(email?.toLowerCase() || null);
        }
        if (username !== undefined) {
            updates.push(`username = $${paramIndex++}`);
            values.push(username?.toLowerCase() || null);
        }
        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Nenhum campo para atualizar'
            });
        }
        updates.push(`updated_at = $${paramIndex++}`);
        values.push(new Date().toISOString());
        values.push(`updated_by = $${paramIndex++}`);
        values.push(req.user.id);
        values.push(id);
        // Atualizar no banco
        await (0, database_1.query)(`UPDATE users SET ${updates.join(', ')}, updated_by = $${paramIndex - 1} WHERE id = $${paramIndex}`, values);
        res.json({
            message: 'Usuário atualizado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.updateUser = updateUser;
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID do usuário é obrigatório' });
        }
        if (!new_password) {
            return res.status(400).json({ error: 'Nova senha é obrigatória' });
        }
        // Verificar se usuário existe
        const userResult = await (0, database_1.query)('SELECT id, name FROM users WHERE id = $1', [id]);
        if (!userResult.rows || userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        // Hash da nova senha
        const hashedPassword = await bcryptjs_1.default.hash(new_password, 10);
        // Atualizar senha no banco
        await (0, database_1.query)('UPDATE users SET password = $1, updated_at = $2, updated_by = $3 WHERE id = $4', [hashedPassword, new Date().toISOString(), req.user.id, id]);
        console.log(`🔑 Admin resetou senha do usuário: ${userResult.rows[0].name}`);
        res.json({
            message: 'Senha resetada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao resetar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.resetUserPassword = resetUserPassword;
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'ID do usuário é obrigatório' });
        }
        // Verificar se usuário existe
        const userResult = await (0, database_1.query)('SELECT id, name FROM users WHERE id = $1', [id]);
        if (!userResult.rows || userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        // Não permitir que admin desative a si mesmo
        if (id === req.user.id) {
            return res.status(400).json({
                error: 'Você não pode desativar sua própria conta'
            });
        }
        // Desativar usuário
        await (0, database_1.query)('UPDATE users SET status = $1, updated_at = $2, updated_by = $3 WHERE id = $4', ['inactive', new Date().toISOString(), req.user.id, id]);
        console.log(`🚫 Admin desativou usuário: ${userResult.rows[0].name}`);
        res.json({
            message: 'Usuário desativado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao desativar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.deactivateUser = deactivateUser;
//# sourceMappingURL=userManagementController.js.map