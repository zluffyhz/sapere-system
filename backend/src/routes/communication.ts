// Rotas do módulo de comunicação - Sistema Sapere
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { 
  authenticateToken, 
  requireTherapistOrAdmin, 
  requireAdmin, 
  AuthRequest 
} from '../middleware/auth';
import { communicationController } from '../controllers/communicationController';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @route   POST /api/communication/send
 * @desc    Enviar mensagem para paciente
 * @access  Private (Therapists, Admin)
 */
router.post('/send',
  requireTherapistOrAdmin,
  [
    body('patient_id')
      .notEmpty()
      .withMessage('ID do paciente é obrigatório')
      .isUUID()
      .withMessage('ID do paciente deve ser um UUID válido'),
    body('type')
      .isIn(['whatsapp', 'email', 'sms'])
      .withMessage('Tipo deve ser whatsapp, email ou sms'),
    body('template_type')
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
    body('variables')
      .optional()
      .isObject()
      .withMessage('Variáveis devem ser um objeto'),
    body('custom_message')
      .optional()
      .isLength({ min: 1, max: 4096 })
      .withMessage('Mensagem deve ter entre 1 e 4096 caracteres'),
    body('scheduled_for')
      .optional()
      .isISO8601()
      .withMessage('Data de agendamento deve estar no formato ISO 8601')
  ],
  validateRequest,
  communicationController.sendMessage
);

/**
 * @route   POST /api/communication/whatsapp/webhook
 * @desc    Webhook do WhatsApp Business API
 * @access  Public (verificado por token)
 */
router.post('/whatsapp/webhook', communicationController.whatsappWebhook);
router.get('/whatsapp/webhook', communicationController.whatsappWebhook);

/**
 * @route   GET /api/communication/patient/:patientId
 * @desc    Listar comunicações de um paciente
 * @access  Private (Therapists, Admin)
 */
router.get('/patient/:patientId',
  requireTherapistOrAdmin,
  [
    param('patientId')
      .isUUID()
      .withMessage('ID do paciente deve ser um UUID válido'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit deve ser entre 1 e 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset deve ser maior ou igual a 0')
  ],
  validateRequest,
  communicationController.getPatientCommunications
);

/**
 * @route   GET /api/communication/stats
 * @desc    Obter estatísticas de comunicação
 * @access  Private (Therapists, Admin)
 */
router.get('/stats',
  requireTherapistOrAdmin,
  [
    query('start_date')
      .optional()
      .isISO8601()
      .withMessage('Data inicial deve estar no formato ISO 8601'),
    query('end_date')
      .optional()
      .isISO8601()
      .withMessage('Data final deve estar no formato ISO 8601'),
    query('type')
      .optional()
      .isIn(['whatsapp', 'email', 'sms'])
      .withMessage('Tipo deve ser whatsapp, email ou sms')
  ],
  validateRequest,
  communicationController.getCommunicationStats
);

/**
 * @route   POST /api/communication/consent/:patientId
 * @desc    Gerenciar consentimento do paciente
 * @access  Private (Therapists, Admin)
 */
router.post('/consent/:patientId',
  requireTherapistOrAdmin,
  [
    param('patientId')
      .isUUID()
      .withMessage('ID do paciente deve ser um UUID válido'),
    body('type')
      .isIn(['whatsapp', 'email', 'sms', 'call'])
      .withMessage('Tipo deve ser whatsapp, email, sms ou call'),
    body('consent_given')
      .isBoolean()
      .withMessage('Consentimento deve ser true ou false'),
    body('source')
      .optional()
      .isIn(['web', 'whatsapp', 'phone', 'in_person'])
      .withMessage('Fonte deve ser web, whatsapp, phone ou in_person'),
    body('ip_address')
      .optional()
      .isIP()
      .withMessage('Endereço IP inválido')
  ],
  validateRequest,
  communicationController.manageConsent
);

/**
 * @route   GET /api/communication/templates
 * @desc    Listar templates de comunicação
 * @access  Private (Therapists, Admin)
 */
router.get('/templates',
  requireTherapistOrAdmin,
  [
    query('type')
      .optional()
      .isLength({ min: 1 })
      .withMessage('Tipo não pode estar vazio'),
    query('channel')
      .optional()
      .isIn(['whatsapp', 'email', 'sms'])
      .withMessage('Canal deve ser whatsapp, email ou sms')
  ],
  validateRequest,
  communicationController.getTemplates
);

/**
 * @route   POST /api/communication/templates
 * @desc    Criar novo template de comunicação
 * @access  Private (Admin)
 */
router.post('/templates',
  requireAdmin,
  [
    body('name')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('type')
      .notEmpty()
      .withMessage('Tipo é obrigatório'),
    body('channel')
      .isIn(['whatsapp', 'email', 'sms'])
      .withMessage('Canal deve ser whatsapp, email ou sms'),
    body('content')
      .notEmpty()
      .withMessage('Conteúdo é obrigatório')
      .isLength({ min: 1, max: 4096 })
      .withMessage('Conteúdo deve ter entre 1 e 4096 caracteres'),
    body('subject')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Assunto deve ter no máximo 255 caracteres'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variáveis devem ser um array'),
    body('whatsapp_template_name')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Nome do template WhatsApp deve ter no máximo 100 caracteres')
  ],
  validateRequest,
  communicationController.createTemplate
);

/**
 * @route   PUT /api/communication/templates/:templateId
 * @desc    Atualizar template de comunicação
 * @access  Private (Admin)
 */
router.put('/templates/:templateId',
  requireAdmin,
  [
    param('templateId')
      .isUUID()
      .withMessage('ID do template deve ser um UUID válido'),
    body('name')
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('content')
      .optional()
      .isLength({ min: 1, max: 4096 })
      .withMessage('Conteúdo deve ter entre 1 e 4096 caracteres'),
    body('subject')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Assunto deve ter no máximo 255 caracteres'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variáveis devem ser um array'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser true ou false')
  ],
  validateRequest,
  communicationController.updateTemplate
);

/**
 * @route   POST /api/communication/test/:type
 * @desc    Testar configurações de comunicação
 * @access  Private (Admin)
 */
router.post('/test/:type',
  requireAdmin,
  [
    param('type')
      .isIn(['whatsapp', 'email', 'all'])
      .withMessage('Tipo deve ser whatsapp, email ou all')
  ],
  validateRequest,
  communicationController.testConfiguration
);

/**
 * @route   POST /api/communication/process-scheduled
 * @desc    Processar mensagens agendadas (para cron jobs)
 * @access  Private (Admin)
 */
router.post('/process-scheduled',
  requireAdmin,
  communicationController.processScheduledMessages
);

/**
 * @route   GET /api/communication/dashboard
 * @desc    Dashboard de comunicações com estatísticas gerais
 * @access  Private (Therapists, Admin)
 */
router.get('/dashboard',
  requireTherapistOrAdmin,
  async (req: AuthRequest, res) => {
    try {
      // Estatísticas dos últimos 30 dias
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Importar query do módulo de database
      const { query } = await import('../database/config/database');
      
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
    } catch (error: any) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

export default router;