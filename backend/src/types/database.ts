// Tipos TypeScript para o banco de dados Sapere

export type UserRole = 'admin' | 'profissional' | 'therapist' | 'responsible';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type CommunicationType = 'sms' | 'email' | 'whatsapp' | 'call';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
export type RecordType = 'initial_assessment' | 'evolution' | 'discharge' | 'intercurrence' | 'family_guidance';
export type AttachmentType = 'document' | 'image' | 'video' | 'audio' | 'report';
export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type AppointmentPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ConflictResolution = 'manual' | 'reschedule_current' | 'reschedule_conflicting' | 'notify_only';
export type DragMode = 'time' | 'therapist' | 'both' | 'disabled';

// Interfaces base
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
  professional_id?: string; // CRP, CRO, etc.
  specialties: string[];
  bio?: string;
  bio_extended?: string;
  experience_years?: number;
  languages: string[];
  available_hours: AvailableHours;
  consultation_duration: number;
  max_daily_appointments: number;
  active: boolean;
  
  // Campos expandidos para gestão completa
  avatar_url?: string;
  certifications?: string[]; // Lista de certificações
  social_links?: SocialLinks;
  timezone?: string;
  language_preference?: string;
  hourly_rate?: number;
  
  // Métricas de produtividade (calculadas)
  total_sessions?: number;
  total_patients?: number;
  avg_session_duration?: number;
  patient_satisfaction_score?: number;
  cancellation_rate?: number;
  
  created_at: Date;
  updated_at: Date;
  user?: User; // Relacionamento
  productivity_stats?: TherapistProductivity[];
  specialties_details?: Specialty[];
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
  start: string; // HH:MM
  end: string;   // HH:MM
}

// Novas interfaces para sistema de especialidades e produtividade
export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  category: string; // 'neuropsicologia', 'terapia_comportamental', 'avaliacao', etc.
  icon?: string;
  color?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TherapistSpecialty {
  therapist_id: string;
  specialty_id: string;
  experience_level: number; // 1-5 (1=iniciante, 5=especialista)
  certified: boolean;
  certification_date?: Date;
  certification_body?: string;
  created_at: Date;
  specialty?: Specialty; // Relacionamento
}

export interface TherapistProductivity {
  id: string;
  therapist_id: string;
  period_start: Date;
  period_end: Date;
  total_sessions: number;
  total_duration: number; // em segundos
  avg_session_duration: number; // em segundos
  total_patients: number;
  new_patients: number;
  returning_patients: number;
  cancellation_rate: number; // percentual
  no_show_rate: number; // percentual
  patient_satisfaction_score?: number; // 1-5
  revenue_generated?: number;
  sessions_per_day_avg: number;
  peak_hours?: string[]; // ['09:00', '14:00', '16:00']
  created_at: Date;
  updated_at: Date;
  therapist?: Therapist; // Relacionamento
}

export interface PatientFeedback {
  id: string;
  patient_id: string;
  therapist_id: string;
  session_id?: string;
  appointment_id?: string;
  rating: number; // 1-5
  comment?: string;
  categories?: FeedbackCategory;
  anonymous: boolean;
  created_at: Date;
  patient?: Patient; // Relacionamento
  therapist?: Therapist; // Relacionamento
}

export interface FeedbackCategory {
  professionalism: number; // 1-5
  communication: number; // 1-5
  effectiveness: number; // 1-5
  punctuality: number; // 1-5
  environment: number; // 1-5
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
  responsibles?: User[]; // Relacionamento
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
  
  // Campos para drag-and-drop e calendário
  is_draggable: boolean; // Pode ser movido no calendário
  drag_constraints?: DragConstraints; // Restrições de movimento
  color_code?: string; // Cor no calendário (#FF0000)
  priority: AppointmentPriority; // Prioridade visual
  recurring_pattern?: RecurringPattern; // Padrão de recorrência
  conflict_resolution?: ConflictResolution; // Como resolver conflitos
  auto_reschedule: boolean; // Reagendar automaticamente em conflitos
  
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  patient?: Patient; // Relacionamento
  therapist?: Therapist; // Relacionamento
}

// Interfaces para drag-and-drop e calendário
export interface DragConstraints {
  allowed_days?: string[]; // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  min_time?: string; // '08:00'
  max_time?: string; // '18:00'
  allowed_therapists?: string[]; // Lista de therapist IDs permitidos
  min_duration?: number; // Duração mínima em minutos
  max_duration?: number; // Duração máxima em minutos
  buffer_time?: number; // Tempo de intervalo obrigatório em minutos
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // A cada X unidades (1 = toda semana, 2 = a cada 2 semanas)
  days_of_week?: number[]; // [1, 3, 5] para segunda, quarta, sexta (0 = domingo)
  end_date?: Date; // Data de término da recorrência
  occurrences?: number; // Número de ocorrências (alternativa ao end_date)
}

export interface ConflictDetection {
  appointment_id: string;
  conflicting_appointment_id: string;
  conflict_type: 'time_overlap' | 'therapist_unavailable' | 'patient_double_booking' | 'resource_conflict';
  overlap_start: Date;
  overlap_end: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggested_resolution: ConflictResolution;
  alternative_slots?: TimeSlot[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  type: 'appointment' | 'break' | 'unavailable' | 'session';
  color: string;
  is_draggable: boolean;
  is_resizable: boolean;
  metadata?: any; // Dados adicionais específicos do tipo
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
  attention_level?: number; // 1-5
  cooperation_level?: number; // 1-5
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
  patient?: Patient; // Relacionamento
  therapist?: Therapist; // Relacionamento
  appointment?: Appointment; // Relacionamento
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
  patient?: Patient; // Relacionamento
  appointment?: Appointment; // Relacionamento
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
  min_advance_booking: number; // horas
  max_advance_booking: number; // horas
  allow_weekend_booking: boolean;
  cancellation_deadline: number; // horas
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

export interface Session {
  id: string;
  appointment_id?: string;
  therapist_id: string;
  patient_id: string;
  status: SessionStatus;
  start_time: Date;
  pause_time?: Date;
  resume_time?: Date;
  end_time?: Date;
  total_duration?: number; // em segundos
  pause_duration?: number; // em segundos
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  appointment?: Appointment; // Relacionamento
  therapist?: Therapist; // Relacionamento
  patient?: Patient; // Relacionamento
}