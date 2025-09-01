import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Base de dados em memória para consultas
const APPOINTMENTS = [
  {
    id: 'a1',
    patient_id: 'p1',
    patient_name: 'João Silva Santos',
    therapist_id: '2',
    therapist_name: 'Dra. Maria Silva',
    appointment_date: '2025-01-12T14:00:00Z',
    duration: 60,
    timezone: 'America/Manaus',
    status: 'scheduled',
    confirmed_by_patient: false,
    confirmation_attempts: 0,
    appointment_type: 'individual',
    session_number: 25,
    location: 'Sala 1 - Consultório',
    notes: 'Sessão de acompanhamento - Avaliação do progresso escolar',
    preparation_notes: 'Trazer boletim escolar e atividades da semana',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
    created_by: '1',
    reminder_sent_at: null,
    reminder_count: 0
  },
  {
    id: 'a2',
    patient_id: 'p2',
    patient_name: 'Ana Maria Ferreira',
    therapist_id: '2',
    therapist_name: 'Dra. Maria Silva',
    appointment_date: '2025-01-10T09:00:00Z',
    duration: 60,
    timezone: 'America/Manaus',
    status: 'confirmed',
    confirmed_by_patient: true,
    confirmed_at: '2025-01-08T15:30:00Z',
    confirmation_attempts: 1,
    appointment_type: 'individual',
    session_number: 21,
    location: 'Sala 2 - Consultório',
    notes: 'Continuidade do trabalho de habilidades sociais',
    preparation_notes: 'Trazer desenhos e atividades realizadas em casa',
    created_at: '2025-01-03T14:20:00Z',
    updated_at: '2025-01-08T15:30:00Z',
    created_by: '1',
    reminder_sent_at: '2025-01-08T09:00:00Z',
    reminder_count: 1
  },
  {
    id: 'a3',
    patient_id: 'p3',
    patient_name: 'Carlos Eduardo Mendes',
    therapist_id: '2',
    therapist_name: 'Dra. Maria Silva',
    appointment_date: '2025-01-15T16:00:00Z',
    duration: 45,
    timezone: 'America/Manaus',
    status: 'scheduled',
    confirmed_by_patient: false,
    confirmation_attempts: 0,
    appointment_type: 'individual',
    session_number: 19,
    location: 'Sala 3 - Terapia Lúdica',
    notes: 'Trabalho focado em desenvolvimento da linguagem expressiva',
    preparation_notes: 'Trazer livros de histórias favoritos',
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-08T11:00:00Z',
    created_by: '2',
    reminder_sent_at: null,
    reminder_count: 0
  },
  {
    id: 'a4',
    patient_id: 'p1',
    patient_name: 'João Silva Santos',
    therapist_id: '2',
    therapist_name: 'Dra. Maria Silva',
    appointment_date: '2025-01-08T14:00:00Z',
    duration: 60,
    timezone: 'America/Manaus',
    status: 'completed',
    confirmed_by_patient: true,
    confirmed_at: '2025-01-06T12:00:00Z',
    confirmation_attempts: 1,
    appointment_type: 'individual',
    session_number: 24,
    location: 'Sala 1 - Consultório',
    notes: 'Sessão produtiva - Trabalho com técnicas de concentração',
    session_summary: 'Paciente demonstrou boa receptividade às estratégias apresentadas. Realizou atividades de atenção sustentada por 20 minutos consecutivos.',
    homework_assigned: 'Praticar técnicas de respiração 2x por dia',
    next_session_goals: 'Expandir tempo de concentração para 25 minutos',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-08T15:30:00Z',
    created_by: '1',
    reminder_sent_at: '2025-01-06T09:00:00Z',
    reminder_count: 1
  },
  {
    id: 'a5',
    patient_id: 'p2',
    patient_name: 'Ana Maria Ferreira',
    therapist_id: '2',
    therapist_name: 'Dra. Maria Silva',
    appointment_date: '2025-01-13T10:30:00Z',
    duration: 60,
    timezone: 'America/Manaus',
    status: 'cancelled',
    cancelled_reason: 'Paciente com febre',
    cancelled_at: '2025-01-12T08:00:00Z',
    cancelled_by: '1',
    appointment_type: 'individual',
    session_number: 20, // Não incrementado devido ao cancelamento
    location: 'Sala 2 - Consultório',
    notes: 'Reagendamento necessário',
    created_at: '2025-01-06T16:00:00Z',
    updated_at: '2025-01-12T08:00:00Z',
    created_by: '2',
    reminder_sent_at: '2025-01-11T10:00:00Z',
    reminder_count: 1
  }
];

