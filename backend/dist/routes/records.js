"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const recordController = __importStar(require("../controllers/recordController"));
const router = express_1.default.Router();
// Aplicar autenticação em todas as rotas
router.use(auth_1.authenticateToken);
// Validações
const patientIdValidation = (0, express_validator_1.param)('patientId')
    .isUUID()
    .withMessage('ID do paciente deve ser um UUID válido');
const recordIdValidation = (0, express_validator_1.param)('recordId')
    .isUUID()
    .withMessage('ID do registro deve ser um UUID válido');
const createRecordValidation = [
    (0, express_validator_1.body)('patient_id')
        .isUUID()
        .withMessage('ID do paciente deve ser um UUID válido'),
    (0, express_validator_1.body)('title')
        .isLength({ min: 3, max: 255 })
        .withMessage('Título deve ter entre 3 e 255 caracteres'),
    (0, express_validator_1.body)('content')
        .isLength({ min: 10 })
        .withMessage('Conteúdo deve ter pelo menos 10 caracteres'),
    (0, express_validator_1.body)('record_type')
        .optional()
        .isIn(['initial_assessment', 'evolution', 'discharge', 'intercurrence', 'family_guidance'])
        .withMessage('Tipo de registro inválido'),
    (0, express_validator_1.body)('record_date')
        .optional()
        .isISO8601()
        .withMessage('Data deve estar no formato ISO 8601'),
    (0, express_validator_1.body)('is_draft')
        .optional()
        .isBoolean()
        .withMessage('is_draft deve ser um booleano'),
    (0, express_validator_1.body)('mood')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Humor deve ter no máximo 50 caracteres'),
    (0, express_validator_1.body)('attention_level')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Nível de atenção deve ser entre 1 e 5'),
    (0, express_validator_1.body)('cooperation_level')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Nível de cooperação deve ser entre 1 e 5'),
    (0, express_validator_1.body)('attachments')
        .optional()
        .isArray()
        .withMessage('Anexos deve ser um array'),
    (0, express_validator_1.body)('attachments.*.filename')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Nome do arquivo deve ter entre 1 e 255 caracteres'),
    (0, express_validator_1.body)('attachments.*.file_size')
        .optional()
        .isInt({ min: 1, max: 10485760 }) // 10MB
        .withMessage('Tamanho do arquivo deve ser entre 1 byte e 10MB'),
    (0, express_validator_1.body)('attachments.*.mime_type')
        .optional()
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/)
        .withMessage('Tipo MIME inválido')
];
const updateRecordValidation = [
    (0, express_validator_1.body)('title')
        .optional()
        .isLength({ min: 3, max: 255 })
        .withMessage('Título deve ter entre 3 e 255 caracteres'),
    (0, express_validator_1.body)('content')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Conteúdo deve ter pelo menos 10 caracteres'),
    (0, express_validator_1.body)('is_draft')
        .optional()
        .isBoolean()
        .withMessage('is_draft deve ser um booleano'),
    (0, express_validator_1.body)('mood')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Humor deve ter no máximo 50 caracteres'),
    (0, express_validator_1.body)('attention_level')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Nível de atenção deve ser entre 1 e 5'),
    (0, express_validator_1.body)('cooperation_level')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Nível de cooperação deve ser entre 1 e 5'),
    (0, express_validator_1.body)('attachments_to_add')
        .optional()
        .isArray()
        .withMessage('Anexos para adicionar deve ser um array'),
    (0, express_validator_1.body)('attachments_to_remove')
        .optional()
        .isArray()
        .withMessage('Anexos para remover deve ser um array'),
    (0, express_validator_1.body)('attachments_to_remove.*')
        .optional()
        .isUUID()
        .withMessage('IDs dos anexos para remover devem ser UUIDs válidos')
];
const queryValidation = [
    (0, express_validator_1.query)('specialty')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Especialidade deve ter entre 1 e 100 caracteres'),
    (0, express_validator_1.query)('record_type')
        .optional()
        .isIn(['initial_assessment', 'evolution', 'discharge', 'intercurrence', 'family_guidance'])
        .withMessage('Tipo de registro inválido'),
    (0, express_validator_1.query)('start_date')
        .optional()
        .isISO8601()
        .withMessage('Data inicial deve estar no formato ISO 8601'),
    (0, express_validator_1.query)('end_date')
        .optional()
        .isISO8601()
        .withMessage('Data final deve estar no formato ISO 8601'),
    (0, express_validator_1.query)('therapist_id')
        .optional()
        .isUUID()
        .withMessage('ID do terapeuta deve ser um UUID válido'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['draft', 'completed', 'reviewed'])
        .withMessage('Status inválido'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit deve ser entre 1 e 100'),
    (0, express_validator_1.query)('offset')
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
router.get('/templates', (0, auth_1.requireRole)(['therapist', 'admin']), recordController.getRecordTemplates);
/**
 * @route   GET /api/records/patient/:patientId
 * @desc    Listar todos os registros de um paciente
 * @access  Private (Therapists, Admin)
 */
router.get('/patient/:patientId', (0, auth_1.requireRole)(['therapist', 'admin']), patientIdValidation, queryValidation, validate_1.validateRequest, recordController.getPatientRecords);
/**
 * @route   GET /api/records/:recordId
 * @desc    Buscar registro específico por ID
 * @access  Private (Therapists, Admin)
 */
router.get('/:recordId', (0, auth_1.requireRole)(['therapist', 'admin']), recordIdValidation, validate_1.validateRequest, recordController.getRecordById);
/**
 * @route   GET /api/records
 * @desc    Listar todos os registros
 * @access  Private (Therapists, Admin)
 */
router.get('/', (0, auth_1.requireRole)(['therapist', 'admin']), queryValidation, validate_1.validateRequest, recordController.getRecords);
/**
 * @route   POST /api/records
 * @desc    Criar novo registro médico
 * @access  Private (Therapists, Admin)
 */
router.post('/', (0, auth_1.requireRole)(['therapist', 'admin']), createRecordValidation, validate_1.validateRequest, recordController.createRecord);
/**
 * @route   PUT /api/records/:recordId
 * @desc    Atualizar registro médico existente
 * @access  Private (Therapists, Admin, próprio terapeuta)
 */
router.put('/:recordId', (0, auth_1.requireRole)(['therapist', 'admin']), recordIdValidation, updateRecordValidation, validate_1.validateRequest, recordController.updateRecord);
/**
 * @route   DELETE /api/records/:recordId
 * @desc    Excluir registro médico
 * @access  Private (Admin, próprio terapeuta)
 */
router.delete('/:recordId', (0, auth_1.requireRole)(['admin']), // Apenas admin pode excluir permanentemente
recordIdValidation, validate_1.validateRequest, recordController.deleteRecord);
exports.default = router;
//# sourceMappingURL=records.js.map