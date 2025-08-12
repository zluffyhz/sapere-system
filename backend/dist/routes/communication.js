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
Object.defineProperty(exports, "__esModule", { value: true });
// Rotas do módulo de comunicação - Sistema Sapere
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const communicationController_1 = require("../controllers/communicationController");
const router = (0, express_1.Router)();
// Aplicar autenticação em todas as rotas
router.use(auth_1.authenticateToken);
/**
 * @route   POST /api/communication/send
 * @desc    Enviar mensagem para paciente
 * @access  Private (Therapists, Admin)
 */
router.post('/send', auth_1.requireTherapistOrAdmin, [
    (0, express_validator_1.body)('patient_id')
        .notEmpty()
        .withMessage('ID do paciente é obrigatório')
        .isUUID()
        .withMessage('ID do paciente deve ser um UUID válido'),
    (0, express_validator_1.body)('type')
        .isIn(['whatsapp', 'email', 'sms'])
        .withMessage('Tipo deve ser whatsapp, email ou sms'),
    (0, express_validator_1.body)('template_type')
        .optional()
        .isIn([
        'appointment_confirmation',
        'appointment_reminder_24h',
        'appointment_reminder_2h',
        'appointment_cancelled',
        'appointment_rescheduled',
        'welcome_message',
        'therapy_report',
        'newsletter',
        'follow_up',
        'custom'
    ])
        .withMessage('Template inválido'),
    (0, express_validator_1.body)('variables')
        .optional()
        .isObject()
        .withMessage('Variáveis devem ser um objeto'),
    (0, express_validator_1.body)('custom_message')
        .optional()
        .isLength({ min: 1, max: 4096 })
        .withMessage('Mensagem deve ter entre 1 e 4096 caracteres'),
    (0, express_validator_1.body)('scheduled_for')
        .optional()
        .isISO8601()
        .withMessage('Data de agendamento deve estar no formato ISO 8601')
], validate_1.validateRequest, communicationController_1.communicationController.sendMessage);
/**
 * @route   POST /api/communication/whatsapp/webhook
 * @desc    Webhook do WhatsApp Business API
 * @access  Public (verificado por token)
 */
router.post('/whatsapp/webhook', communicationController_1.communicationController.whatsappWebhook);
router.get('/whatsapp/webhook', communicationController_1.communicationController.whatsappWebhook);
/**
 * @route   GET /api/communication/patient/:patientId
 * @desc    Listar comunicações de um paciente
 * @access  Private (Therapists, Admin)
 */
