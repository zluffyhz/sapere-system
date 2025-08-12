export interface Therapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo_url?: string;
  specialties: string[];
  registration_number: string; // CRM/CRP/CREFITO
  registration_type: 'CRM' | 'CRP' | 'CREFITO' | 'Outros';
  status: 'active' | 'inactive' | 'vacation';
  created_at: string;
  updated_at: string;
  
  // Configurações de horário
  work_schedule: {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
  };
  
  // Configurações de notificação
  notification_settings: {
    email_notifications: boolean;
    sms_notifications: boolean;
    whatsapp_notifications: boolean;
    appointment_reminders: boolean;
    patient_arrival_alerts: boolean;
  };
  
  // Estatísticas (sem valores financeiros)
  stats: {
    total_appointments: number;
    appointments_this_month: number;
    patients_count: number;
    completion_rate: number; // %
    average_session_duration: number; // minutos
    rating: number; // 0-5
  };
}

export interface WorkDay {
  is_working: boolean;
  shifts: WorkShift[];
}

export interface WorkShift {
  start_time: string; // "08:00"
  end_time: string; // "12:00"
  break_start?: string; // "10:00"
  break_end?: string; // "10:15"
}

export interface TherapistAvailability {
  therapist_id: string;
  date: string;
  time_slots: TimeSlot[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment_id?: string;
  patient_name?: string;
  service_type?: string;
}

// Dados reais dos terapeutas da Sapere
export const SAPERE_THERAPISTS: Omit<Therapist, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Vitória Santos',
    email: 'vitoria.santos@sapere.com.br',
    phone: '+5592999001001',
    specialties: ['Funcional Kids', 'Fisioterapia', 'PediaSuit'],
    registration_number: 'CREFITO-8 123456',
    registration_type: 'CREFITO',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '16:00' }] },
      saturday: { is_working: false, shifts: [] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 245,
      appointments_this_month: 28,
      patients_count: 15,
      completion_rate: 96,
      average_session_duration: 50,
      rating: 4.9
    }
  },
  {
    name: 'Dellany Veras',
    email: 'dellany.veras@sapere.com.br',
    phone: '+5592999002002',
    specialties: ['Neuropsicologia', 'ABA', 'Análise do Comportamento'],
    registration_number: 'CRP-20 67890',
    registration_type: 'CRP',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00' }] },
      saturday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '12:00' }] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: true,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 312,
      appointments_this_month: 35,
      patients_count: 22,
      completion_rate: 98,
      average_session_duration: 60,
      rating: 4.8
    }
  },
  {
    name: 'Marcely Almeida',
    email: 'marcely.almeida@sapere.com.br',
    phone: '+5592999003003',
    specialties: ['Psicopedagogia', 'Intervenção Precoce', 'Educação Especial'],
    registration_number: 'CRP-20 11223',
    registration_type: 'CRP',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '16:00' }] },
      saturday: { is_working: false, shifts: [] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: false
    },
    stats: {
      total_appointments: 189,
      appointments_this_month: 21,
      patients_count: 18,
      completion_rate: 94,
      average_session_duration: 45,
      rating: 4.7
    }
  },
  {
    name: 'Andrea Gadelha',
    email: 'andrea.gadelha@sapere.com.br',
    phone: '+5592999004004',
    specialties: ['ABA', 'PECS', 'Comunicação Alternativa', 'Fonoaudiologia'],
    registration_number: 'CRFa-8 44556',
    registration_type: 'Outros',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00' }] },
      saturday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '13:00' }] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 278,
      appointments_this_month: 32,
      patients_count: 19,
      completion_rate: 97,
      average_session_duration: 55,
      rating: 4.9
    }
  },
  {
    name: 'Ana Paula Girard',
    email: 'ana.girard@sapere.com.br',
    phone: '+5592999005005',
    specialties: ['Terapia Ocupacional', 'Integração Sensorial', 'Neurologia'],
    registration_number: 'CREFITO-8 78901',
    registration_type: 'CREFITO',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '16:00' }] },
      saturday: { is_working: false, shifts: [] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: true,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 201,
      appointments_this_month: 25,
      patients_count: 16,
      completion_rate: 95,
      average_session_duration: 60,
      rating: 4.8
    }
  },
  {
    name: 'Makson Magalhães',
    email: 'makson.magalhaes@sapere.com.br',
    phone: '+5592999006006',
    specialties: ['Musicoterapia Neurológica', 'Musicoterapia', 'Neuroreabilitação'],
    registration_number: 'Outros-1234',
    registration_type: 'Outros',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '09:00', end_time: '17:00' }] },
      saturday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '12:00' }] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: false
    },
    stats: {
      total_appointments: 156,
      appointments_this_month: 18,
      patients_count: 12,
      completion_rate: 92,
      average_session_duration: 50,
      rating: 4.6
    }
  },
  {
    name: 'Regina Menezes',
    email: 'regina.menezes@sapere.com.br',
    phone: '+5592999007007',
    specialties: ['Terapia Ocupacional', 'Neurociência Clínica', 'Reabilitação Cognitiva'],
    registration_number: 'CREFITO-8 23456',
    registration_type: 'CREFITO',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '16:00' }] },
      saturday: { is_working: false, shifts: [] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: true,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 223,
      appointments_this_month: 26,
      patients_count: 17,
      completion_rate: 96,
      average_session_duration: 55,
      rating: 4.7
    }
  },
  {
    name: 'Laís Lopes',
    email: 'lais.lopes@sapere.com.br',
    phone: '+5592999008008',
    specialties: ['Pediatria', 'Medicina Integrativa', 'Desenvolvimento Infantil'],
    registration_number: 'CRM-AM 34567',
    registration_type: 'CRM',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '14:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '14:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '14:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '14:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00' }] },
      saturday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '12:00' }] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: true,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 167,
      appointments_this_month: 19,
      patients_count: 25,
      completion_rate: 98,
      average_session_duration: 30,
      rating: 4.9
    }
  },
  {
    name: 'Açucena Leite',
    email: 'acucena.leite@sapere.com.br',
    phone: '+5592999009009',
    specialties: ['Fisioterapia Neurofuncional', 'Neuroreabilitação', 'Fisioterapia Pediátrica'],
    registration_number: 'CREFITO-8 45678',
    registration_type: 'CREFITO',
    status: 'active',
    work_schedule: {
      monday: { is_working: true, shifts: [{ start_time: '07:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      tuesday: { is_working: true, shifts: [{ start_time: '07:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      wednesday: { is_working: true, shifts: [{ start_time: '07:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      thursday: { is_working: true, shifts: [{ start_time: '07:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
      friday: { is_working: true, shifts: [{ start_time: '07:00', end_time: '16:00' }] },
      saturday: { is_working: true, shifts: [{ start_time: '07:00', end_time: '12:00' }] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    },
    stats: {
      total_appointments: 198,
      appointments_this_month: 22,
      patients_count: 14,
      completion_rate: 97,
      average_session_duration: 45,
      rating: 4.8
    }
  }
];