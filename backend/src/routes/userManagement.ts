import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { 
  createUser,
  listUsers,
  updateUser,
  resetUserPassword,
  deactivateUser
} from '../controllers/userManagementController';
import { validate } from '../middleware/validate';
import { authenticateToken, requireAdmin, logActivity } from '../middleware/auth';

const router = Router();

// Middleware para todas as rotas - requer autenticação e role admin
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/admin/users - Criar novo usuário
router.post('/',
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username deve ter entre 3 e 50 caracteres')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username pode conter apenas letras, números, _, . e -'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('role')
      .optional()
      .isIn(['admin', 'therapist', 'responsible'])
      .withMessage('Role deve ser: admin, therapist ou responsible'),
    body('phone')
      .optional()
      .isMobilePhone('pt-BR')
      .withMessage('Formato de telefone inválido')
  ],
  validate,
  logActivity('create', 'user'),
  createUser
);

// GET /api/admin/users - Listar usuários
router.get('/',
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
      .isIn(['active', 'inactive'])
      .withMessage('Status inválido para filtro'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Busca deve ter entre 1 e 100 caracteres')
  ],
  validate,
  listUsers
);

// PUT /api/admin/users/:id - Atualizar usuário
router.put('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('role')
      .optional()
      .isIn(['admin', 'therapist', 'responsible'])
      .withMessage('Role deve ser: admin, therapist ou responsible'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status deve ser: active ou inactive'),
    body('phone')
      .optional()
      .isMobilePhone('pt-BR')
      .withMessage('Formato de telefone inválido'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username deve ter entre 3 e 50 caracteres')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username pode conter apenas letras, números, _, . e -')
  ],
  validate,
  logActivity('update', 'user'),
  updateUser
);

// POST /api/admin/users/:id/reset-password - Resetar senha
router.post('/:id/reset-password',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter no mínimo 6 caracteres')
  ],
  validate,
  logActivity('reset_password', 'user'),
  resetUserPassword
);

// DELETE /api/admin/users/:id - Desativar usuário
router.delete('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID deve ser um UUID válido')
  ],
  validate,
  logActivity('deactivate', 'user'),
  deactivateUser
);

export default router;