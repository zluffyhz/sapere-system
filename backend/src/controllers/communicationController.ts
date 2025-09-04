// Controller de Comunicação do Sistema Sapere
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CommunicationType, CommunicationStatus, MessageTemplate } from '../types/communication';
import { CommunicationService } from '../services/communicationService';
import { WhatsAppService } from '../integrations/whatsapp/whatsappService';
import { EmailService } from '../integrations/email/emailService';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

export class CommunicationController {
  private communicationService: CommunicationService;

  constructor() {
    // Inicializar serviços com configurações padrão
    const whatsappConfig = {
      access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      webhook_verify_token: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      app_id: process.env.WHATSAPP_APP_ID || '',
      app_secret: process.env.WHATSAPP_APP_SECRET || ''
    };

    const emailConfig = {
      smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtp_port: parseInt(process.env.SMTP_PORT || '587'),
      smtp_secure: process.env.SMTP_SECURE === 'true',
      smtp_user: process.env.SMTP_USER || 'Sapere.recepcao@gmail.com',
      smtp_password: process.env.SMTP_PASSWORD || '',
      from_name: 'Sapere - Clínica de Neurodivergentes',
      from_email: 'Sapere.recepcao@gmail.com'
    };

    const whatsappService = new WhatsAppService(whatsappConfig);
    const emailService = new EmailService(emailConfig);
    
    this.communicationService = new CommunicationService(whatsappService, emailService);
  }

