export type UserRole = 'admin' | 'profissional' | 'therapist' | 'responsible';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type CommunicationType = 'sms' | 'email' | 'whatsapp' | 'call';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
export type RecordType = 'initial_assessment' | 'evolution' | 'discharge' | 'intercurrence' | 'family_guidance';
export type AttachmentType = 'document' | 'image' | 'video' | 'audio' | 'report';
export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    phone?: string;
    cpf?: string;
    birth_date?: Date;
    address?: Address;
    avatar_url?: string;
    last_login_at?: Date;
    email_verified_at?: Date;
    phone_verified_at?: Date;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    updated_by?: string;
}
export interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country?: string;
}
export interface Therapist {
    id: string;
    user_id: string;
    professional_id?: string;
    specialties: string[];
    bio?: string;
    experience_years?: number;
    languages: string[];
    available_hours: AvailableHours;
    consultation_duration: number;
    max_daily_appointments: number;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    user?: User;
}
export interface AvailableHours {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
}
export interface TimeSlot {
    start: string;
    end: string;
}
export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}
export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    prescriber: string;
}
export interface SchoolInfo {
    name: string;
    grade: string;
    teacher?: string;
    observations?: string;
}
export interface WorkInfo {
    occupation: string;
    company?: string;
    observations?: string;
}
export interface Patient {
    id: string;
    name: string;
    social_name?: string;
    email?: string;
    phone?: string;
    birth_date: Date;
    cpf?: string;
    rg?: string;
    gender?: string;
    address?: Address;
    diagnosis?: string[];
    medications?: Medication[];
    allergies?: string[];
    special_needs?: string;
    school_info?: SchoolInfo;
    work_info?: WorkInfo;
    responsible_users: string[];
    emergency_contacts?: EmergencyContact[];
    general_notes?: string;
    internal_notes?: string;
    active: boolean;
    first_appointment_at?: Date;
    last_appointment_at?: Date;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    updated_by?: string;
    responsibles?: User[];
}
export interface Appointment {
    id: string;
    patient_id: string;
    therapist_id: string;
    appointment_date: Date;
    duration: number;
    timezone: string;
    status: AppointmentStatus;
    confirmed_by_patient: boolean;
    confirmed_at?: Date;
    confirmation_attempts: number;
    appointment_type?: string;
    session_number?: number;
    notes?: string;
    original_appointment_id?: string;
    rescheduled_reason?: string;
    rescheduled_at?: Date;
    rescheduled_by?: string;
    cancelled_reason?: string;
    cancelled_at?: Date;
    cancelled_by?: string;
    reminder_sent_at?: Date;
    reminder_count: number;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    updated_by?: string;
    patient?: Patient;
    therapist?: Therapist;
}
export interface Goal {
    area: string;
    goal: string;
    target_date?: string;
    progress?: string;
    notes?: string;
}
export interface AssessmentData {
    developmental_milestones?: {
        motor?: string;
        language?: string;
        social?: string;
        cognitive?: string;
    };
    behavioral_observations?: {
        attention?: string;
        compliance?: string;
        sensory?: string;
    };
}
export interface EvolutionData {
    session_focus?: string;
    activities?: string[];
    achievements?: string[];
    challenges?: string[];
}
export interface Record {
    id: string;
    patient_id: string;
    therapist_id: string;
    appointment_id?: string;
    record_type: RecordType;
    title: string;
    content: string;
    assessment_data?: AssessmentData;
    evolution_data?: EvolutionData;
    goals?: Goal[];
    interventions?: string[];
    mood?: string;
    attention_level?: number;
    cooperation_level?: number;
    family_guidelines?: string;
    homework?: string;
    next_steps?: string;
    next_appointment_notes?: string;
    version: number;
    parent_record_id?: string;
    is_draft: boolean;
    reviewed_by?: string;
    reviewed_at?: Date;
    record_date: Date;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    updated_by?: string;
    patient?: Patient;
    therapist?: Therapist;
    appointment?: Appointment;
}
export interface RecordAttachment {
    id: string;
    record_id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    attachment_type: AttachmentType;
    title?: string;
    description?: string;
    created_at: Date;
    uploaded_by?: string;
}
export interface Communication {
    id: string;
    patient_id?: string;
    user_id?: string;
    type: CommunicationType;
    status: CommunicationStatus;
    subject?: string;
    message: string;
    to_phone?: string;
    to_email?: string;
    provider?: string;
    provider_id?: string;
    provider_response?: any;
    attempts: number;
    max_attempts: number;
    next_attempt_at?: Date;
    scheduled_for?: Date;
    sent_at?: Date;
    delivered_at?: Date;
    read_at?: Date;
    failed_at?: Date;
    error_message?: string;
    error_code?: string;
    appointment_id?: string;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    patient?: Patient;
    appointment?: Appointment;
}
export interface BusinessHours {
    [key: string]: {
        open: string;
        close: string;
        active: boolean;
    };
}
export interface AppointmentSettings {
    default_duration: number;
    min_advance_booking: number;
    max_advance_booking: number;
    allow_weekend_booking: boolean;
    cancellation_deadline: number;
}
export interface CommunicationSettings {
    reminder_hours_before: number[];
    whatsapp_enabled: boolean;
    sms_enabled: boolean;
    email_enabled: boolean;
    auto_confirm_enabled: boolean;
}
export interface RecordSettings {
    require_review: boolean;
    auto_backup: boolean;
    retention_days: number;
}
export interface DefaultMessages {
    appointment_confirmation: string;
    appointment_reminder: string;
    appointment_cancelled: string;
}
export interface ClinicSettings {
    id: string;
    clinic_name: string;
    clinic_phone: string;
    clinic_email: string;
    clinic_whatsapp: string;
    address: Address;
    business_hours: BusinessHours;
    appointment_settings: AppointmentSettings;
    communication_settings: CommunicationSettings;
    record_settings: RecordSettings;
    default_messages: DefaultMessages;
    created_at: Date;
    updated_at: Date;
    updated_by?: string;
}
export interface ActivityLog {
    id: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}
//# sourceMappingURL=database.d.ts.map