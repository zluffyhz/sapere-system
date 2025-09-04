// Serviço para integração com WhatsApp Business API
// +55 92 99230-5850

export interface WhatsAppMessage {
  to: string;
  message: string;
  template?: string;
  variables?: string[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export const whatsappTemplates: MessageTemplate[] = [
  {
    id: 'appointment_confirmation',
    name: 'Confirmação de Consulta',
    content: `Olá {{patient_name}}! 

✅ Confirmamos sua consulta de *{{service_type}}* para:
📅 {{date}} às {{time}}
👨‍⚕️ Com {{therapist_name}}

📍 *Clínica Sapere*
🏥 Especializada em Neurodivergentes

📞 Dúvidas: (92) 99230-5850
📧 Sapere.recepcao@gmail.com

_Por favor, confirme sua presença respondendo esta mensagem._`,
    variables: ['patient_name', 'service_type', 'date', 'time', 'therapist_name']
  },
  {
    id: 'reminder_24h',
    name: 'Lembrete 24 horas',
    content: `🔔 *Lembrete - 24 horas*

Olá {{patient_name}}!

Lembramos que você tem consulta *AMANHÃ*:
📅 {{date}} às {{time}}
👨‍⚕️ {{therapist_name}} - {{service_type}}

📍 *Clínica Sapere*
📞 (92) 99230-5850

_Confirme sua presença para mantermos sua vaga reservada._`,
    variables: ['patient_name', 'date', 'time', 'therapist_name', 'service_type']
  },
  {
    id: 'reminder_2h',
    name: 'Lembrete 2 horas',
    content: `⏰ *Lembrete - 2 horas*

{{patient_name}}, sua consulta é hoje às {{time}}!

👨‍⚕️ {{therapist_name}}
🏥 Clínica Sapere

📍 Chegue 10 minutos antes
📞 (92) 99230-5850

_Estamos te esperando!_`,
    variables: ['patient_name', 'time', 'therapist_name']
  },
  {
    id: 'appointment_cancelled',
    name: 'Cancelamento de Consulta',
    content: `❌ *Consulta Cancelada*

Olá {{patient_name}},

Infelizmente precisamos cancelar sua consulta de {{date}} às {{time}}.

{{reason}}

📞 Entre em contato: (92) 99230-5850
📧 Sapere.recepcao@gmail.com

_Reagendaremos o mais breve possível._`,
    variables: ['patient_name', 'date', 'time', 'reason']
  },
  {
    id: 'check_in',
    name: 'Check-in Realizado',
    content: `✅ *Check-in Confirmado*

{{patient_name}}, recebemos seu check-in!

⏱️ Tempo estimado de espera: {{waiting_time}} minutos
👨‍⚕️ {{therapist_name}} já foi avisado

🪑 Aguarde na recepção
💧 Água disponível no bebedouro

_Obrigado pela pontualidade!_`,
    variables: ['patient_name', 'waiting_time', 'therapist_name']
  },
  {
    id: 'session_completed',
    name: 'Sessão Finalizada',
    content: `🎉 *Sessão Finalizada*

Olá {{patient_name}}!

Sessão de hoje finalizada com sucesso.
👨‍⚕️ {{therapist_name}} - {{service_type}}

📋 Próxima consulta: {{next_appointment}}
💊 Lembre-se das orientações recebidas

📞 Dúvidas: (92) 99230-5850
⭐ Avalie nosso atendimento!`,
    variables: ['patient_name', 'therapist_name', 'service_type', 'next_appointment']
  }
];

class WhatsAppService {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private phoneNumberId = (import.meta as any).env?.VITE_WHATSAPP_PHONE_ID || '';
  private accessToken = (import.meta as any).env?.VITE_WHATSAPP_ACCESS_TOKEN || '';
  // private businessNumber = '+5592992305850';

  /**
   * Formata o número de telefone para o padrão internacional
   */
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se não começar com 55, adiciona o código do Brasil
    if (!cleanPhone.startsWith('55')) {
      return `55${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  /**
   * Substitui as variáveis no template
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let message = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, value);
    });
    
    return message;
  }

  /**
   * Envia mensagem via WhatsApp Business API
   */
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      // Em ambiente de desenvolvimento, apenas simula o envio
      if ((import.meta as any).env.DEV) {
        console.log('📱 WhatsApp Message (DEV MODE):', {
          to: this.formatPhoneNumber(to),
          message,
          timestamp: new Date().toISOString()
        });
        
        // Simula delay de envio
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

      // Em produção, faria a chamada real para a API
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ WhatsApp message sent:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Envia mensagem usando template
   */
  async sendTemplateMessage(
    to: string, 
    templateId: string, 
    variables: Record<string, string>
  ): Promise<boolean> {
    const template = whatsappTemplates.find(t => t.id === templateId);
    if (!template) {
      console.error(`Template ${templateId} não encontrado`);
      return false;
    }

    const message = this.replaceVariables(template.content, variables);
    return this.sendMessage(to, message);
  }

  /**
   * Abre WhatsApp Web com mensagem pré-formatada
   */
  openWhatsAppWeb(to: string, message: string): void {
    const formattedPhone = this.formatPhoneNumber(to);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  }

  /**
   * Envia confirmação de consulta
   */
  async sendAppointmentConfirmation(
    patientPhone: string,
    patientName: string,
    serviceType: string,
    date: string,
    time: string,
    therapistName: string
  ): Promise<boolean> {
    return this.sendTemplateMessage(patientPhone, 'appointment_confirmation', {
      patient_name: patientName,
      service_type: serviceType,
      date,
      time,
      therapist_name: therapistName
    });
  }

  /**
   * Envia lembrete 24 horas antes
   */
  async sendReminder24h(
    patientPhone: string,
    patientName: string,
    serviceType: string,
    date: string,
    time: string,
    therapistName: string
  ): Promise<boolean> {
    return this.sendTemplateMessage(patientPhone, 'reminder_24h', {
      patient_name: patientName,
      service_type: serviceType,
      date,
      time,
      therapist_name: therapistName
    });
  }

  /**
   * Envia lembrete 2 horas antes
   */
  async sendReminder2h(
    patientPhone: string,
    patientName: string,
    time: string,
    therapistName: string
  ): Promise<boolean> {
    return this.sendTemplateMessage(patientPhone, 'reminder_2h', {
      patient_name: patientName,
      time,
      therapist_name: therapistName
    });
  }

  /**
   * Envia notificação de check-in
   */
  async sendCheckInConfirmation(
    patientPhone: string,
    patientName: string,
    waitingTime: number,
    therapistName: string
  ): Promise<boolean> {
    return this.sendTemplateMessage(patientPhone, 'check_in', {
      patient_name: patientName,
      waiting_time: `${waitingTime}`,
      therapist_name: therapistName
    });
  }

  /**
   * Lista todos os templates disponíveis
   */
  getAvailableTemplates(): MessageTemplate[] {
    return whatsappTemplates;
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;