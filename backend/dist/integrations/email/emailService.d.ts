import { EmailConfig, MessageTemplate } from '../../types/communication';
export declare class EmailService {
    private transporter;
    private config;
    constructor(config: EmailConfig);
    /**
     * Enviar email personalizado
     */
    sendEmail(to: string, subject: string, htmlContent: string, textContent?: string, attachments?: any[]): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Enviar email usando template
     */
    sendTemplateEmail(to: string, templateType: MessageTemplate, variables: Record<string, any>, attachments?: any[]): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Enviar relatório terapêutico por email
     */
    sendTherapyReport(to: string, patientName: string, reportData: any, pdfAttachment?: Buffer): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Enviar newsletter terapêutica
     */
    sendNewsletter(recipients: string[], title: string, content: string, imageUrls?: string[]): Promise<{
        success: boolean;
        sent: number;
        failed: number;
        errors: string[];
    }>;
    /**
     * Obter template de email do banco de dados
     */
    private getEmailTemplate;
    /**
     * Templates padrão de email
     */
    private getDefaultEmailTemplate;
    /**
     * Templates HTML
     */
    private getAppointmentConfirmationHTML;
    private getAppointmentReminderHTML;
    private getAppointmentCancelledHTML;
    private getWelcomeMessageHTML;
    /**
     * Gerar HTML para relatório terapêutico
     */
    private generateTherapyReportHTML;
    /**
     * Gerar HTML para newsletter
     */
    private generateNewsletterHTML;
    /**
     * Substituir variáveis no template
     */
    private replaceVariables;
    /**
     * Converter HTML para texto simples
     */
    private htmlToText;
    /**
     * Testar configuração de email
     */
    testConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=emailService.d.ts.map