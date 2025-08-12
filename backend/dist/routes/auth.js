"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authControllerFixed_1 = require("../controllers/authControllerFixed");
const authControllerFixed_2 = require("../controllers/authControllerFixed");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const database_1 = require("../database/config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Validações personalizadas
const validateCPF = (cpf) => {
    if (!cpf)
        return true; // CPF é opcional
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11)
        return false;
    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cleanCPF))
        return false;
    // Validação mais complexa do CPF seria implementada aqui
    return true;
};
const validatePhone = (phone) => {
    if (!phone)
        return true; // Telefone é opcional
    // Regex para telefones brasileiros
    const phoneRegex = /^\+?55\s?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
// Rotas públicas
router.post('/register', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Senha deve ter no mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Nome deve conter apenas letras e espaços'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'therapist', 'responsible'])
        .withMessage('Role deve ser: admin, therapist ou responsible'),
    (0, express_validator_1.body)('phone')
        .optional()
        .custom((value) => {
        if (!validatePhone(value)) {
            throw new Error('Formato de telefone inválido. Use: (XX) XXXXX-XXXX');
        }
        return true;
    }),
    (0, express_validator_1.body)('cpf')
        .optional()
        .custom((value) => {
        if (!validateCPF(value)) {
            throw new Error('CPF inválido');
        }
        return true;
    })
], validate_1.validate, authControllerFixed_1.register);
// Rota simples para teste
router.post('/login-test', (req, res) => {
    res.json({ message: 'Test endpoint working', body: req.body });
});
// Teste de importações
router.post('/login-debug', async (req, res) => {
    try {
        console.log('Testing imports...');
        console.log('bcrypt available:', typeof bcryptjs_1.default);
        console.log('jwt available:', typeof jsonwebtoken_1.default);
        console.log('dbQuery available:', typeof database_1.query);
        res.json({ message: 'All imports working' });
    }
    catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/login', authControllerFixed_2.login);
// Rotas protegidas
router.post('/refresh', auth_1.authenticateToken, authControllerFixed_1.refreshToken);
router.post('/logout', auth_1.authenticateToken, authControllerFixed_1.logout);
router.get('/profile', auth_1.authenticateToken, authControllerFixed_1.getProfile);
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    (0, express_validator_1.body)('phone')
        .optional()
        .custom((value) => {
        if (value && !validatePhone(value)) {
            throw new Error('Formato de telefone inválido');
        }
        return true;
    }),
    (0, express_validator_1.body)('address')
        .optional()
        .isObject()
        .withMessage('Endereço deve ser um objeto'),
    (0, express_validator_1.body)('address.street')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Rua deve ter entre 1 e 200 caracteres'),
    (0, express_validator_1.body)('address.city')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Cidade deve ter entre 1 e 100 caracteres'),
    (0, express_validator_1.body)('address.state')
        .optional()
        .isLength({ min: 2, max: 2 })
        .withMessage('Estado deve ter 2 caracteres'),
    (0, express_validator_1.body)('address.zip_code')
        .optional()
        .matches(/^\d{5}-?\d{3}$/)
        .withMessage('CEP deve estar no formato XXXXX-XXX'),
    (0, express_validator_1.body)('avatar_url')
        .optional()
        .isURL()
        .withMessage('URL do avatar inválida')
], validate_1.validate, authControllerFixed_1.updateProfile);
router.put('/change-password', auth_1.authenticateToken, [
    (0, express_validator_1.body)('current_password')
        .notEmpty()
        .withMessage('Senha atual é obrigatória'),
    (0, express_validator_1.body)('new_password')
        .isLength({ min: 8 })
        .withMessage('Nova senha deve ter no mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    (0, express_validator_1.body)('confirm_password')
        .custom((value, { req }) => {
        if (value !== req.body.new_password) {
            throw new Error('Confirmação de senha não confere');
        }
        return true;
    })
], validate_1.validate, (req, res) => res.status(501).json({ error: 'Change password not implemented yet' }));
// Rotas administrativas
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, [
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
        .isIn(['active', 'inactive', 'pending'])
        .withMessage('Status inválido para filtro'),
    (0, express_validator_1.query)('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Busca deve ter entre 1 e 100 caracteres')
], validate_1.validate, async (req, res) => {
    // Implementação da listagem de usuários seria adicionada aqui
    res.json({ message: 'Endpoint de listagem de usuários' });
});
// Rota para verificar se token é válido (health check)
router.get('/verify', auth_1.authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map