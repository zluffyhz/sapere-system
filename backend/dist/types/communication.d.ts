export declare enum CommunicationType {
    WHATSAPP = "whatsapp",
    EMAIL = "email",
    SMS = "sms",
    CALL = "call"
}
export declare enum CommunicationStatus {
    PENDING = "pending",
    SENDING = "sending",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum MessageTemplate {
    APPOINTMENT_CONFIRMATION = "appointment_confirmation",
    APPOINTMENT_REMINDER_24H = "appointment_reminder_24h",
    APPOINTMENT_REMINDER_2H = "appointment_reminder_2h",
    APPOINTMENT_CANCELLED = "appointment_cancelled",
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled",
    WELCOME_MESSAGE = "welcome_message",
    THERAPY_REPORT = "therapy_report",
    NEWSLETTER = "newsletter",
    BIRTHDAY_WISH = "birthday_wish",
    FOLLOW_UP = "follow_up",
    CUSTOM = "custom"
}
export interface CommunicationTemplate {
    id: string;
    name: string;
    type: MessageTemplate;
    channel: CommunicationType;
    subject?: string;
    content: string;
    variables: string[];
    whatsapp_template_name?: string;
    active: boolean;
    compliance_approved: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface WhatsAppConfig {
    access_token: string;
    phone_number_id: string;
    business_account_id: string;
    webhook_verify_token: string;
    app_id: string;
    app_secret: string;
}
export interface EmailConfig {
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_password: string;
    from_name: string;
    from_email: string;
}
export interface CommunicationMessage {
    id: string;
    patient_id: string;
    user_id?: string;
    appointment_id?: string;
    type: CommunicationType;
    status: CommunicationStatus;
    template_id?: string;
    subject?: string;
    content: string;
    variables?: Record<string, any>;
    to_phone?: string;
    to_email?: string;
    to_name?: string;
    scheduled_for?: Date;
    sent_at?: Date;
    delivered_at?: Date;
    read_at?: Date;
    failed_at?: Date;
    provider_id?: string;
    provider_message_id?: string;
    provider_response?: any;
    attempts: number;
    max_attempts: number;
    next_attempt_at?: Date;
    error_message?: string;
    error_code?: string;
    consent_given: boolean;
    consent_date?: Date;
    opt_out_date?: Date;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
}
export interface WhatsAppWebhook {
    object: string;
    entry: WhatsAppWebhookEntry[];
}
export interface WhatsAppWebhookEntry {
    id: string;
    changes: WhatsAppWebhookChange[];
}
export interface WhatsAppWebhookChange {
    value: {
        messaging_product: string;
        metadata: {
            display_phone_number: string;
            phone_number_id: string;
        };
        contacts?: WhatsAppContact[];
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
    };
    field: string;
}
export interface WhatsAppContact {
    profile: {
        name: string;
    };
    wa_id: string;
}
export interface WhatsAppMessage {
    from: string;
    id: string;
    timestamp: string;
    text?: {
        body: string;
    };
    type: 'text' | 'image' | 'document' | 'audio' | 'video';
    context?: {
        from: string;
        id: string;
    };
}
export interface WhatsAppStatus {
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    recipient_id: string;
    conversation?: {
        id: string;
        expiration_timestamp?: string;
        origin: {
            type: string;
        };
    };
    pricing?: {
        billable: boolean;
        pricing_model: string;
        category: string;
    };
    errors?: Array<{
        code: number;
        title: string;
        message?: string;
        error_data?: {
            details: string;
        };
    }>;
}
export interface CommunicationStats {
    total_sent: number;
    total_delivered: number;
    total_read: number;
    total_failed: number;
    delivery_rate: number;
    read_rate: number;
    engagement_rate: number;
    opt_out_rate: number;
    period_start: Date;
    period_end: Date;
}
export interface ConsentRecord {
    id: string;
    patient_id: string;
    communication_type: CommunicationType;
    consent_given: boolean;
    consent_date: Date;
    consent_source: 'web' | 'whatsapp' | 'phone' | 'in_person';
    consent_text: string;
    ip_address?: string;
    user_agent?: string;
    withdrawn_date?: Date;
    withdrawal_reason?: string;
    created_at: Date;
    updated_at: Date;
}
export interface AutomationRule {
    id: string;
    name: string;
    active: boolean;
    trigger: 'appointment_scheduled' | 'appointment_confirmed' | 'patient_registered' | 'birthday' | 'follow_up_due';
    conditions: Record<string, any>;
    actions: AutomationAction[];
    created_at: Date;
    updated_at: Date;
}
export interface AutomationAction {
    type: 'send_message' | 'schedule_message' | 'update_patient' | 'create_task';
    template_id?: string;
    delay_minutes?: number;
    parameters?: Record<string, any>;
}
export interface CommunicationChannel {
    type: CommunicationType;
    name: string;
    active: boolean;
    config: WhatsAppConfig | EmailConfig;
    daily_limit?: number;
    rate_limit?: number;
    cost_per_message?: number;
    provider: string;
    last_test_at?: Date;
    last_test_success?: boolean;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=communication.d.ts.map