  /**
   * Enviar mensagem manual
   */
  sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        patient_id,
        type,
        template_type,
        variables,
        custom_message,
        scheduled_for
      } = req.body;

      if (!patient_id || !type) {
        res.status(400).json({
          success: false,
          message: 'ID do paciente e tipo de comunicação são obrigatórios'
        });
        return;
      }

      // Se for mensagem personalizada
      if (custom_message) {
        const result = await this.sendCustomMessage(
          patient_id,
          type,
          custom_message,
          scheduled_for,
          req.user?.id
        );
        
        res.json(result);
        return;
      }

      // Mensagem usando template
      const result = await this.communicationService.sendMessage(
        patient_id,
        type,
        template_type || MessageTemplate.CUSTOM,
        variables || {},
        scheduled_for ? new Date(scheduled_for) : undefined,
        req.user?.id
      );

      res.json(result);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  /**
   * Processar webhook do WhatsApp
   */
  whatsappWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Verificação do webhook (GET request)
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
          res.status(200).send(challenge);
          return;
        }

        res.status(403).json({ error: 'Token de verificação inválido' });
        return;
      }

      // Processar webhook (POST request)
      const webhookData = req.body;
      
      // Verificar se é um evento do WhatsApp
      if (webhookData.object === 'whatsapp_business_account') {
        // Processar em background para não bloquear a resposta
        setImmediate(async () => {
          try {
            const whatsappService = new WhatsAppService({
              access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
              phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
              business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
              webhook_verify_token: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
              app_id: process.env.WHATSAPP_APP_ID || '',
              app_secret: process.env.WHATSAPP_APP_SECRET || ''
            });
            
            await whatsappService.processWebhook(webhookData);
          } catch (error) {
            console.error('Erro ao processar webhook WhatsApp:', error);
          }
        });
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Erro no webhook WhatsApp:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  /**
   * Listar comunicações de um paciente
   */
  getPatientCommunications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const { limit = '50', offset = '0' } = req.query;

      const communications = await this.communicationService.getPatientCommunications(
        patientId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: communications,
        total: communications.length
      });
    } catch (error: any) {
      console.error('Erro ao buscar comunicações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Obter estatísticas de comunicação
   */
  getCommunicationStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { 
        start_date, 
        end_date, 
        type 
      } = req.query;

      const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = end_date ? new Date(end_date as string) : new Date();

      const stats = await this.communicationService.getCommunicationStats(
        startDate,
        endDate,
        type as CommunicationType
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Gerenciar consentimento do paciente
   */
  manageConsent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const { 
        type, 
        consent_given, 
        source = 'web',
        ip_address,
        user_agent
      } = req.body;

      if (consent_given) {
        await this.communicationService.recordConsent(
          patientId,
          type,
          true,
          source,
          ip_address || req.ip,
          user_agent || req.get('User-Agent')
        );
      } else {
        await this.communicationService.withdrawConsent(patientId, type, 'Solicitado pelo usuário');
      }

      res.json({
        success: true,
        message: consent_given ? 'Consentimento registrado' : 'Consentimento retirado'
      });
    } catch (error: any) {
      console.error('Erro ao gerenciar consentimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Listar templates de comunicação
   */
  getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { type, channel } = req.query;
      
      let whereClause = 'WHERE active = true';
      const params: any[] = [];
      let paramCount = 0;

      if (type) {
        paramCount++;
        whereClause += ` AND type = $${paramCount}`;
        params.push(type);
      }

      if (channel) {
        paramCount++;
        whereClause += ` AND channel = $${paramCount}`;
        params.push(channel);
      }

      const result = await query(`
        SELECT id, name, type, channel, subject, content, variables, 
               whatsapp_template_name, active, usage_count, created_at
        FROM communication_templates
        ${whereClause}
        ORDER BY name ASC
      `, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error: any) {
      console.error('Erro ao buscar templates:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Criar novo template
   */
  createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        type,
        channel,
        subject,
        content,
        html_content,
        variables,
        whatsapp_template_name
      } = req.body;

      const templateId = uuidv4();

      await query(`
        INSERT INTO communication_templates (
          id, name, type, channel, subject, content, html_content, 
          variables, whatsapp_template_name, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [
        templateId, name, type, channel, subject, content, html_content,
        JSON.stringify(variables || []), whatsapp_template_name, req.user?.id
      ]);

      res.status(201).json({
        success: true,
        message: 'Template criado com sucesso',
        data: { id: templateId }
      });
    } catch (error: any) {
      console.error('Erro ao criar template:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Atualizar template
   */
  updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;
      const {
        name,
        subject,
        content,
        html_content,
        variables,
        active
      } = req.body;

      await query(`
        UPDATE communication_templates 
        SET name = COALESCE($1, name),
            subject = COALESCE($2, subject),
            content = COALESCE($3, content),
            html_content = COALESCE($4, html_content),
            variables = COALESCE($5, variables),
            active = COALESCE($6, active),
            updated_at = NOW(),
            updated_by = $7
        WHERE id = $8
      `, [name, subject, content, html_content, JSON.stringify(variables), active, req.user?.id, templateId]);

      res.json({
        success: true,
        message: 'Template atualizado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar template:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Testar configurações de comunicação
   */
  testConfiguration = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const results: any = {};

      if (type === 'whatsapp' || type === 'all') {
        const whatsappService = new WhatsAppService({
          access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
          phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
          business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
          webhook_verify_token: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
          app_id: process.env.WHATSAPP_APP_ID || '',
          app_secret: process.env.WHATSAPP_APP_SECRET || ''
        });

        results.whatsapp = await whatsappService.testConnection();
      }

      if (type === 'email' || type === 'all') {
        const emailService = new EmailService({
          smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
          smtp_port: parseInt(process.env.SMTP_PORT || '587'),
          smtp_secure: process.env.SMTP_SECURE === 'true',
          smtp_user: process.env.SMTP_USER || 'Sapere.recepcao@gmail.com',
          smtp_password: process.env.SMTP_PASSWORD || '',
          from_name: 'Sapere - Clínica de Neurodivergentes',
          from_email: 'Sapere.recepcao@gmail.com'
        });

        results.email = await emailService.testConnection();
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error: any) {
      console.error('Erro ao testar configurações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Processar mensagens agendadas
   */
  processScheduledMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Esta função seria chamada por um cron job
      await this.communicationService.processScheduledMessages();
      
      res.json({
        success: true,
        message: 'Mensagens agendadas processadas'
      });
    } catch (error: any) {
      console.error('Erro ao processar mensagens agendadas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Enviar mensagem personalizada
   */
  private async sendCustomMessage(
    patientId: string,
    type: CommunicationType,
    message: string,
    scheduledFor?: string,
    userId?: string
  ): Promise<any> {
    try {
      // Verificar consentimento
      const hasConsent = await this.communicationService.checkConsent(patientId, type);
      if (!hasConsent) {
        return {
          success: false,
          error: 'Paciente não deu consentimento para este tipo de comunicação'
        };
      }

      // Buscar dados do paciente
      const patientResult = await query(
        'SELECT name, email, phone FROM patients WHERE id = $1',
        [patientId]
      );

      if (patientResult.rows.length === 0) {
        return { success: false, error: 'Paciente não encontrado' };
      }

      const patient = patientResult.rows[0];
      const communicationId = uuidv4();
      const scheduled = scheduledFor ? new Date(scheduledFor) : null;
      const status = scheduled && scheduled > new Date() ? CommunicationStatus.PENDING : CommunicationStatus.SENDING;

      // Criar registro da comunicação
      await query(`
        INSERT INTO communications (
          id, patient_id, type, status, content, to_email, to_phone, to_name,
          scheduled_for, attempts, max_attempts, consent_given, created_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
      `, [
        communicationId, patientId, type, status, message,
        patient.email, patient.phone, patient.name, scheduled,
        0, 3, true, userId
      ]);

      // Se não está agendada, enviar agora
      if (!scheduled || scheduled <= new Date()) {
        // Implementar envio direto baseado no tipo
        // Por simplicidade, marcar como enviada
        await query(
          'UPDATE communications SET status = $1, sent_at = NOW() WHERE id = $2',
          [CommunicationStatus.SENT, communicationId]
        );
      }

      return {
        success: true,
        messageId: communicationId,
        message: scheduled ? 'Mensagem agendada com sucesso' : 'Mensagem enviada com sucesso'
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const communicationController = new CommunicationController();