console.log('📅 Consultas carregadas:', APPOINTMENTS.length);

// Listar consultas com filtros
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { 
      patient_id, 
      therapist_id, 
      status, 
      start_date, 
      end_date, 
      upcoming_only 
    } = req.query;

    let filteredAppointments = APPOINTMENTS;

    // Filtros de permissão por role
    if (user?.role === 'therapist') {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.therapist_id === user.id
      );
    } else if (user?.role === 'responsible') {
      // Responsáveis veem apenas consultas de seus pacientes
      const userPatients = ['p1', 'p2', 'p3']; // Em produção, buscar da base de dados
      filteredAppointments = filteredAppointments.filter(apt =>
        userPatients.includes(apt.patient_id)
      );
    }

    // Aplicar filtros
    if (patient_id) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.patient_id === patient_id
      );
    }

    if (therapist_id) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.therapist_id === therapist_id
      );
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.status === status
      );
    }

    if (start_date) {
      filteredAppointments = filteredAppointments.filter(apt => 
        new Date(apt.appointment_date) >= new Date(start_date as string)
      );
    }

    if (end_date) {
      filteredAppointments = filteredAppointments.filter(apt => 
        new Date(apt.appointment_date) <= new Date(end_date as string)
      );
    }

    if (upcoming_only === 'true') {
      const now = new Date();
      filteredAppointments = filteredAppointments.filter(apt => 
        new Date(apt.appointment_date) > now && apt.status !== 'cancelled'
      );
    }

    // Ordenar por data
    filteredAppointments.sort((a, b) => 
      new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    );

    res.json({
      appointments: filteredAppointments,
      total: filteredAppointments.length,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar consulta específica
export const getAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;

    const appointment = APPOINTMENTS.find(apt => apt.id === appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    // Verificar permissões
    if (user?.role === 'therapist' && appointment.therapist_id !== user.id) {
      return res.status(403).json({ error: 'Acesso negado a esta consulta' });
    }

    if (user?.role === 'responsible') {
      const userPatients = ['p1', 'p2', 'p3']; // Em produção, buscar da base de dados
      if (!userPatients.includes(appointment.patient_id)) {
        return res.status(403).json({ error: 'Acesso negado a esta consulta' });
      }
    }

    res.json({
      appointment,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova consulta
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // Apenas Admin e Terapeuta podem criar consultas
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    const appointmentData = req.body;
    
    // Validar se a data/hora está disponível
    const conflictingAppointment = APPOINTMENTS.find(apt => 
      apt.therapist_id === appointmentData.therapist_id &&
      apt.status !== 'cancelled' &&
      new Date(apt.appointment_date).getTime() === new Date(appointmentData.appointment_date).getTime()
    );

    if (conflictingAppointment) {
      return res.status(400).json({ 
        error: 'Horário não disponível',
        conflicting_appointment: conflictingAppointment.id
      });
    }

    const newAppointment = {
      id: `a${APPOINTMENTS.length + 1}`,
      ...appointmentData,
      status: 'scheduled',
      confirmed_by_patient: false,
      confirmation_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
      reminder_sent_at: null,
      reminder_count: 0
    };

    APPOINTMENTS.push(newAppointment);

    res.status(201).json({
      message: 'Consulta criada com sucesso',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar consulta
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;
    
    // Apenas Admin e Terapeuta podem atualizar consultas
    if (!['admin', 'therapist'].includes(user?.role || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    const appointmentIndex = APPOINTMENTS.findIndex(apt => apt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const currentAppointment = APPOINTMENTS[appointmentIndex];
    
    // Terapeutas só podem atualizar suas próprias consultas
    if (user?.role === 'therapist' && currentAppointment.therapist_id !== user.id) {
      return res.status(403).json({ error: 'Acesso negado a esta consulta' });
    }

    const updatedAppointment = {
      ...currentAppointment,
      ...req.body,
      updated_at: new Date().toISOString(),
      id: appointmentId // Garantir que o ID não seja alterado
    };

    APPOINTMENTS[appointmentIndex] = updatedAppointment;

    res.json({
      message: 'Consulta atualizada com sucesso',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Confirmar consulta
export const confirmAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;

    const appointmentIndex = APPOINTMENTS.findIndex(apt => apt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const appointment = APPOINTMENTS[appointmentIndex];

    // Verificar permissões
    if (user?.role === 'responsible') {
      const userPatients = ['p1', 'p2', 'p3']; // Em produção, buscar da base de dados
      if (!userPatients.includes(appointment.patient_id)) {
        return res.status(403).json({ error: 'Acesso negado a esta consulta' });
      }
    }

    APPOINTMENTS[appointmentIndex] = {
      ...appointment,
      status: 'confirmed',
      confirmed_by_patient: true,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any;

    res.json({
      message: 'Consulta confirmada com sucesso',
      appointment: APPOINTMENTS[appointmentIndex]
    });
  } catch (error) {
    console.error('Erro ao confirmar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Cancelar consulta
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const user = req.user;

    const appointmentIndex = APPOINTMENTS.findIndex(apt => apt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const appointment = APPOINTMENTS[appointmentIndex];

    // Verificar permissões
    let canCancel = false;
    if (['admin', 'therapist'].includes(user?.role || '')) {
      canCancel = true;
    } else if (user?.role === 'responsible') {
      const userPatients = ['p1', 'p2', 'p3']; // Em produção, buscar da base de dados
      canCancel = userPatients.includes(appointment.patient_id);
    }

    if (!canCancel) {
      return res.status(403).json({ error: 'Acesso negado para cancelar esta consulta' });
    }

    APPOINTMENTS[appointmentIndex] = {
      ...appointment,
      status: 'cancelled',
      cancelled_reason: reason || 'Não especificado',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      updated_at: new Date().toISOString()
    } as any;

    res.json({
      message: 'Consulta cancelada com sucesso',
      appointment: APPOINTMENTS[appointmentIndex]
    });
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Finalizar consulta (marcar como concluída)
export const completeAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { session_summary, homework_assigned, next_session_goals } = req.body;
    const user = req.user;

    // Apenas terapeutas podem finalizar consultas
    if (user?.role !== 'therapist') {
      return res.status(403).json({ error: 'Apenas terapeutas podem finalizar consultas' });
    }

    const appointmentIndex = APPOINTMENTS.findIndex(apt => apt.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const appointment = APPOINTMENTS[appointmentIndex];

    if (appointment.therapist_id !== user.id) {
      return res.status(403).json({ error: 'Acesso negado a esta consulta' });
    }

    APPOINTMENTS[appointmentIndex] = {
      ...appointment,
      status: 'completed',
      session_summary,
      homework_assigned,
      next_session_goals,
      updated_at: new Date().toISOString()
    };

    res.json({
      message: 'Consulta finalizada com sucesso',
      appointment: APPOINTMENTS[appointmentIndex]
    });
  } catch (error) {
    console.error('Erro ao finalizar consulta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Estatísticas das consultas
export const getAppointmentsStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let filteredAppointments = APPOINTMENTS;

    // Aplicar filtros de permissão
    if (user?.role === 'therapist') {
      filteredAppointments = filteredAppointments.filter(apt => 
        apt.therapist_id === user.id
      );
    } else if (user?.role === 'responsible') {
      const userPatients = ['p1', 'p2', 'p3'];
      filteredAppointments = filteredAppointments.filter(apt =>
        userPatients.includes(apt.patient_id)
      );
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      total: filteredAppointments.length,
      by_status: filteredAppointments.reduce((acc: any, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {}),
      today: filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= today && aptDate < tomorrow;
      }).length,
      upcoming: filteredAppointments.filter(apt => 
        new Date(apt.appointment_date) > now && apt.status !== 'cancelled'
      ).length,
      this_week: filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return aptDate >= weekStart && aptDate < weekEnd;
      }).length,
      completion_rate: filteredAppointments.length > 0 
        ? Math.round((filteredAppointments.filter(apt => apt.status === 'completed').length / filteredAppointments.length) * 100)
        : 0
    };

    res.json({
      stats,
      user_role: user?.role
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export default {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAppointmentsStats
};