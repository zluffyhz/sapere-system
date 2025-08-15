"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Configuração do cliente PostgreSQL
const getDbClient = () => {
    return new pg_1.Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
};
// Rota de login
router.post('/login', async (req, res) => {
    const client = getDbClient();
    try {
        // Validar entrada - IMPORTANTE: usar 'email' e 'password'
        const { email, password } = req.body;
        console.log('Tentativa de login:', { email, hasPassword: !!password });
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }
        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de email inválido'
            });
        }
        // Conectar ao banco
        await client.connect();
        // Buscar usuário
        const query = `
      SELECT id, name, email, password, role, is_active
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `;
        const result = await client.query(query, [email]);
        if (result.rows.length === 0) {
            console.log('Usuário não encontrado:', email);
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }
        const user = result.rows[0];
        // Verificar se usuário está ativo
        if (!user.is_active) {
            console.log('Usuário inativo:', email);
            return res.status(401).json({
                error: 'Conta desativada. Entre em contato com o administrador.'
            });
        }
        // Verificar senha
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Senha inválida para:', email);
            return res.status(401).json({
                error: 'Credenciais inválidas'
            });
        }
        // Gerar token JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET não configurado!');
            return res.status(500).json({
                error: 'Erro de configuração do servidor'
            });
        }
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, jwtSecret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
        // Atualizar último login
        await client.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
        console.log('Login bem-sucedido:', email);
        // Retornar resposta de sucesso
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: 'Erro ao processar login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    finally {
        await client.end();
    }
});
// Rota para verificar token (opcional, mas útil)
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Token não fornecido'
            });
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                error: 'Erro de configuração do servidor'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        res.json({
            valid: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name
            }
        });
    }
    catch (error) {
        res.status(401).json({
            valid: false,
            error: 'Token inválido ou expirado'
        });
    }
});
// Rota de teste (remover em produção final)
router.get('/test', (req, res) => {
    res.json({
        message: 'Rota de autenticação funcionando',
        endpoints: {
            login: 'POST /api/auth/login',
            verify: 'GET /api/auth/verify'
        }
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map