"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userManagementController_1 = require("../controllers/userManagementController");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Middleware para todas as rotas - requer autenticação e role admin
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// POST /api/admin/users - Criar novo usuário
router.post('/', [
    (0, express_validator_1.body)('username')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username deve ter entre 3 e 50 caracteres')
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage('Username pode conter apenas letras, números, _, . e -'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter no mínimo 6 caracteres'),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'therapist', 'responsible'])
        .withMessage('Role deve ser: admin, therapist ou responsible'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('pt-BR')
        .withMessage('Formato de telefone inválido')
], validate_1.validate, (0, auth_1.logActivity)('create', 'user'), userManagementController_1.createUser);
// GET /api/admin/users - Listar usuários
router.get('/', [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número maior que 0'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser entre 1 e 100'),
    (0, express_validator_1.query)('role')
        .optional()
        .isIn(['admin', 'therapist', 'responsible'])
        .withMessage('Role inválido para filtro'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Status inválido para filtro'),
    (0, express_validator_1.query)('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Busca deve ter entre 1 e 100 caracteres')
], validate_1.validate, userManagementController_1.listUsers);
// PUT /api/admin/users/:id - Atualizar usuário
router.put('/:id', [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('ID deve ser um UUID válido'),
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'therapist', 'responsible'])
        .withMessage('Role deve ser: admin, therapist ou responsible'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'inactive'])
        .withMessage('Status deve ser: active ou inactive'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('pt-BR')
        .withMessage('Formato de telefone inválido'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    (0, express_validator_1.body)('username')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username deve ter entre 3 e 50 caracteres')
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage('Username pode conter apenas letras, números, _, . e -')
], validate_1.validate, (0, auth_1.logActivity)('update', 'user'), userManagementController_1.updateUser);
// POST /api/admin/users/:id/reset-password - Resetar senha
router.post('/:id/reset-password', [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('ID deve ser um UUID válido'),
    (0, express_validator_1.body)('new_password')
        .isLength({ min: 6 })
        .withMessage('Nova senha deve ter no mínimo 6 caracteres')
], validate_1.validate, (0, auth_1.logActivity)('reset_password', 'user'), userManagementController_1.resetUserPassword);
// DELETE /api/admin/users/:id - Desativar usuário
router.delete('/:id', [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('ID deve ser um UUID válido')
], validate_1.validate, (0, auth_1.logActivity)('deactivate', 'user'), userManagementController_1.deactivateUser);
exports.default = router;
//# sourceMappingURL=userManagement.js.map