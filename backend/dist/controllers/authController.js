"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.changePassword = exports.logout = exports.refreshToken = exports.getProfile = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../database/config/database");
const uuid_1 = require("uuid");
console.log('🔑 AuthController carregado com persistência em banco');
const login = async (req, res) => {
    try {
        console.log('🚀 Tentativa de login:', req.body);
        const { email, username, login: loginField, password } = req.body;
        // Aceitar tanto 'email', 'username' ou 'login' como campo de identificação
        const identifier = email || username || loginField;
        if (!identifier || !password) {
            console.log('❌ Login/email ou senha não fornecidos');
            return res.status(400).json({
                error: 'Login/email e senha são obrigatórios'
            });
        }
        // Buscar usuário no banco (email OU username)
        const result = await (0, database_1.query)('SELECT * FROM users WHERE (email = $1 OR username = $1) AND status = $2', [identifier.toLowerCase(), 'active']);
        if (!result.rows || result.rows.length === 0) {
            console.log('❌ Usuário não encontrado:', identifier);
            return res.status(401).json({
                error: 'Login/email ou senha inválidos'
            });
        }
        const user = result.rows[0];
        console.log('✅ Usuário encontrado:', user.name);
        // Verificar senha
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Senha inválida para:', identifier);
            return res.status(401).json({
                error: 'Login/email ou senha inválidos'
            });
        }
        console.log('✅ Senha válida para:', user.name);
        // Atualizar último login
        await (0, database_1.query)('UPDATE users SET last_login_at = $1 WHERE id = $2', [new Date().toISOString(), user.id]);
        // Gerar token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET || 'secret_key_development', { expiresIn: '7d' });
        console.log('✅ Token gerado para:', user.name);
        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status
            }
        });
    }
    catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { email, password, name, role = 'therapist' } = req.body;
        // Verificar se usuário já existe
        const existingResult = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingResult.rows && existingResult.rows.length > 0) {
            return res.status(400).json({
                error: 'Email já está em uso'
            });
        }
        // Hash da senha
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        // Criar usuário no banco
        await (0, database_1.query)('INSERT INTO users (id, email, password, name, role, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [userId, email.toLowerCase(), hashedPassword, name, role, 'active', new Date().toISOString(), new Date().toISOString()]);
        // Gerar token
        const token = jsonwebtoken_1.default.sign({
            userId: userId,
            email: email.toLowerCase(),
            role: role
        }, process.env.JWT_SECRET || 'secret_key_development', { expiresIn: '7d' });
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: userId,
                email: email.toLowerCase(),
                name: name,
                role: role,
                status: 'active'
            }
        });
    }
    catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.register = register;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }
        const result = await (0, database_1.query)('SELECT id, email, name, role, status, phone, cpf, birth_date, address, avatar_url FROM users WHERE id = $1', [req.user.id]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }
        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                phone: user.phone,
                cpf: user.cpf,
                birth_date: user.birth_date,
                address: user.address,
                avatar_url: user.avatar_url
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.getProfile = getProfile;
const refreshToken = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }
        // Gerar novo token
        const token = jsonwebtoken_1.default.sign({
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        }, process.env.JWT_SECRET || 'secret_key_development', { expiresIn: '7d' });
        res.json({
            message: 'Token atualizado com sucesso',
            token,
            user: req.user
        });
    }
    catch (error) {
        console.error('Erro ao atualizar token:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        res.json({
            message: 'Logout realizado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.logout = logout;
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }
        const { current_password, new_password } = req.body;
        // Buscar usuário atual
        const result = await (0, database_1.query)('SELECT password FROM users WHERE id = $1', [req.user.id]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }
        const user = result.rows[0];
        // Verificar senha atual
        const isValidCurrentPassword = await bcryptjs_1.default.compare(current_password, user.password);
        if (!isValidCurrentPassword) {
            return res.status(400).json({
                error: 'Senha atual inválida'
            });
        }
        // Hash da nova senha
        const hashedNewPassword = await bcryptjs_1.default.hash(new_password, 10);
        // Atualizar senha no banco
        await (0, database_1.query)('UPDATE users SET password = $1, updated_at = $2 WHERE id = $3', [hashedNewPassword, new Date().toISOString(), req.user.id]);
        res.json({
            message: 'Senha alterada com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.changePassword = changePassword;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }
        const { name, phone, cpf, birth_date, address } = req.body;
        // Construir query dinamicamente
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (phone) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(phone);
        }
        if (cpf) {
            updates.push(`cpf = $${paramIndex++}`);
            values.push(cpf);
        }
        if (birth_date) {
            updates.push(`birth_date = $${paramIndex++}`);
            values.push(birth_date);
        }
        if (address) {
            updates.push(`address = $${paramIndex++}`);
            values.push(address);
        }
        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Nenhum campo para atualizar'
            });
        }
        updates.push(`updated_at = $${paramIndex++}`);
        values.push(new Date().toISOString());
        values.push(req.user.id);
        // Atualizar no banco
        await (0, database_1.query)(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);
        // Buscar usuário atualizado
        const result = await (0, database_1.query)('SELECT id, email, name, role, status, phone, cpf, birth_date, address FROM users WHERE id = $1', [req.user.id]);
        const updatedUser = result.rows[0];
        res.json({
            message: 'Perfil atualizado com sucesso',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                status: updatedUser.status,
                phone: updatedUser.phone,
                cpf: updatedUser.cpf,
                birth_date: updatedUser.birth_date,
                address: updatedUser.address
            }
        });
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map