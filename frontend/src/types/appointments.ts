// Tipos completos para sistema de agendamentos

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'atendido' | 'falta' | 'cancelado';

export type ViewType = 'day' | 'week' | 'month';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  available: boolean;
  reason?: string;
}

export interface WorkingHours {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  active: boolean;
}

export interface ProfessionalSchedule {
  [dayOfWeek: string]: WorkingHours; // monday, tuesday, etc.
}

export interface Professional {
  id: string;
  userId: string;
  nome: string;
  especialidade: string;
  registroConselho?: string;
  ativo: boolean;
  schedule?: ProfessionalSchedule;
  defaultAppointmentDuration?: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Patient {
  id: string;
  nome: string;
  nascimento?: string;
  contatos: {
    email?: string;
    telefone?: string;
  };
  responsavel: {
    nome?: string;
    cpf?: string;
    telefone?: string;
  };
  convenio?: {
    nome?: string;
    numero?: string;
  };
  observacoes?: string;
  tags?: string[];
}

export interface RecurringPattern {
  type: RecurrenceType;
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly: 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // For monthly
  endDate?: string;
  occurrences?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  inicio: string; // ISO date string
  fim: string;    // ISO date string
  sala?: string;
  status: AppointmentStatus;
  motivo?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  
  // Recurring appointments
  recurringId?: string;
  recurringPattern?: RecurringPattern;
  isRecurring: boolean;
  
  // Related data
  patient?: Patient;
  professional?: Professional;
  
  // Notification flags
  confirmationSent?: boolean;
  reminderSent24h?: boolean;
  reminderSent2h?: boolean;
  
  // Session tracking
  checkedInAt?: string;
  sessionStartedAt?: string;
  sessionEndedAt?: string;
  actualDuration?: number;
  
  // Cancellation/Rescheduling
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  rescheduledFrom?: string;
  rescheduledAt?: string;
  rescheduledBy?: string;
  rescheduleReason?: string;
  
  // Calculated fields
  duration: number; // minutes
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  canEdit: boolean;
  canCancel: boolean;
  canReschedule: boolean;
  conflictsWith?: string[];
}

export interface AppointmentConflict {
  type: 'time_overlap' | 'professional_busy' | 'patient_busy' | 'room_busy' | 'outside_working_hours';
  severity: 'error' | 'warning' | 'info';
  message: string;
  conflictingAppointment?: Appointment;
  suggestedTimes?: TimeSlot[];
}

export interface CreateAppointmentData {
  patientId: string;
  professionalId: string;
  inicio: string;
  fim: string;
  sala?: string;
  motivo?: string;
  notas?: string;
  sendConfirmation?: boolean;
  
  // Recurring options
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export interface UpdateAppointmentData {
  patientId?: string;
  professionalId?: string;
  inicio?: string;
  fim?: string;
  sala?: string;
  status?: AppointmentStatus;
  motivo?: string;
  notas?: string;
  
  // Update options for recurring appointments
  updateType?: 'this_only' | 'this_and_following' | 'all_in_series';
}

export interface AppointmentFilters {
  professionalId?: string;
  patientId?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: string;
  endDate?: string;
  sala?: string;
  search?: string;
  isRecurring?: boolean;
  tags?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    appointment: Appointment;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export interface DaySchedule {
  date: string;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  workingHours: WorkingHours;
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
}

export interface WeekSchedule {
  startDate: string;
  endDate: string;
  days: Record<string, DaySchedule>; // date string as key
  totalAppointments: number;
  weeklyStats: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

export interface MonthSchedule {
  year: number;
  month: number;
  weeks: WeekSchedule[];
  monthlyStats: {
    totalDays: number;
    workingDays: number;
    totalAppointments: number;
    averageAppointmentsPerDay: number;
    busiest_day: string;
    completionRate: number;
  };
}

export interface AppointmentStats {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byProfessional: Record<string, {
    name: string;
    count: number;
    percentage: number;
  }>;
  byTimeOfDay: Record<string, number>; // hour as key
  byDayOfWeek: Record<string, number>; // weekday as key
  
  todayCount: number;
  weekCount: number;
  monthCount: number;
  
  averageDuration: number;
  totalDuration: number;
  
  completionRate: number;
  noShowRate: number;
  cancellationRate: number;
  
  mostCommonServices: Array<{
    service: string;
    count: number;
    percentage: number;
  }>;
  
  peakHours: Array<{
    hour: string;
    count: number;
  }>;
  
  busiesttDays: Array<{
    date: string;
    count: number;
  }>;
}

export interface CalendarSettings {
  defaultView: ViewType;
  workingHours: {
    start: string;
    end: string;
  };
  slotDuration: number; // minutes
  slotLabelInterval: number; // minutes
  firstDayOfWeek: number; // 0 = Sunday
  
  notifications: {
    confirmationEnabled: boolean;
    reminderEnabled: boolean;
    reminderTimes: number[]; // hours before appointment
    
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
  };
  
  colors: {
    agendado: string;
    confirmado: string;
    em_atendimento: string;
    atendido: string;
    falta: string;
    cancelado: string;
  };
  
  autoConfirm: boolean;
  allowConflicts: boolean;
  requireReason: boolean;
}

export interface AppointmentFormData {
  // Basic info
  patient: Patient | null;
  professional: Professional | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  
  // Details
  sala?: string;
  motivo?: string;
  notas?: string;
  
  // Recurring
  isRecurring: boolean;
  recurringType: RecurrenceType;
  recurringInterval: number;
  recurringDays?: number[];
  recurringEndDate?: string;
  recurringOccurrences?: number;
}

export interface AppointmentSearchResult {
  appointments: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: AppointmentFilters;
}

export interface QuickAppointment {
  patientName: string;
  time: string;
  duration: number;
  professionalId: string;
}

export interface AppointmentTemplate {
  id: string;
  name: string;
  duration: number;
  motivo: string;
  notas?: string;
  defaultReminders: number[];
  isActive: boolean;
}

export interface RoomResource {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  isActive: boolean;
  bookings: Array<{
    start: string;
    end: string;
    appointmentId: string;
  }>;
}

export interface NotificationPreference {
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  enabled: boolean;
  timing: number; // hours before appointment
  template?: string;
}