"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.auth = exports.canAccessPatient = exports.requireAnyRole = exports.requireTherapistOrAdmin = exports.requireGuardian = exports.requireTherapist = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../database/config/database");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                error: 'Token de acesso requerido',
                code: 'MISSING_TOKEN'
            });
            return;
        }
        // Verificar e decodificar o token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Buscar dados atualizados do usuário
        const result = await (0, database_1.query)(`SELECT id, email, name, role, status, phone, last_login_at 
       FROM users 
       WHERE id = $1 AND status = 'active'`, [decoded.userId]);
        if (result.rows.length === 0) {
            res.status(401).json({
                error: 'Usuário não encontrado ou inativo',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        const user = result.rows[0];
        // Verificar se o role no token ainda é válido
        if (user.role !== decoded.role) {
            res.status(401).json({
                error: 'Permissões alteradas. Faça login novamente.',
                code: 'ROLE_CHANGED'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
            return;
        }
        console.error('Erro na autenticação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'SERVER_ERROR'
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Acesso negado. Roles permitidos: ${allowedRoles.join(', ')}`,
                code: 'INSUFFICIENT_PERMISSIONS',
                required_roles: allowedRoles,
                user_role: req.user.role
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware específicos para roles comuns
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requireTherapist = (0, exports.requireRole)(['therapist']);
exports.requireGuardian = (0, exports.requireRole)(['responsible']); // 'responsible' no DB = 'guardian' no frontend
exports.requireTherapistOrAdmin = (0, exports.requireRole)(['admin', 'therapist']);
exports.requireAnyRole = (0, exports.requireRole)(['admin', 'therapist', 'responsible']);
// Middleware para verificar se o usuário pode acessar dados de um paciente específico
const canAccessPatient = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const patientId = req.params.patientId || req.body.patient_id;
        if (!patientId) {
            return res.status(400).json({ error: 'ID do paciente é obrigatório' });
        }
        // Admin, profissional e therapist têm acesso a todos os pacientes
        if (req.user.role === 'admin' || req.user.role === 'profissional' || req.user.role === 'therapist') {
            return next();
        }
        // Guardian só pode acessar pacientes sob sua responsabilidade
        if (req.user.role === 'responsible') {
            const result = await (0, database_1.query)('SELECT id FROM patients WHERE id = $1 AND responsible_users LIKE $2 AND active = 1', [patientId, `%"${req.user.id}"%`]);
            if (result.rows.length === 0) {
                return res.status(403).json({
                    error: 'Você não tem permissão para acessar este paciente',
                    code: 'PATIENT_ACCESS_DENIED'
                });
            }
        }
        next();
    }
    catch (error) {
        console.error('Erro ao verificar acesso ao paciente:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.canAccessPatient = canAccessPatient;
// Alias para compatibilidade
exports.auth = exports.authenticateToken;
// Middleware para log de atividades
const logActivity = (action, resourceType) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            // Log apenas se a operação foi bem-sucedida (status 2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const resourceId = req.params.id || req.body.id || null;
                // Log assíncrono para não bloquear a resposta
                setImmediate(async () => {
                    try {
                        await (0, database_1.query)(`INSERT INTO activity_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, new_values)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                            req.user?.id || null,
                            action,
                            resourceType,
                            resourceId,
                            req.ip,
                            req.get('User-Agent') || null,
                            req.method === 'GET' ? null : JSON.stringify(req.body)
                        ]);
                    }
                    catch (error) {
                        console.error('Erro ao registrar atividade:', error);
                    }
                });
            }
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.logActivity = logActivity;
//# sourceMappingURL=auth.js.map