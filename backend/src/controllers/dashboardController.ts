import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Simular dados que viriam do banco de dados
const getDashboardData = (userRole: string, userId: string) => {
  const baseData = {
    patients: [
      { id: 'p1', name: 'João Silva Santos', last_session: '2025-01-08', status: 'active' },
      { id: 'p2', name: 'Ana Maria Ferreira', last_session: '2025-01-03', status: 'active' },
      { id: 'p3', name: 'Carlos Eduardo Mendes', last_session: '2025-01-08', status: 'active' }
    ],
    appointments: [
      { 
        id: 'a1', 
        patient_name: 'João Silva Santos',
        therapist_name: 'Dra. Maria Silva',
        date: '2025-01-12T14:00:00Z',
        status: 'scheduled',
        type: 'individual'
      },
      { 
        id: 'a2', 
        patient_name: 'Ana Maria Ferreira',
        therapist_name: 'Dra. Maria Silva',
        date: '2025-01-10T09:00:00Z',
        status: 'confirmed',
        type: 'individual'
      },
      { 
        id: 'a3', 
        patient_name: 'Carlos Eduardo Mendes',
        therapist_name: 'Dra. Maria Silva',
        date: '2025-01-15T16:00:00Z',
        status: 'scheduled',
        type: 'individual'
      }
    ],
    communications: [
      { 
        id: 'c1', 
        type: 'whatsapp', 
        patient_name: 'João Silva Santos',
        message: 'Lembrete de consulta para amanhã',
        sent_at: '2025-01-11T10:00:00Z',
        status: 'delivered'
      },
      { 
        id: 'c2', 
        type: 'email', 
        patient_name: 'Ana Maria Ferreira',
        message: 'Relatório de progresso mensal',
        sent_at: '2025-01-05T14:30:00Z',
        status: 'read'
      }
    ],
    activities: [
      {
        id: 'ac1',
        type: 'appointment_completed',
        description: 'Sessão finalizada com João Silva Santos',
        user_name: 'Dra. Maria Silva',
        timestamp: '2025-01-08T15:30:00Z'
      },
      {
        id: 'ac2',
        type: 'patient_registered',
        description: 'Novo paciente cadastrado: Carlos Eduardo Mendes',
        user_name: 'Admin Sapere',
        timestamp: '2025-01-08T11:00:00Z'
      },
      {
        id: 'ac3',
        type: 'appointment_scheduled',
        description: 'Nova consulta agendada para Ana Maria Ferreira',
        user_name: 'Admin Sapere',
        timestamp: '2025-01-06T16:00:00Z'
      },
      {
        id: 'ac4',
        type: 'communication_sent',
        description: 'Lembrete via WhatsApp enviado para 3 pacientes',
        user_name: 'Sistema Automático',
        timestamp: '2025-01-06T09:00:00Z'
      }
    ]
  };

  // Filtrar dados baseado no role do usuário
  switch (userRole) {
    case 'admin':
      return baseData; // Admin vê todos os dados

    case 'therapist':
      return {
        ...baseData,
        // Terapeuta vê apenas seus pacientes e consultas
        patients: baseData.patients, // Em produção, filtrar por terapeuta
        appointments: baseData.appointments.filter(apt => apt.therapist_name === 'Dra. Maria Silva')
      };

    case 'responsible':
      // Responsável vê apenas dados de seus filhos
      const userPatients = ['João Silva Santos', 'Ana Maria Ferreira']; // Em produção, buscar da base
      return {
        patients: baseData.patients.filter(p => userPatients.includes(p.name)),
        appointments: baseData.appointments.filter(apt => userPatients.includes(apt.patient_name)),
        communications: baseData.communications.filter(comm => userPatients.includes(comm.patient_name)),
        activities: baseData.activities.filter(act => 
          userPatients.some(name => act.description.includes(name))
        )
      };

    default:
      return { patients: [], appointments: [], communications: [], activities: [] };
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const data = getDashboardData(user.role, user.id);
    
    // Calcular estatísticas baseadas nos dados filtrados
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

    const stats = {
      patients: {
        total: data.patients.length,
        active: data.patients.filter(p => p.status === 'active').length,
        new_this_month: Math.floor(data.patients.length * 0.2) // Simulado
      },
      appointments: {
        total: data.appointments.length,
        today: data.appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= today && aptDate < tomorrow;
        }).length,
        this_week: data.appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= thisWeekStart && aptDate < thisWeekEnd;
        }).length,
        pending_confirmation: data.appointments.filter(apt => apt.status === 'scheduled').length,
        confirmed: data.appointments.filter(apt => apt.status === 'confirmed').length
      },
      communications: {
        this_week: data.communications.filter(comm => {
          const commDate = new Date(comm.sent_at);
          return commDate >= thisWeekStart && commDate < thisWeekEnd;
        }).length,
        delivered: data.communications.filter(comm => comm.status === 'delivered').length,
        read: data.communications.filter(comm => comm.status === 'read').length
      }
    };

    // Próximas consultas (próximas 3)
    const upcomingAppointments = data.appointments
      .filter(apt => new Date(apt.date) > now && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    // Atividades recentes (últimas 5)
    const recentActivities = data.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    // Dados específicos por role
    let roleSpecificData = {};
    
    if (user.role === 'admin') {
      roleSpecificData = {
        therapists_count: 1, // Em produção, contar terapeutas ativos
        clinic_performance: {
          patient_satisfaction: 95,
          treatment_adherence: 98,
          average_response_time_minutes: 12
        },
        monthly_growth: {
          patients: 12,
          appointments: 8,
          communications: 18
        }
      };
    } else if (user.role === 'therapist') {
      roleSpecificData = {
        my_patients_count: data.patients.length,
        sessions_this_month: 22,
        next_available_slot: '2025-01-16T14:00:00Z',
        specialties: ['Psicologia', 'Neuropsicologia'],
        average_session_duration: 58
      };
    } else if (user.role === 'responsible') {
      roleSpecificData = {
        children_count: data.patients.length,
        next_appointment: upcomingAppointments[0] || null,
        unread_messages: 2,
        pending_tasks: [
          'Confirmar consulta de João para sexta-feira',
          'Preencher questionário de progresso de Ana'
        ]
      };
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      stats,
      upcoming_appointments: upcomingAppointments,
      recent_activities: recentActivities,
      ...roleSpecificData,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Dashboard específico para dados de calendário
export const getCalendarDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { start_date, end_date } = req.query;
    const startDate = start_date ? new Date(start_date as string) : new Date();
    const endDate = end_date ? new Date(end_date as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const data = getDashboardData(user.role, user.id);
    
    // Filtrar appointments por período
    const periodAppointments = data.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= endDate;
    });

    // Agrupar por dia
    const appointmentsByDay = periodAppointments.reduce((acc: any, apt) => {
      const day = apt.date.split('T')[0];
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(apt);
      return acc;
    }, {});

    // Horários disponíveis (simulado)
    const availableSlots = user.role === 'therapist' ? [
      '2025-01-13T09:00:00Z',
      '2025-01-13T14:00:00Z',
      '2025-01-14T10:30:00Z',
      '2025-01-16T15:00:00Z'
    ] : [];

    res.json({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      appointments_by_day: appointmentsByDay,
      available_slots: availableSlots,
      summary: {
        total_appointments: periodAppointments.length,
        confirmed: periodAppointments.filter(apt => apt.status === 'confirmed').length,
        pending: periodAppointments.filter(apt => apt.status === 'scheduled').length,
        busiest_day: Object.entries(appointmentsByDay)
          .reduce((max: any, [day, apts]: [string, any]) => 
            apts.length > (max.count || 0) ? { day, count: apts.length } : max, 
          {}
        )
      },
      user_role: user.role
    });

  } catch (error) {
    console.error('Erro ao buscar dados do calendário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export default {
  getDashboard,
  getCalendarDashboard
};