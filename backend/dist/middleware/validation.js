"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRateLimit = exports.sanitizeData = exports.validateResourceOwnership = exports.validateUpdateAnamnese = exports.validateCreateAnamnese = exports.validateUpdatePatient = exports.validateCreatePatient = exports.validateChangePassword = exports.validateRegister = exports.validateLogin = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Middleware para processar resultados de validação
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error) => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        return res.status(400).json({
            error: 'Dados inválidos',
            details: formattedErrors
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Validações para autenticação
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email deve ter um formato válido')
        .normalizeEmail()
        .trim(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
        .trim(),
    exports.handleValidationErrors
];
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email deve ter um formato válido')
        .normalizeEmail()
        .trim(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Senha deve ter pelo menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
    (0, express_validator_1.body)('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres')
        .trim()
        .escape(),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'therapist', 'responsible'])
        .withMessage('Role deve ser admin, therapist ou responsible'),
    exports.handleValidationErrors
];
exports.validateChangePassword = [
    (0, express_validator_1.body)('current_password')
        .notEmpty()
        .withMessage('Senha atual é obrigatória'),
    (0, express_validator_1.body)('new_password')
        .isLength({ min: 8 })
        .withMessage('Nova senha deve ter pelo menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Nova senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
    exports.handleValidationErrors
];
// Validações para pacientes
exports.validateCreatePatient = [
    (0, express_validator_1.body)('name')
        .isLength({ min: 2, max: 200 })
        .withMessage('Nome deve ter entre 2 e 200 caracteres')
        .trim()
        .escape(),
    (0, express_validator_1.body)('social_name')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Nome social deve ter no máximo 200 caracteres')
        .trim()
        .escape(),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Email deve ter um formato válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('pt-BR')
        .withMessage('Telefone deve ter um formato brasileiro válido'),
    (0, express_validator_1.body)('birth_date')
        .optional()
        .isISO8601()
        .withMessage('Data de nascimento deve ter formato válido (YYYY-MM-DD)'),
    (0, express_validator_1.body)('cpf')
        .optional()
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .withMessage('CPF deve ter formato válido (XXX.XXX.XXX-XX)'),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['masculino', 'feminino', 'outro', 'prefiro_nao_informar'])
        .withMessage('Gênero deve ser masculino, feminino, outro ou prefiro_nao_informar'),
    (0, express_validator_1.body)('diagnosis')
        .optional()
        .isArray()
        .withMessage('Diagnóstico deve ser uma array'),
    (0, express_validator_1.body)('medications')
        .optional()
        .isArray()
        .withMessage('Medicamentos deve ser uma array'),
    (0, express_validator_1.body)('allergies')
        .optional()
        .isArray()
        .withMessage('Alergias deve ser uma array'),
    (0, express_validator_1.body)('emergency_contacts')
        .optional()
        .isArray()
        .withMessage('Contatos de emergência deve ser uma array'),
    exports.handleValidationErrors
];
exports.validateUpdatePatient = [
    ...exports.validateCreatePatient
];
// Validações para anamneses
exports.validateCreateAnamnese = [
    (0, express_validator_1.body)('titulo')
        .isLength({ min: 3, max: 200 })
        .withMessage('Título deve ter entre 3 e 200 caracteres')
        .trim()
        .escape(),
    (0, express_validator_1.body)('categoria')
        .isIn(['geral', 'psicologica', 'neuropsicologica', 'fonoaudiologica', 'terapia_ocupacional', 'outras'])
        .withMessage('Categoria deve ser válida'),
    (0, express_validator_1.body)('pacienteId')
        .isUUID()
        .withMessage('ID do paciente deve ser um UUID válido'),
    (0, express_validator_1.body)('pacienteNome')
        .isLength({ min: 2, max: 200 })
        .withMessage('Nome do paciente deve ter entre 2 e 200 caracteres')
        .trim()
        .escape(),
    (0, express_validator_1.body)('queixaPrincipal')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Queixa principal deve ter entre 10 e 1000 caracteres')
        .trim(),
    (0, express_validator_1.body)('historiaDoenca')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('História da doença deve ter no máximo 5000 caracteres')
        .trim(),
    (0, express_validator_1.body)('avaliacaoInicial')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('Avaliação inicial deve ter no máximo 5000 caracteres')
        .trim(),
    (0, express_validator_1.body)('objetivos')
        .optional()
        .isArray()
        .withMessage('Objetivos deve ser uma array'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags deve ser uma array'),
    (0, express_validator_1.body)('visibilidade')
        .isIn(['publica', 'privativa'])
        .withMessage('Visibilidade deve ser publica ou privativa'),
    exports.handleValidationErrors
];
exports.validateUpdateAnamnese = [
    ...exports.validateCreateAnamnese
];
// Middleware para validar propriedade de recursos
const validateResourceOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            // Admin tem acesso a tudo
            if (user.role === 'admin') {
                return next();
            }
            // Implementar validação específica por tipo de recurso
            // Por ora, permitir terapeutas acessar seus próprios recursos
            if (user.role === 'therapist') {
                return next();
            }
            return res.status(403).json({
                error: 'Acesso negado a este recurso',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        catch (error) {
            console.error('Erro na validação de propriedade:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    };
};
exports.validateResourceOwnership = validateResourceOwnership;
// Middleware para sanitização de dados
const sanitizeData = (req, res, next) => {
    // Remover campos potencialmente perigosos
    const dangerousFields = ['__proto__', 'constructor', 'prototype'];
    const sanitizeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                if (!dangerousFields.includes(key)) {
                    sanitized[key] = sanitizeObject(value);
                }
            }
            return sanitized;
        }
        return obj;
    };
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    next();
};
exports.sanitizeData = sanitizeData;
// Middleware para rate limiting por usuário
const userRateLimit = (maxRequests, windowMs) => {
    const requests = new Map();
    return (req, res, next) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        const now = Date.now();
        const userRequests = requests.get(userId);
        if (!userRequests || now > userRequests.resetTime) {
            // Nova janela de tempo
            requests.set(userId, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        if (userRequests.count >= maxRequests) {
            return res.status(429).json({
                error: 'Muitas requisições',
                retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
            });
        }
        userRequests.count++;
        next();
    };
};
exports.userRateLimit = userRateLimit;
exports.default = {
    handleValidationErrors: exports.handleValidationErrors,
    validateLogin: exports.validateLogin,
    validateRegister: exports.validateRegister,
    validateChangePassword: exports.validateChangePassword,
    validateCreatePatient: exports.validateCreatePatient,
    validateUpdatePatient: exports.validateUpdatePatient,
    validateCreateAnamnese: exports.validateCreateAnamnese,
    validateUpdateAnamnese: exports.validateUpdateAnamnese,
    validateResourceOwnership: exports.validateResourceOwnership,
    sanitizeData: exports.sanitizeData,
    userRateLimit: exports.userRateLimit
};
//# sourceMappingURL=validation.js.map