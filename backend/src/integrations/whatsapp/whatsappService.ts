// Serviço WhatsApp Business API para Sistema Sapere
import axios, { AxiosResponse } from 'axios';
import { 
  WhatsAppConfig, 
  CommunicationMessage, 
  CommunicationStatus,
  WhatsAppWebhook,
  WhatsAppStatus 
} from '../../types/communication';
import { query } from '../../database/config/database';

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseURL = 'https://graph.facebook.com/v18.0';

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Enviar mensagem de template aprovado pelo WhatsApp
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components?: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${this.baseURL}/${this.config.phone_number_id}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components || []
        }
      };

      const response: AxiosResponse = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.messages && response.data.messages.length > 0) {
        return {
          success: true,
          messageId: response.data.messages[0].id
        };
      }

      return { success: false, error: 'Nenhuma mensagem foi enviada' };
    } catch (error: any) {
      console.error('Erro ao enviar template WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Enviar mensagem de texto simples (apenas para conversas ativas)
   */
  async sendText(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${this.baseURL}/${this.config.phone_number_id}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message
        }
      };

      const response: AxiosResponse = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.messages && response.data.messages.length > 0) {
        return {
          success: true,
          messageId: response.data.messages[0].id
        };
      }

      return { success: false, error: 'Nenhuma mensagem foi enviada' };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Processar webhook do WhatsApp
   */
  async processWebhook(webhookData: WhatsAppWebhook): Promise<void> {
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          // Processar status de mensagens enviadas
          if (change.value.statuses) {
            for (const status of change.value.statuses) {
              await this.updateMessageStatus(status);
            }
          }

          // Processar mensagens recebidas
          if (change.value.messages) {
            for (const message of change.value.messages) {
              await this.handleIncomingMessage(message, change.value.contacts?.[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar webhook WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Atualizar status da mensagem no banco de dados
   */
  private async updateMessageStatus(status: WhatsAppStatus): Promise<void> {
    try {
      const dbStatus = this.mapWhatsAppStatusToDbStatus(status.status);
      const timestamp = new Date(parseInt(status.timestamp) * 1000);

      let updateField = 'sent_at';
      if (status.status === 'delivered') updateField = 'delivered_at';
      if (status.status === 'read') updateField = 'read_at';
      if (status.status === 'failed') updateField = 'failed_at';

      await query(
        `UPDATE communications 
         SET status = $1, ${updateField} = $2, provider_response = $3, updated_at = NOW()
         WHERE provider_message_id = $4`,
        [dbStatus, timestamp, JSON.stringify(status), status.id]
      );

      // Se falhou, registrar erro
      if (status.status === 'failed' && status.errors) {
        const errorMessage = status.errors.map(e => `${e.title}: ${e.message}`).join('; ');
        await query(
          `UPDATE communications 
           SET error_message = $1, error_code = $2
           WHERE provider_message_id = $3`,
          [errorMessage, status.errors[0]?.code.toString(), status.id]
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
    }
  }

  /**
   * Lidar com mensagens recebidas
   */
  private async handleIncomingMessage(message: any, contact?: any): Promise<void> {
    try {
      // Verificar se é uma resposta de confirmação
      if (message.text?.body) {
        const body = message.text.body.toLowerCase().trim();
        
        // Respostas de confirmação de consulta
        if (['sim', 'confirmo', 'ok', '1', 'confirmar'].includes(body)) {
          await this.handleAppointmentConfirmation(message.from, true);
        } else if (['não', 'nao', 'cancelar', 'remarcar', '2'].includes(body)) {
          await this.handleAppointmentConfirmation(message.from, false);
        }
      }

      // Registrar mensagem recebida no histórico
      await this.logIncomingMessage(message, contact);
    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
    }
  }

  /**
   * Processar confirmação de consulta
   */
  private async handleAppointmentConfirmation(phone: string, confirmed: boolean): Promise<void> {
    try {
      const cleanPhone = this.formatPhoneNumber(phone);
      
      // Buscar consulta pendente de confirmação para este número
      const result = await query(`
        SELECT a.id, a.patient_id, p.name as patient_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE p.phone = $1 
          AND a.status = 'scheduled'
          AND a.appointment_date > NOW()
          AND a.confirmed_by_patient = false
        ORDER BY a.appointment_date ASC
        LIMIT 1
      `, [cleanPhone]);

      if (result.rows.length > 0) {
        const appointment = result.rows[0];
        
        if (confirmed) {
          // Confirmar consulta
          await query(
            `UPDATE appointments 
             SET confirmed_by_patient = true, confirmed_at = NOW(), status = 'confirmed'
             WHERE id = $1`,
            [appointment.id]
          );

          // Enviar mensagem de confirmação recebida
          await this.sendText(phone, 
            `✅ Consulta confirmada! Obrigado, ${appointment.patient_name}. ` +
            `Estaremos esperando você. Qualquer dúvida, entre em contato: (92) 99230-5850`
          );
        } else {
          // Marcar como não confirmada e solicitar reagendamento
          await query(
            `UPDATE appointments 
             SET status = 'rescheduled'
             WHERE id = $1`,
            [appointment.id]
          );

          // Enviar mensagem sobre reagendamento
          await this.sendText(phone, 
            `📅 Entendido! Vamos remarcar sua consulta. ` +
            `Nossa equipe entrará em contato para reagendar. ` +
            `Ou ligue: (92) 99230-5850`
          );
        }
      }
    } catch (error) {
      console.error('Erro ao processar confirmação de consulta:', error);
    }
  }

  /**
   * Registrar mensagem recebida no histórico
   */
  private async logIncomingMessage(message: any, contact?: any): Promise<void> {
    try {
      const cleanPhone = this.formatPhoneNumber(message.from);
      
      // Buscar paciente pelo telefone
      const patientResult = await query(
        'SELECT id, name FROM patients WHERE phone = $1',
        [cleanPhone]
      );

      let patientId = null;
      if (patientResult.rows.length > 0) {
        patientId = patientResult.rows[0].id;
      }

      // Registrar mensagem recebida
      await query(`
        INSERT INTO communications (
          patient_id, type, status, content, to_phone, provider_message_id,
          provider_response, created_at
        ) VALUES ($1, 'whatsapp', 'delivered', $2, $3, $4, $5, $6)
      `, [
        patientId,
        message.text?.body || '[Mensagem não textual]',
        cleanPhone,
        message.id,
        JSON.stringify({ incoming: true, message, contact }),
        new Date(parseInt(message.timestamp) * 1000)
      ]);
    } catch (error) {
      console.error('Erro ao registrar mensagem recebida:', error);
    }
  }

  /**
   * Verificar se o número pode receber mensagens
   */
  async checkPhoneNumber(phone: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Para ambiente de produção, implementar verificação real
      // Por enquanto, validação básica
      const cleanPhone = this.formatPhoneNumber(phone);
      
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return { valid: false, error: 'Número de telefone inválido' };
      }

      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Formatar número de telefone para WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let clean = phone.replace(/\D/g, '');
    
    // Se começa com 0, remove
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    
    // Se não tem código do país, adiciona 55 (Brasil)
    if (clean.length === 11 && clean.startsWith('9')) {
      clean = '55' + clean;
    } else if (clean.length === 10) {
      clean = '559' + clean;
    } else if (clean.length === 13 && clean.startsWith('55')) {
      // Já está formatado corretamente
    } else if (!clean.startsWith('55')) {
      clean = '55' + clean;
    }
    
    return clean;
  }

  /**
   * Mapear status do WhatsApp para status do banco
   */
  private mapWhatsAppStatusToDbStatus(status: string): CommunicationStatus {
    switch (status) {
      case 'sent': return CommunicationStatus.SENT;
      case 'delivered': return CommunicationStatus.DELIVERED;
      case 'read': return CommunicationStatus.READ;
      case 'failed': return CommunicationStatus.FAILED;
      default: return CommunicationStatus.SENT;
    }
  }

  /**
   * Obter templates aprovados
   */
  async getApprovedTemplates(): Promise<any[]> {
    try {
      const url = `${this.baseURL}/${this.config.business_account_id}/message_templates`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`
        },
        params: {
          status: 'APPROVED'
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Erro ao obter templates:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Testar configuração
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `${this.baseURL}/${this.config.phone_number_id}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.config.access_token}`
        }
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

// Templates padrão da Sapere para aprovação no WhatsApp
export const SAPERE_WHATSAPP_TEMPLATES = {
  appointment_confirmation: {
    name: 'sapere_appointment_confirmation',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}! Sua consulta na Sapere está confirmada para {{2}} às {{3}}. Confirme respondendo *SIM* ou reagende respondendo *REMARCAR*. Dúvidas: (92) 99230-5850'
      }
    ]
  },
  appointment_reminder: {
    name: 'sapere_appointment_reminder',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Lembrete: {{1}}, você tem consulta na Sapere {{2}} às {{3}}. Até breve! Dúvidas: (92) 99230-5850'
      }
    ]
  },
  appointment_cancelled: {
    name: 'sapere_appointment_cancelled',
    language: 'pt_BR',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Sua consulta na Sapere foi cancelada. Entre em contato para reagendar: (92) 99230-5850'
      }
    ]
  },
  welcome_message: {
    name: 'sapere_welcome',
    language: 'pt_BR',
    category: 'MARKETING',
    components: [
      {
        type: 'BODY',
        text: 'Bem-vindo(a) à Sapere, {{1}}! Somos especializados em neurodivergência. Para agendar consultas ou tirar dúvidas: (92) 99230-5850'
      }
    ]
  }
};