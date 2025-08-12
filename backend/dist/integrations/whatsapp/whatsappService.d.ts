import { WhatsAppConfig, WhatsAppWebhook } from '../../types/communication';
export declare class WhatsAppService {
    private config;
    private baseURL;
    constructor(config: WhatsAppConfig);
    /**
     * Enviar mensagem de template aprovado pelo WhatsApp
     */
    sendTemplate(to: string, templateName: string, languageCode?: string, components?: any[]): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Enviar mensagem de texto simples (apenas para conversas ativas)
     */
    sendText(to: string, message: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Processar webhook do WhatsApp
     */
    processWebhook(webhookData: WhatsAppWebhook): Promise<void>;
    /**
     * Atualizar status da mensagem no banco de dados
     */
    private updateMessageStatus;
    /**
     * Lidar com mensagens recebidas
     */
    private handleIncomingMessage;
    /**
     * Processar confirmação de consulta
     */
    private handleAppointmentConfirmation;
    /**
     * Registrar mensagem recebida no histórico
     */
    private logIncomingMessage;
    /**
     * Verificar se o número pode receber mensagens
     */
    checkPhoneNumber(phone: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * Formatar número de telefone para WhatsApp
     */
    private formatPhoneNumber;
    /**
     * Mapear status do WhatsApp para status do banco
     */
    private mapWhatsAppStatusToDbStatus;
    /**
     * Obter templates aprovados
     */
    getApprovedTemplates(): Promise<any[]>;
    /**
     * Testar configuração
     */
    testConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare const SAPERE_WHATSAPP_TEMPLATES: {
    appointment_confirmation: {
        name: string;
        language: string;
        category: string;
        components: {
            type: string;
            text: string;
        }[];
    };
    appointment_reminder: {
        name: string;
        language: string;
        category: string;
        components: {
            type: string;
            text: string;
        }[];
    };
    appointment_cancelled: {
        name: string;
        language: string;
        category: string;
        components: {
            type: string;
            text: string;
        }[];
    };
    welcome_message: {
        name: string;
        language: string;
        category: string;
        components: {
            type: string;
            text: string;
        }[];
    };
};
//# sourceMappingURL=whatsappService.d.ts.map