import { Router } from 'express';
import { body, query } from 'express-validator';
import { 
  register, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile,
  login
} from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { query as dbQuery } from '../database/config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Validações personalizadas
const validateCPF = (cpf: string): boolean => {
  if (!cpf) return true; // CPF é opcional
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação mais complexa do CPF seria implementada aqui
  return true;
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Telefone é opcional
  
  // Regex para telefones brasileiros
  const phoneRegex = /^\+?55\s?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Rotas públicas
router.post('/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage('Nome deve conter apenas letras e espaços'),
    body('role')
      .optional()
      .isIn(['admin', 'therapist', 'responsible'])
      .withMessage('Role deve ser: admin, therapist ou responsible'),
    body('phone')
      .optional()
      .custom((value) => {
        if (!validatePhone(value)) {
          throw new Error('Formato de telefone inválido. Use: (XX) XXXXX-XXXX');
        }
        return true;
      }),
    body('cpf')
      .optional()
      .custom((value) => {
        if (!validateCPF(value)) {
          throw new Error('CPF inválido');
        }
        return true;
      })
  ],
  validate,
  register
);

// Rota simples para teste
router.post('/login-test', (req, res) => {
  res.json({ message: 'Test endpoint working', body: req.body });
});

// Teste de importações
router.post('/login-debug', async (req, res) => {
  try {
    console.log('Testing imports...');
    console.log('bcrypt available:', typeof bcrypt);
    console.log('jwt available:', typeof jwt);
    console.log('dbQuery available:', typeof dbQuery);
    res.json({ message: 'All imports working' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', login);

// Rotas protegidas
router.post('/refresh', 
  authenticateToken, 
  refreshToken
);

router.post('/logout', 
  authenticateToken, 
  logout
);

router.get('/profile', 
  authenticateToken, 
  getProfile
);

router.put('/profile',
  authenticateToken,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('phone')
      .optional()
      .custom((value) => {
        if (value && !validatePhone(value)) {
          throw new Error('Formato de telefone inválido');
        }
        return true;
      }),
    body('address')
      .optional()
      .isObject()
      .withMessage('Endereço deve ser um objeto'),
    body('address.street')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Rua deve ter entre 1 e 200 caracteres'),
    body('address.city')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Cidade deve ter entre 1 e 100 caracteres'),
    body('address.state')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres'),
    body('address.zip_code')
      .optional()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP deve estar no formato XXXXX-XXX'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('URL do avatar inválida')
  ],
  validate,
  updateProfile
);

router.put('/change-password',
  authenticateToken,
  [
    body('current_password')
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Nova senha deve ter no mínimo 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    body('confirm_password')
      .custom((value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error('Confirmação de senha não confere');
        }
        return true;
      })
  ],
  validate,
  (req, res) => res.status(501).json({ error: 'Change password not implemented yet' })
);

// Rotas administrativas
router.get('/users',
  authenticateToken,
  requireAdmin,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número maior que 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser entre 1 e 100'),
    query('role')
      .optional()
      .isIn(['admin', 'therapist', 'responsible'])
      .withMessage('Role inválido para filtro'),
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'pending'])
      .withMessage('Status inválido para filtro'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Busca deve ter entre 1 e 100 caracteres')
  ],
  validate,
  async (req, res) => {
    // Implementação da listagem de usuários seria adicionada aqui
    res.json({ message: 'Endpoint de listagem de usuários' });
  }
);

// Rota para verificar se token é válido (health check)
router.get('/verify',
  authenticateToken,
  (req: AuthRequest, res) => {
    res.json({ 
      valid: true, 
      user: req.user 
    });
  }
);

export default router;