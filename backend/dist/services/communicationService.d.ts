import { CommunicationType, MessageTemplate, CommunicationStats } from '../types/communication';
import { WhatsAppService } from '../integrations/whatsapp/whatsappService';
import { EmailService } from '../integrations/email/emailService';
export declare class CommunicationService {
    private whatsappService;
    private emailService;
    constructor(whatsappService: WhatsAppService, emailService: EmailService);
    /**
     * Enviar mensagem usando o canal apropriado
     */
    sendMessage(patientId: string, type: CommunicationType, templateType: MessageTemplate, variables: Record<string, any>, scheduledFor?: Date, createdBy?: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Enviar mensagem imediatamente
     */
    private sendNow;
    /**
     * Enviar mensagem WhatsApp
     */
    private sendWhatsAppMessage;
    /**
     * Construir componentes para template WhatsApp
     */
    private buildWhatsAppComponents;
    /**
     * Enviar mensagem de email
     */
    private sendEmailMessage;
    /**
     * Processar mensagens agendadas
     */
    processScheduledMessages(): Promise<void>;
    /**
     * Verificar consentimento do paciente
     */
    checkConsent(patientId: string, type: CommunicationType): Promise<boolean>;
    /**
     * Registrar consentimento
     */
    recordConsent(patientId: string, type: CommunicationType, consentGiven: boolean, source?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    /**
     * Retirar consentimento (opt-out)
     */
    withdrawConsent(patientId: string, type: CommunicationType, reason?: string): Promise<void>;
    /**
     * Obter estatísticas de comunicação
     */
    getCommunicationStats(startDate: Date, endDate: Date, type?: CommunicationType): Promise<CommunicationStats>;
    /**
     * Criar registro de comunicação
     */
    private createCommunicationRecord;
    /**
     * Atualizar status da comunicação
     */
    private updateCommunicationStatus;
    /**
     * Obter taxa de opt-out
     */
    private getOptOutRate;
    /**
     * Obter texto de consentimento
     */
    private getConsentText;
    /**
     * Listar histórico de comunicações de um paciente
     */
    getPatientCommunications(patientId: string, limit?: number, offset?: number): Promise<any[]>;
}
//# sourceMappingURL=communicationService.d.ts.map