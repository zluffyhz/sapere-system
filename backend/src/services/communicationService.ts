// Serviço Principal de Comunicação do Sistema Sapere
import { 
  CommunicationType, 
  CommunicationStatus, 
  MessageTemplate,
  CommunicationMessage,
  CommunicationStats,
  ConsentRecord,
  AutomationRule
} from '../types/communication';
import { WhatsAppService } from '../integrations/whatsapp/whatsappService';
import { EmailService } from '../integrations/email/emailService';
import { query } from '../database/config/database';
import { v4 as uuidv4 } from 'uuid';

export class CommunicationService {
  private whatsappService: WhatsAppService;
  private emailService: EmailService;

  constructor(whatsappService: WhatsAppService, emailService: EmailService) {
    this.whatsappService = whatsappService;
    this.emailService = emailService;
  }

  /**
   * Enviar mensagem usando o canal apropriado
   */
  async sendMessage(
    patientId: string,
    type: CommunicationType,
    templateType: MessageTemplate,
    variables: Record<string, any>,
    scheduledFor?: Date,
    createdBy?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Verificar consentimento
      const hasConsent = await this.checkConsent(patientId, type);
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

      // Criar registro da comunicação
      const communicationId = await this.createCommunicationRecord({
        patient_id: patientId,
        type,
        template_type: templateType,
        variables,
        to_email: patient.email,
        to_phone: patient.phone,
        to_name: patient.name,
        scheduled_for: scheduledFor,
        created_by: createdBy
      });

      // Se agendada para o futuro, não enviar agora
      if (scheduledFor && scheduledFor > new Date()) {
        return { success: true, messageId: communicationId };
      }

      // Enviar mensagem
      const result = await this.sendNow(communicationId, type, templateType, variables, patient);
      
      // Atualizar status no banco
      await this.updateCommunicationStatus(communicationId, 
        result.success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
        result.messageId,
        result.error
      );

      return result;
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar mensagem imediatamente
   */
  private async sendNow(
    communicationId: string,
    type: CommunicationType,
    templateType: MessageTemplate,
    variables: Record<string, any>,
    patient: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (type) {
        case CommunicationType.WHATSAPP:
          return await this.sendWhatsAppMessage(templateType, patient.phone, variables);
          
        case CommunicationType.EMAIL:
          return await this.sendEmailMessage(templateType, patient.email, variables);
          
        default:
          return { success: false, error: 'Tipo de comunicação não suportado' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar mensagem WhatsApp
   */
  private async sendWhatsAppMessage(
    templateType: MessageTemplate,
    phone: string,
    variables: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const templateMapping = {
      [MessageTemplate.APPOINTMENT_CONFIRMATION]: 'sapere_appointment_confirmation',
      [MessageTemplate.APPOINTMENT_REMINDER_24H]: 'sapere_appointment_reminder',
      [MessageTemplate.APPOINTMENT_CANCELLED]: 'sapere_appointment_cancelled',
      [MessageTemplate.WELCOME_MESSAGE]: 'sapere_welcome'
    };

    const templateName = templateMapping[templateType];
    if (!templateName) {
      return { success: false, error: 'Template WhatsApp não encontrado' };
    }

    // Converter variáveis para componentes do WhatsApp
    const components = this.buildWhatsAppComponents(templateType, variables);

    return await this.whatsappService.sendTemplate(phone, templateName, 'pt_BR', components);
  }

  /**
   * Construir componentes para template WhatsApp
   */
  private buildWhatsAppComponents(templateType: MessageTemplate, variables: Record<string, any>): any[] {
    switch (templateType) {
      case MessageTemplate.APPOINTMENT_CONFIRMATION:
        return [{
          type: 'body',
          parameters: [
            { type: 'text', text: variables.patient_name },
            { type: 'text', text: variables.date },
            { type: 'text', text: variables.time }
          ]
        }];
        
      case MessageTemplate.APPOINTMENT_REMINDER_24H:
        return [{
          type: 'body',
          parameters: [
            { type: 'text', text: variables.patient_name },
            { type: 'text', text: variables.date },
            { type: 'text', text: variables.time }
          ]
        }];
        
      case MessageTemplate.WELCOME_MESSAGE:
        return [{
          type: 'body',
          parameters: [
            { type: 'text', text: variables.patient_name }
          ]
        }];
        
      default:
        return [];
    }
  }

  /**
   * Enviar mensagem de email
   */
  private async sendEmailMessage(
    templateType: MessageTemplate,
    email: string,
    variables: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.emailService.sendTemplateEmail(email, templateType, variables);
  }

  /**
   * Processar mensagens agendadas
   */
  async processScheduledMessages(): Promise<void> {
    try {
      const result = await query(`
        SELECT * FROM communications 
        WHERE status = 'pending' 
          AND scheduled_for <= NOW() 
          AND attempts < max_attempts
        ORDER BY scheduled_for ASC
        LIMIT 50
      `);

      for (const message of result.rows) {
        try {
          // Marcar como sendo enviada
          await this.updateCommunicationStatus(message.id, CommunicationStatus.SENDING);

          // Buscar dados do paciente
          const patientResult = await query(
            'SELECT name, email, phone FROM patients WHERE id = $1',
            [message.patient_id]
          );

          if (patientResult.rows.length === 0) {
            await this.updateCommunicationStatus(message.id, CommunicationStatus.FAILED, undefined, 'Paciente não encontrado');
            continue;
          }

          const patient = patientResult.rows[0];
          const variables = JSON.parse(message.variables || '{}');

          // Enviar mensagem
          const sendResult = await this.sendNow(
            message.id,
            message.type,
            message.template_type,
            variables,
            patient
          );

          // Atualizar status
          await this.updateCommunicationStatus(
            message.id,
            sendResult.success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
            sendResult.messageId,
            sendResult.error
          );

          // Incrementar tentativas
          await query(
            'UPDATE communications SET attempts = attempts + 1, next_attempt_at = $1 WHERE id = $2',
            [sendResult.success ? null : new Date(Date.now() + 30 * 60 * 1000), message.id]
          );

        } catch (error: any) {
          console.error(`Erro ao processar mensagem ${message.id}:`, error);
          await this.updateCommunicationStatus(message.id, CommunicationStatus.FAILED, undefined, error.message);
        }
      }
    } catch (error) {
      console.error('Erro ao processar mensagens agendadas:', error);
    }
  }

  /**
   * Verificar consentimento do paciente
   */
  async checkConsent(patientId: string, type: CommunicationType): Promise<boolean> {
    try {
      const result = await query(`
        SELECT consent_given FROM consent_records 
        WHERE patient_id = $1 AND communication_type = $2 
          AND consent_given = true AND withdrawn_date IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `, [patientId, type]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Erro ao verificar consentimento:', error);
      return false;
    }
  }

  /**
   * Registrar consentimento
   */
  async recordConsent(
    patientId: string,
    type: CommunicationType,
    consentGiven: boolean,
    source: string = 'web',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await query(`
        INSERT INTO consent_records (
          id, patient_id, communication_type, consent_given, consent_date,
          consent_source, consent_text, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [
        uuidv4(),
        patientId,
        type,
        consentGiven,
        new Date(),
        source,
        this.getConsentText(type, consentGiven),
        ipAddress,
        userAgent
      ]);
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
      throw error;
    }
  }

  /**
   * Retirar consentimento (opt-out)
   */
  async withdrawConsent(
    patientId: string,
    type: CommunicationType,
    reason?: string
  ): Promise<void> {
    try {
      await query(`
        UPDATE consent_records 
        SET withdrawn_date = NOW(), withdrawal_reason = $3
        WHERE patient_id = $1 AND communication_type = $2 
          AND consent_given = true AND withdrawn_date IS NULL
      `, [patientId, type, reason]);

      // Cancelar mensagens pendentes
      await query(`
        UPDATE communications 
        SET status = 'cancelled', updated_at = NOW()
        WHERE patient_id = $1 AND type = $2 AND status = 'pending'
      `, [patientId, type]);
    } catch (error) {
      console.error('Erro ao retirar consentimento:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de comunicação
   */
  async getCommunicationStats(
    startDate: Date,
    endDate: Date,
    type?: CommunicationType
  ): Promise<CommunicationStats> {
    try {
      const whereClause = type ? 'AND type = $3' : '';
      const params = type ? [startDate, endDate, type] : [startDate, endDate];

      const result = await query(`
        SELECT 
          COUNT(*) as total_sent,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as total_delivered,
          COUNT(CASE WHEN status = 'read' THEN 1 END) as total_read,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed
        FROM communications
        WHERE created_at BETWEEN $1 AND $2 ${whereClause}
      `, params);

      const stats = result.rows[0];
      const totalSent = parseInt(stats.total_sent) || 0;
      const totalDelivered = parseInt(stats.total_delivered) || 0;
      const totalRead = parseInt(stats.total_read) || 0;
      const totalFailed = parseInt(stats.total_failed) || 0;

      return {
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_read: totalRead,
        total_failed: totalFailed,
        delivery_rate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        read_rate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
        engagement_rate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0,
        opt_out_rate: await this.getOptOutRate(startDate, endDate, type),
        period_start: startDate,
        period_end: endDate
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Criar registro de comunicação
   */
  private async createCommunicationRecord(data: any): Promise<string> {
    const id = uuidv4();
    
    await query(`
      INSERT INTO communications (
        id, patient_id, type, status, template_type, content, variables,
        to_email, to_phone, to_name, scheduled_for, attempts, max_attempts,
        consent_given, created_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15)
    `, [
      id,
      data.patient_id,
      data.type,
      data.scheduled_for && data.scheduled_for > new Date() ? CommunicationStatus.PENDING : CommunicationStatus.SENDING,
      data.template_type,
      JSON.stringify(data.variables),
      JSON.stringify(data.variables),
      data.to_email,
      data.to_phone,
      data.to_name,
      data.scheduled_for,
      0,
      3,
      true,
      data.created_by
    ]);

    return id;
  }

  /**
   * Atualizar status da comunicação
   */
  private async updateCommunicationStatus(
    id: string,
    status: CommunicationStatus,
    messageId?: string,
    error?: string
  ): Promise<void> {
    let updateField = '';
    const now = new Date();

    switch (status) {
      case CommunicationStatus.SENT:
        updateField = ', sent_at = $4';
        break;
      case CommunicationStatus.DELIVERED:
        updateField = ', delivered_at = $4';
        break;
      case CommunicationStatus.READ:
        updateField = ', read_at = $4';
        break;
      case CommunicationStatus.FAILED:
        updateField = ', failed_at = $4';
        break;
    }

    await query(`
      UPDATE communications 
      SET status = $1, provider_message_id = $2, error_message = $3, updated_at = NOW() ${updateField}
      WHERE id = $5
    `, [status, messageId, error, updateField ? now : null, id].filter(v => v !== null));
  }

  /**
   * Obter taxa de opt-out
   */
  private async getOptOutRate(
    startDate: Date,
    endDate: Date,
    type?: CommunicationType
  ): Promise<number> {
    try {
      const whereClause = type ? 'AND communication_type = $3' : '';
      const params = type ? [startDate, endDate, type] : [startDate, endDate];

      const totalResult = await query(`
        SELECT COUNT(*) as total
        FROM consent_records
        WHERE created_at BETWEEN $1 AND $2 AND consent_given = true ${whereClause}
      `, params);

      const withdrawnResult = await query(`
        SELECT COUNT(*) as withdrawn
        FROM consent_records
        WHERE withdrawn_date BETWEEN $1 AND $2 ${whereClause}
      `, params);

      const total = parseInt(totalResult.rows[0]?.total) || 0;
      const withdrawn = parseInt(withdrawnResult.rows[0]?.withdrawn) || 0;

      return total > 0 ? (withdrawn / total) * 100 : 0;
    } catch (error) {
      console.error('Erro ao calcular taxa de opt-out:', error);
      return 0;
    }
  }

  /**
   * Obter texto de consentimento
   */
  private getConsentText(type: CommunicationType, consentGiven: boolean): string {
    const action = consentGiven ? 'autorizou' : 'não autorizou';
    const typeText = type === CommunicationType.WHATSAPP ? 'WhatsApp' : 'Email';
    
    return `Paciente ${action} o recebimento de comunicações via ${typeText} conforme LGPD.`;
  }

  /**
   * Listar histórico de comunicações de um paciente
   */
  async getPatientCommunications(
    patientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const result = await query(`
        SELECT 
          c.*,
          p.name as patient_name,
          u.name as created_by_name
        FROM communications c
        LEFT JOIN patients p ON c.patient_id = p.id
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.patient_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `, [patientId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar histórico de comunicações:', error);
      return [];
    }
  }
}