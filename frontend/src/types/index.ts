// Tipos básicos
export type UserRole = 'admin' | 'profissional' | 'therapist' | 'responsible';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | 'agendado' | 'confirmado' | 'em_atendimento' | 'atendido' | 'falta' | 'cancelado';
export type CommunicationType = 'sms' | 'email' | 'whatsapp' | 'call';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
export type RecordType = 'initial_assessment' | 'evolution' | 'discharge' | 'intercurrence' | 'family_guidance';

// Interfaces auxiliares
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface TimeSlot {
  start: string;
  end: string;
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

export interface Goal {
  area: string;
  goal: string;
  target_date?: string;
  progress?: string;
  notes?: string;
}

// Interfaces principais
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: Address | string;
  bio?: string;
  avatar_url?: string;
  last_login_at?: string;
  created_at: string;
  createdAt?: string; // alias para retrocompatibilidade
  updated_at: string;
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
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Patient {
  id: string;
  name: string;
  nome?: string; // alias for consistency
  social_name?: string;
  email?: string;
  phone?: string;
  telefone?: string; // alias for consistency
  birth_date: string;
  nascimento?: string; // alias for consistency
  cpf?: string;
  rg?: string;
  gender?: string;
  address?: Address;
  diagnosis?: string[];
  medications?: Medication[];
  allergies?: string[];
  special_needs?: string;
  school_info?: SchoolInfo;
  responsible_users: string[];
  emergency_contacts?: EmergencyContact[];
  general_notes?: string;
  internal_notes?: string;
  observacoes?: string; // alias for notes
  active: boolean;
  first_appointment_at?: string;
  last_appointment_at?: string;
  created_at: string;
  updated_at: string;
  responsibles?: User[];
  
  // Additional fields for compatibility
  contatos?: {
    email?: string;
    telefone?: string;
  };
  responsavel?: {
    nome?: string;
    cpf?: string;
    telefone?: string;
  };
  convenio?: {
    nome?: string;
    numero?: string;
  };
  tags?: string[];
}

export interface Appointment {
  id: string;
  patient_id: string;
  patientId: string; // alias for consistency
  therapist_id: string;
  professionalId: string; // alias for consistency
  appointment_date: string;
  inicio: string; // alias for consistency
  fim: string; // alias for consistency
  duration: number;
  timezone: string;
  status: AppointmentStatus;
  confirmed_by_patient: boolean;
  confirmed_at?: string;
  confirmation_attempts: number;
  appointment_type?: string;
  session_number?: number;
  notes?: string;
  motivo?: string; // alias for notes
  original_appointment_id?: string;
  rescheduled_reason?: string;
  cancelled_reason?: string;
  reminder_sent_at?: string;
  reminder_count: number;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  therapist?: Therapist;
  professional?: Therapist; // alias for therapist
  
  // Compatibility fields
  patient_name?: string;
  therapist_name?: string;
  professionalName?: string;
  
  // Additional computed fields
  isToday?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
  canEdit?: boolean;
  canCancel?: boolean;
}

export interface Record {
  id: string;
  patient_id: string;
  therapist_id: string;
  appointment_id?: string;
  record_type: RecordType;
  title: string;
  content: string;
  goals?: Goal[];
  interventions?: string[];
  mood?: string;
  attention_level?: number;
  cooperation_level?: number;
  family_guidelines?: string;
  homework?: string;
  next_steps?: string;
  is_draft: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  record_date: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  therapist?: Therapist;
  appointment?: Appointment;
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
  scheduled_for?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  patient?: Patient;
  appointment?: Appointment;
}

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_whatsapp: string;
  address: Address;
  created_at: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  type: 'patient_created' | 'appointment_scheduled' | 'appointment_completed' | 'session_started' | 'reminder_sent' | 'error' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  data?: { [key: string]: any };
}

export interface PatientDetails {
  id: string;
  name?: string;
  nome?: string;
  birth_date?: string;
  nascimento?: string;
  phone?: string;
  telefone?: string;
  email?: string;
  responsible_users?: string[];
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  expires_in?: number;
  refresh_token?: string;
}