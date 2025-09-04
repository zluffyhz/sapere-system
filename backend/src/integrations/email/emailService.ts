// Serviço de Email para Sistema Sapere
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { 
  EmailConfig, 
  CommunicationMessage, 
  CommunicationStatus,
  MessageTemplate 
} from '../../types/communication';
import { query } from '../../database/config/database';

export class EmailService {
  private transporter: Transporter;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Enviar email personalizado
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    attachments?: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions: SendMailOptions = {
        from: `${this.config.from_name} <${this.config.from_email}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent),
        attachments: attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar email usando template
   */
  async sendTemplateEmail(
    to: string,
    templateType: MessageTemplate,
    variables: Record<string, any>,
    attachments?: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = await this.getEmailTemplate(templateType);
      if (!template) {
        return { success: false, error: 'Template não encontrado' };
      }

      const subject = this.replaceVariables(template.subject, variables);
      const htmlContent = this.replaceVariables(template.html_content, variables);
      const textContent = this.replaceVariables(template.text_content, variables);

      return await this.sendEmail(to, subject, htmlContent, textContent, attachments);
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar relatório terapêutico por email
   */
  async sendTherapyReport(
    to: string,
    patientName: string,
    reportData: any,
    pdfAttachment?: Buffer
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const subject = `Relatório Terapêutico - ${patientName} - Sapere`;
      
      const htmlContent = this.generateTherapyReportHTML(patientName, reportData);
      
      const attachments = [];
      if (pdfAttachment) {
        attachments.push({
          filename: `relatorio-${patientName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        });
      }

      return await this.sendEmail(to, subject, htmlContent, undefined, attachments);
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar newsletter terapêutica
   */
  async sendNewsletter(
    recipients: string[],
    title: string,
    content: string,
    imageUrls?: string[]
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const recipient of recipients) {
      try {
        const htmlContent = this.generateNewsletterHTML(title, content, imageUrls);
        const result = await this.sendEmail(
          recipient,
          `Newsletter Sapere - ${title}`,
          htmlContent
        );

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`${recipient}: ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${recipient}: ${error.message}`);
      }
    }

    results.success = results.failed === 0;
    return results;
  }

  /**
   * Obter template de email do banco de dados
   */
  private async getEmailTemplate(templateType: MessageTemplate): Promise<any> {
    try {
      const result = await query(
        'SELECT * FROM communication_templates WHERE type = $1 AND channel = $2 AND active = true',
        [templateType, 'email']
      );

      if (result.rows.length === 0) {
        // Retornar templates padrão se não existir no banco
        return this.getDefaultEmailTemplate(templateType);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      return this.getDefaultEmailTemplate(templateType);
    }
  }

  /**
   * Templates padrão de email
   */
  private getDefaultEmailTemplate(templateType: MessageTemplate): any {
    const templates = {
      [MessageTemplate.APPOINTMENT_CONFIRMATION]: {
        subject: 'Consulta Confirmada - Sapere',
        html_content: this.getAppointmentConfirmationHTML(),
        text_content: 'Olá {patient_name}! Sua consulta na Sapere está confirmada para {date} às {time}. Endereço: {clinic_address}. Dúvidas: (92) 99230-5850'
      },
      [MessageTemplate.APPOINTMENT_REMINDER_24H]: {
        subject: 'Lembrete: Consulta Amanhã - Sapere',
        html_content: this.getAppointmentReminderHTML(),
        text_content: 'Lembrete: {patient_name}, você tem consulta na Sapere amanhã ({date}) às {time}. Até breve!'
      },
      [MessageTemplate.APPOINTMENT_CANCELLED]: {
        subject: 'Consulta Cancelada - Sapere',
        html_content: this.getAppointmentCancelledHTML(),
        text_content: 'Sua consulta na Sapere foi cancelada. Entre em contato para reagendar: (92) 99230-5850'
      },
      [MessageTemplate.WELCOME_MESSAGE]: {
        subject: 'Bem-vindo(a) à Sapere!',
        html_content: this.getWelcomeMessageHTML(),
        text_content: 'Bem-vindo(a) à Sapere, {patient_name}! Somos especializados em neurodivergência. Entre em contato: (92) 99230-5850'
      }
    };

    return templates[templateType] || null;
  }

  /**
   * Templates HTML
   */
  private getAppointmentConfirmationHTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Consulta Confirmada - Sapere</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .highlight { background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .btn { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Consulta Confirmada</h1>
          <p>Sapere - Clínica de Neurodivergentes</p>
        </div>
        
        <div class="content">
          <p>Olá <strong>{patient_name}</strong>!</p>
          
          <p>Sua consulta na Sapere está confirmada:</p>
          
          <div class="highlight">
            <strong>📅 Data:</strong> {date}<br>
            <strong>🕐 Horário:</strong> {time}<br>
            <strong>👨‍⚕️ Profissional:</strong> {therapist_name}<br>
            <strong>📍 Local:</strong> {clinic_address}
          </div>
          
          <p><strong>Orientações importantes:</strong></p>
          <ul>
            <li>Chegue 10 minutos antes do horário</li>
            <li>Traga documento com foto</li>
            <li>Se menor de idade, venha acompanhado do responsável</li>
          </ul>
          
          <p>Em caso de imprevistos, entre em contato conosco:</p>
          <p>📱 WhatsApp: (92) 99230-5850<br>
             📧 Email: Sapere.recepcao@gmail.com</p>
        </div>
        
        <div class="footer">
          <p>Sapere - Clínica de Neurodivergentes<br>
             Manaus - AM | (92) 99230-5850</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private getAppointmentReminderHTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lembrete de Consulta - Sapere</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .highlight { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Lembrete de Consulta</h1>
          <p>Sapere - Clínica de Neurodivergentes</p>
        </div>
        
        <div class="content">
          <p>Olá <strong>{patient_name}</strong>!</p>
          
          <p>Este é um lembrete de sua consulta na Sapere:</p>
          
          <div class="highlight">
            <strong>📅 {date} às {time}</strong><br>
            <strong>👨‍⚕️ {therapist_name}</strong><br>
            <strong>📍 {clinic_address}</strong>
          </div>
          
          <p>Nos vemos em breve! 😊</p>
          
          <p>Dúvidas: (92) 99230-5850</p>
        </div>
        
        <div class="footer">
          <p>Sapere - Clínica de Neurodivergentes<br>
             Manaus - AM | (92) 99230-5850</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private getAppointmentCancelledHTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Consulta Cancelada - Sapere</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .highlight { background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Consulta Cancelada</h1>
          <p>Sapere - Clínica de Neurodivergentes</p>
        </div>
        
        <div class="content">
          <p>Olá <strong>{patient_name}</strong>,</p>
          
          <div class="highlight">
            <p>Infelizmente, precisamos cancelar sua consulta marcada para <strong>{date} às {time}</strong>.</p>
          </div>
          
          <p><strong>Motivo:</strong> {cancellation_reason}</p>
          
          <p>Para reagendar sua consulta, entre em contato conosco:</p>
          <p>📱 WhatsApp: (92) 99230-5850<br>
             📧 Email: Sapere.recepcao@gmail.com</p>
             
          <p>Pedimos desculpas pelo inconveniente.</p>
        </div>
        
        <div class="footer">
          <p>Sapere - Clínica de Neurodivergentes<br>
             Manaus - AM | (92) 99230-5850</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private getWelcomeMessageHTML(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bem-vindo(a) à Sapere!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .highlight { background: #F3E8FF; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Bem-vindo(a) à Sapere!</h1>
          <p>Clínica de Neurodivergentes</p>
        </div>
        
        <div class="content">
          <p>Olá <strong>{patient_name}</strong>!</p>
          
          <p>É com muito carinho que damos as boas-vindas à família Sapere!</p>
          
          <div class="highlight">
            <p><strong>Nossa missão:</strong> Oferecer cuidado especializado e humanizado para pessoas neurodivergentes, respeitando a singularidade de cada indivíduo.</p>
          </div>
          
          <p><strong>Nossos serviços incluem:</strong></p>
          <ul>
            <li>Terapia ABA (Análise do Comportamento Aplicada)</li>
            <li>Terapia Ocupacional</li>
            <li>Fonoaudiologia</li>
            <li>Psicologia</li>
            <li>Orientação familiar</li>
          </ul>
          
          <p>Para agendar consultas ou tirar dúvidas:</p>
          <p>📱 WhatsApp: (92) 99230-5850<br>
             📧 Email: Sapere.recepcao@gmail.com</p>
        </div>
        
        <div class="footer">
          <p>Sapere - Clínica de Neurodivergentes<br>
             Manaus - AM | (92) 99230-5850<br>
             Sapere.recepcao@gmail.com</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Gerar HTML para relatório terapêutico
   */
  private generateTherapyReportHTML(patientName: string, reportData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório Terapêutico - ${patientName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .section { margin: 20px 0; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Relatório Terapêutico</h1>
          <p>Sapere - Clínica de Neurodivergentes</p>
        </div>
        
        <div class="content">
          <h2>Paciente: ${patientName}</h2>
          <p>Período: ${reportData.startDate} a ${reportData.endDate}</p>
          
          <div class="section">
            <h3>Sessões Realizadas</h3>
            <p>Total: ${reportData.totalSessions} sessões</p>
          </div>
          
          <div class="section">
            <h3>Evolução Observada</h3>
            <p>${reportData.evolution || 'Dados da evolução do paciente...'}</p>
          </div>
          
          <p>Para mais detalhes, consulte o relatório em anexo.</p>
          
          <p>Atenciosamente,<br>
             Equipe Sapere</p>
        </div>
        
        <div class="footer">
          <p>Sapere - Clínica de Neurodivergentes<br>
             Manaus - AM | (92) 99230-5850</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Gerar HTML para newsletter
   */
  private generateNewsletterHTML(title: string, content: string, imageUrls?: string[]): string {
    const images = imageUrls ? imageUrls.map(url => `<img src="${url}" style="max-width: 100%; margin: 10px 0;">`).join('') : '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Newsletter Sapere - ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📰 Newsletter Sapere</h1>
          <p>Clínica de Neurodivergentes</p>
        </div>
        
        <div class="content">
          <h2>${title}</h2>
          ${images}
          <div>${content}</div>
          
          <p>Equipe Sapere</p>
        </div>
        
        <div class="footer">
          <p>Sapere - Clínica de Neurodivergentes<br>
             Manaus - AM | (92) 99230-5850<br>
             <a href="{unsubscribe_url}">Cancelar inscrição</a></p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Substituir variáveis no template
   */
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  /**
   * Converter HTML para texto simples
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Testar configuração de email
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}