router.get('/patient/:patientId', auth_1.requireTherapistOrAdmin, [
    (0, express_validator_1.param)('patientId')
        .isUUID()
        .withMessage('ID do paciente deve ser um UUID válido'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit deve ser entre 1 e 100'),
    (0, express_validator_1.query)('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset deve ser maior ou igual a 0')
], validate_1.validateRequest, communicationController_1.communicationController.getPatientCommunications);
/**
 * @route   GET /api/communication/stats
 * @desc    Obter estatísticas de comunicação
 * @access  Private (Therapists, Admin)
 */
router.get('/stats', auth_1.requireTherapistOrAdmin, [
    (0, express_validator_1.query)('start_date')
        .optional()
        .isISO8601()
        .withMessage('Data inicial deve estar no formato ISO 8601'),
    (0, express_validator_1.query)('end_date')
        .optional()
        .isISO8601()
        .withMessage('Data final deve estar no formato ISO 8601'),
    (0, express_validator_1.query)('type')
        .optional()
        .isIn(['whatsapp', 'email', 'sms'])
        .withMessage('Tipo deve ser whatsapp, email ou sms')
], validate_1.validateRequest, communicationController_1.communicationController.getCommunicationStats);
/**
 * @route   POST /api/communication/consent/:patientId
 * @desc    Gerenciar consentimento do paciente
 * @access  Private (Therapists, Admin)
 */
router.post('/consent/:patientId', auth_1.requireTherapistOrAdmin, [
    (0, express_validator_1.param)('patientId')
        .isUUID()
        .withMessage('ID do paciente deve ser um UUID válido'),
    (0, express_validator_1.body)('type')
        .isIn(['whatsapp', 'email', 'sms', 'call'])
        .withMessage('Tipo deve ser whatsapp, email, sms ou call'),
    (0, express_validator_1.body)('consent_given')
        .isBoolean()
        .withMessage('Consentimento deve ser true ou false'),
    (0, express_validator_1.body)('source')
        .optional()
        .isIn(['web', 'whatsapp', 'phone', 'in_person'])
        .withMessage('Fonte deve ser web, whatsapp, phone ou in_person'),
    (0, express_validator_1.body)('ip_address')
        .optional()
        .isIP()
        .withMessage('Endereço IP inválido')
], validate_1.validateRequest, communicationController_1.communicationController.manageConsent);
/**
 * @route   GET /api/communication/templates
 * @desc    Listar templates de comunicação
 * @access  Private (Therapists, Admin)
 */
router.get('/templates', auth_1.requireTherapistOrAdmin, [
    (0, express_validator_1.query)('type')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Tipo não pode estar vazio'),
    (0, express_validator_1.query)('channel')
        .optional()
        .isIn(['whatsapp', 'email', 'sms'])
        .withMessage('Canal deve ser whatsapp, email ou sms')
], validate_1.validateRequest, communicationController_1.communicationController.getTemplates);
/**
 * @route   POST /api/communication/templates
 * @desc    Criar novo template de comunicação
 * @access  Private (Admin)
 */
router.post('/templates', auth_1.requireAdmin, [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Nome é obrigatório')
        .isLength({ min: 3, max: 255 })
        .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    (0, express_validator_1.body)('type')
        .notEmpty()
        .withMessage('Tipo é obrigatório'),
    (0, express_validator_1.body)('channel')
        .isIn(['whatsapp', 'email', 'sms'])
        .withMessage('Canal deve ser whatsapp, email ou sms'),
    (0, express_validator_1.body)('content')
        .notEmpty()
        .withMessage('Conteúdo é obrigatório')
        .isLength({ min: 1, max: 4096 })
        .withMessage('Conteúdo deve ter entre 1 e 4096 caracteres'),
    (0, express_validator_1.body)('subject')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Assunto deve ter no máximo 255 caracteres'),
    (0, express_validator_1.body)('variables')
        .optional()
        .isArray()
        .withMessage('Variáveis devem ser um array'),
    (0, express_validator_1.body)('whatsapp_template_name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Nome do template WhatsApp deve ter no máximo 100 caracteres')
], validate_1.validateRequest, communicationController_1.communicationController.createTemplate);
/**
 * @route   PUT /api/communication/templates/:templateId
 * @desc    Atualizar template de comunicação
 * @access  Private (Admin)
 */
router.put('/templates/:templateId', auth_1.requireAdmin, [
    (0, express_validator_1.param)('templateId')
        .isUUID()
        .withMessage('ID do template deve ser um UUID válido'),
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 3, max: 255 })
        .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    (0, express_validator_1.body)('content')
        .optional()
        .isLength({ min: 1, max: 4096 })
        .withMessage('Conteúdo deve ter entre 1 e 4096 caracteres'),
    (0, express_validator_1.body)('subject')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Assunto deve ter no máximo 255 caracteres'),
    (0, express_validator_1.body)('variables')
        .optional()
        .isArray()
        .withMessage('Variáveis devem ser um array'),
    (0, express_validator_1.body)('active')
        .optional()
        .isBoolean()
        .withMessage('Ativo deve ser true ou false')
], validate_1.validateRequest, communicationController_1.communicationController.updateTemplate);
/**
 * @route   POST /api/communication/test/:type
 * @desc    Testar configurações de comunicação
 * @access  Private (Admin)
 */
router.post('/test/:type', auth_1.requireAdmin, [
    (0, express_validator_1.param)('type')
        .isIn(['whatsapp', 'email', 'all'])
        .withMessage('Tipo deve ser whatsapp, email ou all')
], validate_1.validateRequest, communicationController_1.communicationController.testConfiguration);
/**
 * @route   POST /api/communication/process-scheduled
 * @desc    Processar mensagens agendadas (para cron jobs)
 * @access  Private (Admin)
 */
router.post('/process-scheduled', auth_1.requireAdmin, communicationController_1.communicationController.processScheduledMessages);
/**
 * @route   GET /api/communication/dashboard
 * @desc    Dashboard de comunicações com estatísticas gerais
 * @access  Private (Therapists, Admin)
 */
router.get('/dashboard', auth_1.requireTherapistOrAdmin, async (req, res) => {
    try {
        // Estatísticas dos últimos 30 dias
        const endDate = new Date();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // Importar query do módulo de database
        const { query } = await Promise.resolve().then(() => __importStar(require('../database/config/database')));
        // Buscar dados recentes
        const recentCommunications = await query(`
        SELECT 
          c.id, c.type, c.status, c.message, c.created_at,
          p.name as patient_name
        FROM communications c
        JOIN patients p ON c.patient_id = p.id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);
        // Contagem por status
        const statusCount = await query(`
        SELECT status, COUNT(*) as count
        FROM communications
        WHERE created_at >= $1
        GROUP BY status
        ORDER BY count DESC
      `, [startDate]);
        // Templates mais usados
        const topTemplates = await query(`
        SELECT 
          ct.name, ct.type, ct.channel, ct.usage_count
        FROM communication_templates ct
        WHERE ct.active = true
        ORDER BY ct.usage_count DESC
        LIMIT 5
      `);
        res.json({
            success: true,
            data: {
                recent_communications: recentCommunications.rows,
                status_distribution: statusCount.rows,
                top_templates: topTemplates.rows,
                period: {
                    start: startDate,
                    end: endDate
                }
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
exports.default = router;
//# sourceMappingURL=communication.js.map