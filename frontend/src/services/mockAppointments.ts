// Sistema mock funcional para agendamentos
import { addDays, addHours, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addMinutes } from 'date-fns';
import type { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  AppointmentFilters,
  AppointmentStats,
  Professional,
  Patient
} from '@/types/appointments';

// Mock data para profissionais
const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    userId: '2',
    nome: 'Dra. Maria Silva',
    especialidade: 'Psicologia',
    ativo: true
  },
  {
    id: '2',
    userId: '3',
    nome: 'Dr. João Santos',
    especialidade: 'Fonoaudiologia',
    ativo: true
  },
  {
    id: '3',
    userId: '4',
    nome: 'Dra. Ana Costa',
    especialidade: 'Terapia Ocupacional',
    ativo: true
  }
];

// Mock data para pacientes
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    nome: 'Ana Beatriz Santos',
    contatos: { telefone: '(92) 99876-5432', email: 'ana@email.com' },
    responsavel: { nome: 'Maria Santos', telefone: '(92) 99876-5432' }
  },
  {
    id: '2',
    nome: 'Pedro Henrique Lima',
    contatos: { telefone: '(92) 98765-4321', email: 'pedro@email.com' },
    responsavel: { nome: 'João Lima', telefone: '(92) 98765-4321' }
  },
  {
    id: '3',
    nome: 'Sofia Oliveira',
    contatos: { telefone: '(92) 97654-3210', email: 'sofia@email.com' },
    responsavel: { nome: 'Carla Oliveira', telefone: '(92) 97654-3210' }
  },
  {
    id: '4',
    nome: 'Lucas Costa',
    contatos: { telefone: '(92) 96543-2109', email: 'lucas@email.com' },
    responsavel: { nome: 'Roberto Costa', telefone: '(92) 96543-2109' }
  },
  {
    id: '5',
    nome: 'Isabella Silva',
    contatos: { telefone: '(92) 95432-1098', email: 'isabella@email.com' },
    responsavel: { nome: 'Ana Silva', telefone: '(92) 95432-1098' }
  }
];

// Armazenamento mock dos agendamentos
let MOCK_APPOINTMENTS: Appointment[] = [];

