import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationError } from 'express-validator';
import { AuthRequest } from './auth';

// Middleware para processar resultados de validação
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
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

// Validações para autenticação
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .trim(),
  handleValidationErrors
];

export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim()
    .escape(),
  body('role')
    .optional()
    .isIn(['admin', 'therapist', 'responsible'])
    .withMessage('Role deve ser admin, therapist ou responsible'),
  handleValidationErrors
];

export const validateChangePassword = [
  body('current_password')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
  handleValidationErrors
];

// Validações para pacientes
export const validateCreatePatient = [
  body('name')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome deve ter entre 2 e 200 caracteres')
    .trim()
    .escape(),
  body('social_name')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Nome social deve ter no máximo 200 caracteres')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ter um formato brasileiro válido'),
  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Data de nascimento deve ter formato válido (YYYY-MM-DD)'),
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve ter formato válido (XXX.XXX.XXX-XX)'),
  body('gender')
    .optional()
    .isIn(['masculino', 'feminino', 'outro', 'prefiro_nao_informar'])
    .withMessage('Gênero deve ser masculino, feminino, outro ou prefiro_nao_informar'),
  body('diagnosis')
    .optional()
    .isArray()
    .withMessage('Diagnóstico deve ser uma array'),
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medicamentos deve ser uma array'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Alergias deve ser uma array'),
  body('emergency_contacts')
    .optional()
    .isArray()
    .withMessage('Contatos de emergência deve ser uma array'),
  handleValidationErrors
];

export const validateUpdatePatient = [
  ...validateCreatePatient
];

// Validações para anamneses
export const validateCreateAnamnese = [
  body('titulo')
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres')
    .trim()
    .escape(),
  body('categoria')
    .isIn(['geral', 'psicologica', 'neuropsicologica', 'fonoaudiologica', 'terapia_ocupacional', 'outras'])
    .withMessage('Categoria deve ser válida'),
  body('pacienteId')
    .isUUID()
    .withMessage('ID do paciente deve ser um UUID válido'),
  body('pacienteNome')
    .isLength({ min: 2, max: 200 })
    .withMessage('Nome do paciente deve ter entre 2 e 200 caracteres')
    .trim()
    .escape(),
  body('queixaPrincipal')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Queixa principal deve ter entre 10 e 1000 caracteres')
    .trim(),
  body('historiaDoenca')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('História da doença deve ter no máximo 5000 caracteres')
    .trim(),
  body('avaliacaoInicial')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Avaliação inicial deve ter no máximo 5000 caracteres')
    .trim(),
  body('objetivos')
    .optional()
    .isArray()
    .withMessage('Objetivos deve ser uma array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags deve ser uma array'),
  body('visibilidade')
    .isIn(['publica', 'privativa'])
    .withMessage('Visibilidade deve ser publica ou privativa'),
  handleValidationErrors
];

export const validateUpdateAnamnese = [
  ...validateCreateAnamnese
];

// Middleware para validar propriedade de recursos
export const validateResourceOwnership = (resourceType: 'anamnese' | 'patient' | 'record') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    } catch (error) {
      console.error('Erro na validação de propriedade:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

// Middleware para sanitização de dados
export const sanitizeData = (req: Request, res: Response, next: NextFunction) => {
  // Remover campos potencialmente perigosos
  const dangerousFields = ['__proto__', 'constructor', 'prototype'];
  
  const sanitizeObject = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const sanitized: any = {};
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

// Middleware para rate limiting por usuário
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

export default {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateCreatePatient,
  validateUpdatePatient,
  validateCreateAnamnese,
  validateUpdateAnamnese,
  validateResourceOwnership,
  sanitizeData,
  userRateLimit
};