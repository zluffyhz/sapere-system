// API service para sistema completo de agendamentos

import api from './api';
import type { User } from '@/types';

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'atendido' | 'falta' | 'cancelado';

export interface Professional {
  id: string;
  userId: string;
  nome: string;
  especialidade: string;
  registroConselho?: string;
  ativo: boolean;
  user?: User;
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
}

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  inicio: string;
  fim: string;
  sala?: string;
  status: AppointmentStatus;
  motivo?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  
  // Dados relacionados
  patient?: Patient;
  professional?: Professional;
  
  // Campos calculados
  duration?: number;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  conflictsWith?: string[];
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: string;
  occurrences?: number;
}

export interface AppointmentFilters {
  professionalId?: string;
  patientId?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: string;
  endDate?: string;
  sala?: string;
  search?: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  professionalId: string;
  inicio: string;
  fim: string;
  sala?: string;
  motivo?: string;
  notas?: string;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export interface UpdateAppointmentRequest {
  id: string;
  patientId?: string;
  professionalId?: string;
  inicio?: string;
  fim?: string;
  sala?: string;
  status?: AppointmentStatus;
  motivo?: string;
  notas?: string;
}

export interface AppointmentConflict {
  type: 'time_overlap' | 'professional_busy' | 'patient_busy' | 'room_busy';
  message: string;
  conflictingAppointment?: Appointment;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  workingHours: {
    start: string;
    end: string;
  };
}

export interface AppointmentStats {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byProfessional: Record<string, number>;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  averageDuration: number;
  noShowRate: number;
  completionRate: number;
}

export const appointmentsAPI = {
  // Listar agendamentos
  list: async (filters: AppointmentFilters = {}): Promise<Appointment[]> => {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  // Buscar agendamento por ID
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Criar agendamento
  create: async (appointment: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post('/appointments', appointment);
    return response.data;
  },

  // Atualizar agendamento
  update: async (request: UpdateAppointmentRequest): Promise<Appointment> => {
    const { id, ...data } = request;
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  // Excluir agendamento
  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  // Reagendar agendamento
  reschedule: async (id: string, newStartTime: string, reason?: string): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/reschedule`, {
      newStartTime,
      reason
    });
    return response.data;
  },

  // Cancelar agendamento
  cancel: async (id: string, reason: string): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Confirmar agendamento
  confirm: async (id: string): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Iniciar atendimento
  startSession: async (id: string): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/start`);
    return response.data;
  },

  // Finalizar atendimento
  completeSession: async (id: string, notes?: string): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/complete`, { notes });
    return response.data;
  },

  // Marcar como falta
  markNoShow: async (id: string): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/no-show`);
    return response.data;
  },

  // Verificar conflitos
  checkConflicts: async (appointment: Partial<CreateAppointmentRequest>): Promise<AppointmentConflict[]> => {
    const response = await api.post('/appointments/check-conflicts', appointment);
    return response.data;
  },

  // Buscar horários disponíveis
  getAvailableSlots: async (
    professionalId: string,
    date: string,
    duration: number = 60
  ): Promise<TimeSlot[]> => {
    const response = await api.get('/appointments/available-slots', {
      params: { professionalId, date, duration }
    });
    return response.data;
  },

  // Buscar agenda do dia
  getDaySchedule: async (date: string, professionalId?: string): Promise<DaySchedule> => {
    const response = await api.get('/appointments/day-schedule', {
      params: { date, professionalId }
    });
    return response.data;
  },

  // Buscar agenda da semana
  getWeekSchedule: async (
    startDate: string,
    professionalId?: string
  ): Promise<Record<string, DaySchedule>> => {
    const response = await api.get('/appointments/week-schedule', {
      params: { startDate, professionalId }
    });
    return response.data;
  },

  // Estatísticas
  getStats: async (
    startDate?: string,
    endDate?: string,
    professionalId?: string
  ): Promise<AppointmentStats> => {
    const response = await api.get('/appointments/stats', {
      params: { startDate, endDate, professionalId }
    });
    return response.data;
  },

  // Próximos agendamentos
  getUpcoming: async (limit: number = 10): Promise<Appointment[]> => {
    const response = await api.get('/appointments/upcoming', {
      params: { limit }
    });
    return response.data;
  },

  // Agendamentos atrasados
  getOverdue: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/overdue');
    return response.data;
  },

  // Buscar por paciente
  getByPatient: async (patientId: string, limit?: number): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/patient/${patientId}`, {
      params: { limit }
    });
    return response.data;
  },

  // Buscar por profissional
  getByProfessional: async (
    professionalId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/professional/${professionalId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Duplicar agendamento
  duplicate: async (
    id: string,
    newDate: string,
    modifications?: Partial<CreateAppointmentRequest>
  ): Promise<Appointment> => {
    const response = await api.post(`/appointments/${id}/duplicate`, {
      newDate,
      ...modifications
    });
    return response.data;
  },

  // Criar agendamentos recorrentes
  createRecurring: async (
    appointment: CreateAppointmentRequest & { recurringPattern: RecurringPattern }
  ): Promise<Appointment[]> => {
    const response = await api.post('/appointments/recurring', appointment);
    return response.data;
  },

  // Atualizar série recorrente
  updateRecurringSeries: async (
    seriesId: string,
    changes: Partial<UpdateAppointmentRequest>,
    updateType: 'this_only' | 'this_and_following' | 'all'
  ): Promise<Appointment[]> => {
    const response = await api.put(`/appointments/recurring/${seriesId}`, {
      changes,
      updateType
    });
    return response.data;
  },

  // Cancelar série recorrente
  cancelRecurringSeries: async (
    seriesId: string,
    reason: string,
    cancelType: 'this_only' | 'this_and_following' | 'all'
  ): Promise<void> => {
    await api.post(`/appointments/recurring/${seriesId}/cancel`, {
      reason,
      cancelType
    });
  },

  // Exportar agendamentos
  export: async (
    format: 'pdf' | 'excel' | 'csv',
    filters: AppointmentFilters = {}
  ): Promise<Blob> => {
    const response = await api.get('/appointments/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  // Imprimir agenda do dia
  printDaySchedule: async (date: string, professionalId?: string): Promise<Blob> => {
    const response = await api.get('/appointments/print/day-schedule', {
      params: { date, professionalId },
      responseType: 'blob'
    });
    return response.data;
  },

  // Notificações e lembretes
  notifications: {
    // Enviar confirmação
    sendConfirmation: async (appointmentId: string): Promise<void> => {
      await api.post(`/appointments/${appointmentId}/notifications/confirmation`);
    },

    // Enviar lembrete
    sendReminder: async (appointmentId: string, hoursBeore: number = 24): Promise<void> => {
      await api.post(`/appointments/${appointmentId}/notifications/reminder`, {
        hoursBeore
      });
    },

    // Enviar cancelamento
    sendCancellation: async (appointmentId: string, reason: string): Promise<void> => {
      await api.post(`/appointments/${appointmentId}/notifications/cancellation`, {
        reason
      });
    },

    // Configurar lembretes automáticos
    setupAutoReminders: async (appointmentId: string, reminders: number[]): Promise<void> => {
      await api.post(`/appointments/${appointmentId}/notifications/auto-reminders`, {
        reminders
      });
    }
  },

  // Integração com salas/recursos
  rooms: {
    // Listar salas disponíveis
    getAvailable: async (date: string, startTime: string, endTime: string): Promise<string[]> => {
      const response = await api.get('/appointments/rooms/available', {
        params: { date, startTime, endTime }
      });
      return response.data;
    },

    // Reservar sala
    reserve: async (appointmentId: string, roomId: string): Promise<void> => {
      await api.post(`/appointments/${appointmentId}/rooms/${roomId}/reserve`);
    },

    // Liberar sala
    release: async (appointmentId: string): Promise<void> => {
      await api.post(`/appointments/${appointmentId}/rooms/release`);
    }
  }
};

export default appointmentsAPI;