// Gerar alguns agendamentos de exemplo
const generateMockAppointments = () => {
  const today = new Date();
  const appointments: Appointment[] = [];

  // Gerar agendamentos para os próximos 30 dias
  for (let i = 0; i < 30; i++) {
    const date = addDays(today, i);
    
    // Pular fins de semana (opcional)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Gerar 2-4 agendamentos por dia
    const numAppointments = Math.floor(Math.random() * 3) + 2;
    
    for (let j = 0; j < numAppointments; j++) {
      const startHour = 8 + j * 2 + Math.floor(Math.random() * 2);
      const startTime = new Date(date);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startHour + 1, 0, 0, 0);
      
      const professional = MOCK_PROFESSIONALS[Math.floor(Math.random() * MOCK_PROFESSIONALS.length)];
      const patient = MOCK_PATIENTS[Math.floor(Math.random() * MOCK_PATIENTS.length)];
      
      const statuses = ['agendado', 'confirmado', 'em_atendimento', 'atendido', 'falta', 'cancelado'];
      let status: any = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Para agendamentos passados, mais chance de estar atendido
      if (startTime < today) {
        status = Math.random() < 0.7 ? 'atendido' : Math.random() < 0.5 ? 'falta' : 'cancelado';
      }
      // Para agendamentos futuros, mais chance de estar agendado ou confirmado
      else {
        status = Math.random() < 0.5 ? 'agendado' : 'confirmado';
      }
      
      const appointment: Appointment = {
        id: `${i}-${j}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        professionalId: professional.id,
        inicio: startTime.toISOString(),
        fim: endTime.toISOString(),
        sala: `Sala ${j + 1}`,
        status: status,
        motivo: ['Consulta inicial', 'Retorno', 'Avaliação', 'Terapia'][Math.floor(Math.random() * 4)],
        notas: Math.random() < 0.3 ? 'Observações do agendamento' : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patient,
        professional,
        duration: 60,
        isRecurring: false,
        canEdit: true,
        canCancel: status !== 'atendido' && status !== 'cancelado',
        canReschedule: status === 'agendado' || status === 'confirmado',
        isToday: isSameDay(startTime, today),
        isPast: startTime < today,
        isFuture: startTime > today
      };
      
      appointments.push(appointment);
    }
  }
  
  return appointments.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
};

// Inicializar dados mock
MOCK_APPOINTMENTS = generateMockAppointments();

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAppointmentsAPI = {
  // Listar agendamentos
  list: async (filters: AppointmentFilters = {}): Promise<Appointment[]> => {
    await delay(500);
    
    let filtered = [...MOCK_APPOINTMENTS];
    
    // Filtrar por data
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(apt => new Date(apt.inicio) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(apt => new Date(apt.inicio) <= endDate);
    }
    
    // Filtrar por profissional
    if (filters.professionalId) {
      filtered = filtered.filter(apt => apt.professionalId === filters.professionalId);
    }
    
    // Filtrar por status
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter(apt => statuses.includes(apt.status));
    }
    
    // Filtrar por sala
    if (filters.sala) {
      filtered = filtered.filter(apt => apt.sala?.toLowerCase().includes(filters.sala!.toLowerCase()));
    }
    
    // Buscar por texto
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patient?.nome.toLowerCase().includes(search) ||
        apt.professional?.nome.toLowerCase().includes(search) ||
        apt.motivo?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  },

  // Criar agendamento
  create: async (data: CreateAppointmentData): Promise<Appointment> => {
    await delay(800);
    
    const professional = MOCK_PROFESSIONALS.find(p => p.id === data.professionalId);
    const patient = MOCK_PATIENTS.find(p => p.id === data.patientId);
    
    if (!professional || !patient) {
      throw new Error('Profissional ou paciente não encontrado');
    }
    
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: data.patientId,
      professionalId: data.professionalId,
      inicio: data.inicio,
      fim: data.fim,
      sala: data.sala || '',
      status: 'agendado',
      motivo: data.motivo || '',
      notas: data.notas || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient,
      professional,
      duration: Math.round((new Date(data.fim).getTime() - new Date(data.inicio).getTime()) / (1000 * 60)),
      isRecurring: data.isRecurring || false,
      canEdit: true,
      canCancel: true,
      canReschedule: true,
      isToday: isSameDay(new Date(data.inicio), new Date()),
      isPast: new Date(data.inicio) < new Date(),
      isFuture: new Date(data.inicio) > new Date()
    };
    
    MOCK_APPOINTMENTS.push(newAppointment);
    
    return newAppointment;
  },

  // Atualizar agendamento
  update: async (data: UpdateAppointmentData & { id: string }): Promise<Appointment> => {
    await delay(600);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === data.id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    const updated = {
      ...MOCK_APPOINTMENTS[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    MOCK_APPOINTMENTS[index] = updated;
    
    return updated;
  },

  // Excluir agendamento
  delete: async (id: string): Promise<void> => {
    await delay(400);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    MOCK_APPOINTMENTS.splice(index, 1);
  },

  // Confirmar agendamento
  confirm: async (id: string): Promise<Appointment> => {
    await delay(300);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    MOCK_APPOINTMENTS[index].status = 'confirmado';
    MOCK_APPOINTMENTS[index].updatedAt = new Date().toISOString();
    
    return MOCK_APPOINTMENTS[index];
  },

  // Iniciar atendimento
  startSession: async (id: string): Promise<Appointment> => {
    await delay(300);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    MOCK_APPOINTMENTS[index].status = 'em_atendimento';
    MOCK_APPOINTMENTS[index].sessionStartedAt = new Date().toISOString();
    MOCK_APPOINTMENTS[index].updatedAt = new Date().toISOString();
    
    return MOCK_APPOINTMENTS[index];
  },

  // Finalizar atendimento
  completeSession: async (id: string): Promise<Appointment> => {
    await delay(300);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    MOCK_APPOINTMENTS[index].status = 'atendido';
    MOCK_APPOINTMENTS[index].sessionEndedAt = new Date().toISOString();
    MOCK_APPOINTMENTS[index].updatedAt = new Date().toISOString();
    
    return MOCK_APPOINTMENTS[index];
  },

  // Cancelar agendamento
  cancel: async (id: string, reason: string): Promise<Appointment> => {
    await delay(300);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    MOCK_APPOINTMENTS[index].status = 'cancelado';
    MOCK_APPOINTMENTS[index].cancelReason = reason;
    MOCK_APPOINTMENTS[index].cancelledAt = new Date().toISOString();
    MOCK_APPOINTMENTS[index].updatedAt = new Date().toISOString();
    
    return MOCK_APPOINTMENTS[index];
  },

  // Marcar como falta
  markNoShow: async (id: string): Promise<Appointment> => {
    await delay(300);
    
    const index = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    
    MOCK_APPOINTMENTS[index].status = 'falta';
    MOCK_APPOINTMENTS[index].updatedAt = new Date().toISOString();
    
    return MOCK_APPOINTMENTS[index];
  },

  // Estatísticas
  getStats: async (startDate?: string, endDate?: string): Promise<AppointmentStats> => {
    await delay(400);
    
    let filtered = [...MOCK_APPOINTMENTS];
    
    if (startDate) {
      filtered = filtered.filter(apt => new Date(apt.inicio) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(apt => new Date(apt.inicio) <= new Date(endDate));
    }
    
    const byStatus = {
      agendado: filtered.filter(apt => apt.status === 'agendado').length,
      confirmado: filtered.filter(apt => apt.status === 'confirmado').length,
      em_atendimento: filtered.filter(apt => apt.status === 'em_atendimento').length,
      atendido: filtered.filter(apt => apt.status === 'atendido').length,
      falta: filtered.filter(apt => apt.status === 'falta').length,
      cancelado: filtered.filter(apt => apt.status === 'cancelado').length
    };
    
    const total = filtered.length;
    const completed = byStatus.atendido;
    const noShow = byStatus.falta;
    
    const today = new Date();
    const todayCount = filtered.filter(apt => isSameDay(new Date(apt.inicio), today)).length;
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekCount = filtered.filter(apt => {
      const date = new Date(apt.inicio);
      return date >= weekStart && date <= weekEnd;
    }).length;
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthCount = filtered.filter(apt => {
      const date = new Date(apt.inicio);
      return date >= monthStart && date <= monthEnd;
    }).length;
    
    const byProfessional = filtered.reduce((acc, apt) => {
      const name = apt.professional?.nome || 'Desconhecido';
      acc[name] = {
        name,
        count: (acc[name]?.count || 0) + 1,
        percentage: 0
      };
      return acc;
    }, {} as Record<string, { name: string; count: number; percentage: number }>);
    
    // Calcular percentuais
    Object.values(byProfessional).forEach(prof => {
      prof.percentage = (prof.count / total) * 100;
    });
    
    const peakHours = filtered.reduce((acc, apt) => {
      const hour = new Date(apt.inicio).getHours();
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      acc[hourStr] = (acc[hourStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      byStatus,
      byProfessional,
      byTimeOfDay: peakHours,
      byDayOfWeek: {},
      todayCount,
      weekCount,
      monthCount,
      averageDuration: 60,
      totalDuration: total * 60,
      completionRate: total > 0 ? completed / total : 0,
      noShowRate: total > 0 ? noShow / total : 0,
      cancellationRate: total > 0 ? byStatus.cancelado / total : 0,
      mostCommonServices: [],
      peakHours: Object.entries(peakHours)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      busiesttDays: []
    };
  },

  // Export usando o novo exportador
  export: async (format: 'pdf' | 'excel' | 'csv', filters: AppointmentFilters): Promise<void> => {
    await delay(500);
    
    // Filtrar agendamentos
    let filtered = [...MOCK_APPOINTMENTS];
    
    if (filters.startDate) {
      filtered = filtered.filter(apt => new Date(apt.inicio) >= new Date(filters.startDate!));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(apt => new Date(apt.inicio) <= new Date(filters.endDate!));
    }
    
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    
    if (filters.professionalId) {
      filtered = filtered.filter(apt => apt.professionalId === filters.professionalId);
    }

    // Importar dinamicamente o exportador
    const { AppointmentExporter } = await import('../utils/appointmentExporter');
    
    const exportOptions = {
      title: 'RELATÓRIO DE AGENDAMENTOS - SAPERE',
      clinicInfo: {
        name: 'Clínica Sapere',
        address: 'Endereço da Clínica',
        phone: '(11) 99999-9999',
        email: 'contato@sapere.com.br'
      },
      includeStatistics: true
    };

    if (format === 'pdf') {
      await AppointmentExporter.exportToPDF(filtered, filters, exportOptions);
    } else if (format === 'excel') {
      await AppointmentExporter.exportToExcel(filtered, filters, exportOptions);
    } else if (format === 'csv') {
      await AppointmentExporter.exportToCSV(filtered, filters, exportOptions);
    }
  }
};

// Utilitários para desenvolvimento
export const mockAppointmentUtils = {
  // Obter profissionais disponíveis
  getProfessionals: () => MOCK_PROFESSIONALS,
  
  // Obter pacientes disponíveis
  getPatients: () => MOCK_PATIENTS,
  
  // Resetar dados para estado inicial
  reset: () => {
    MOCK_APPOINTMENTS = generateMockAppointments();
  },
  
  // Adicionar paciente
  addPatient: (patient: Omit<Patient, 'id'>): Patient => {
    const newPatient = {
      ...patient,
      id: Math.random().toString(36).substr(2, 9)
    };
    MOCK_PATIENTS.push(newPatient);
    return newPatient;
  },
  
  // Obter estatísticas rápidas
  getQuickStats: () => {
    const today = new Date();
    const todayAppointments = MOCK_APPOINTMENTS.filter(apt => 
      isSameDay(new Date(apt.inicio), today)
    );
    
    return {
      total: MOCK_APPOINTMENTS.length,
      today: todayAppointments.length,
      confirmed: todayAppointments.filter(apt => apt.status === 'confirmado').length,
      inProgress: todayAppointments.filter(apt => apt.status === 'em_atendimento').length
    };
  }
};

export default mockAppointmentsAPI;