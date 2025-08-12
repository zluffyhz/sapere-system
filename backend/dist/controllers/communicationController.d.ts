import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class CommunicationController {
    private communicationService;
    constructor();
    /**
     * Enviar mensagem manual
     */
    sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Processar webhook do WhatsApp
     */
    whatsappWebhook: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Listar comunicações de um paciente
     */
    getPatientCommunications: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Obter estatísticas de comunicação
     */
    getCommunicationStats: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Gerenciar consentimento do paciente
     */
    manageConsent: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Listar templates de comunicação
     */
    getTemplates: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Criar novo template
     */
    createTemplate: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Atualizar template
     */
    updateTemplate: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Testar configurações de comunicação
     */
    testConfiguration: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Processar mensagens agendadas
     */
    processScheduledMessages: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Enviar mensagem personalizada
     */
    private sendCustomMessage;
}
export declare const communicationController: CommunicationController;
//# sourceMappingURL=communicationController.d.ts.map