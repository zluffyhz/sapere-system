import express from 'express';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { authenticateToken, requireRole } from '../middleware/auth';
import * as recordController from '../controllers/recordController';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const patientIdValidation = param('patientId')
  .isUUID()
  .withMessage('ID do paciente deve ser um UUID válido');

const recordIdValidation = param('recordId')
  .isUUID()
  .withMessage('ID do registro deve ser um UUID válido');

const createRecordValidation = [
  body('patient_id')
    .isUUID()
    .withMessage('ID do paciente deve ser um UUID válido'),
  
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('content')
    .isLength({ min: 10 })
    .withMessage('Conteúdo deve ter pelo menos 10 caracteres'),
  
  body('record_type')
    .optional()
    .isIn(['initial_assessment', 'evolution', 'discharge', 'intercurrence', 'family_guidance'])
    .withMessage('Tipo de registro inválido'),
  
  body('record_date')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601'),
  
  body('is_draft')
    .optional()
    .isBoolean()
    .withMessage('is_draft deve ser um booleano'),
  
  body('mood')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Humor deve ter no máximo 50 caracteres'),
  
  body('attention_level')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nível de atenção deve ser entre 1 e 5'),
  
  body('cooperation_level')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nível de cooperação deve ser entre 1 e 5'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Anexos deve ser um array'),
  
  body('attachments.*.filename')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome do arquivo deve ter entre 1 e 255 caracteres'),
  
  body('attachments.*.file_size')
    .optional()
    .isInt({ min: 1, max: 10485760 }) // 10MB
    .withMessage('Tamanho do arquivo deve ser entre 1 byte e 10MB'),
  
  body('attachments.*.mime_type')
    .optional()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/)
    .withMessage('Tipo MIME inválido')
];

const updateRecordValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Conteúdo deve ter pelo menos 10 caracteres'),
  
  body('is_draft')
    .optional()
    .isBoolean()
    .withMessage('is_draft deve ser um booleano'),
  
  body('mood')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Humor deve ter no máximo 50 caracteres'),
  
  body('attention_level')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nível de atenção deve ser entre 1 e 5'),
  
  body('cooperation_level')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nível de cooperação deve ser entre 1 e 5'),
  
  body('attachments_to_add')
    .optional()
    .isArray()
    .withMessage('Anexos para adicionar deve ser um array'),
  
  body('attachments_to_remove')
    .optional()
    .isArray()
    .withMessage('Anexos para remover deve ser um array'),
  
  body('attachments_to_remove.*')
    .optional()
    .isUUID()
    .withMessage('IDs dos anexos para remover devem ser UUIDs válidos')
];

const queryValidation = [
  query('specialty')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Especialidade deve ter entre 1 e 100 caracteres'),
  
  query('record_type')
    .optional()
    .isIn(['initial_assessment', 'evolution', 'discharge', 'intercurrence', 'family_guidance'])
    .withMessage('Tipo de registro inválido'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve estar no formato ISO 8601'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Data final deve estar no formato ISO 8601'),
  
  query('therapist_id')
    .optional()
    .isUUID()
    .withMessage('ID do terapeuta deve ser um UUID válido'),
  
  query('status')
    .optional()
    .isIn(['draft', 'completed', 'reviewed'])
    .withMessage('Status inválido'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve ser entre 1 e 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser maior ou igual a 0')
];

// ROTAS

/**
 * @route   GET /api/records/templates
 * @desc    Listar templates de registro disponíveis
 * @access  Private (Therapists)
 */
router.get('/templates', 
  requireRole(['therapist', 'admin']),
  recordController.getRecordTemplates
);

/**
 * @route   GET /api/records/patient/:patientId
 * @desc    Listar todos os registros de um paciente
 * @access  Private (Therapists, Admin)
 */
router.get('/patient/:patientId',
  requireRole(['therapist', 'admin']),
  patientIdValidation,
  queryValidation,
  validateRequest,
  recordController.getPatientRecords
);

/**
 * @route   GET /api/records/:recordId
 * @desc    Buscar registro específico por ID
 * @access  Private (Therapists, Admin)
 */
router.get('/:recordId',
  requireRole(['therapist', 'admin']),
  recordIdValidation,
  validateRequest,
  recordController.getRecordById
);

/**
 * @route   GET /api/records
 * @desc    Listar todos os registros
 * @access  Private (Therapists, Admin)
 */
router.get('/',
  requireRole(['therapist', 'admin']),
  queryValidation,
  validateRequest,
  recordController.getRecords
);

/**
 * @route   POST /api/records
 * @desc    Criar novo registro médico
 * @access  Private (Therapists, Admin)
 */
router.post('/',
  requireRole(['therapist', 'admin']),
  createRecordValidation,
  validateRequest,
  recordController.createRecord
);

/**
 * @route   PUT /api/records/:recordId
 * @desc    Atualizar registro médico existente
 * @access  Private (Therapists, Admin, próprio terapeuta)
 */
router.put('/:recordId',
  requireRole(['therapist', 'admin']),
  recordIdValidation,
  updateRecordValidation,
  validateRequest,
  recordController.updateRecord
);

/**
 * @route   DELETE /api/records/:recordId
 * @desc    Excluir registro médico
 * @access  Private (Admin, próprio terapeuta)
 */
router.delete('/:recordId',
  requireRole(['admin']), // Apenas admin pode excluir permanentemente
  recordIdValidation,
  validateRequest,
  recordController.deleteRecord
);

export default router;