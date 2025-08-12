// Contexto para gerenciar dados do dashboard em tempo real
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import mockAppointmentsAPI from '@/services/mockAppointments';
import mockPatientsAPI from '@/services/mockPatients';
import mockAnamneseAPI from '@/services/mockAnamnese';
import type { Appointment, Patient } from '@/types/appointments';

interface DashboardData {
  totalPatients: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  communicationsThisWeek: number;
  recordsThisMonth: number;
  anamnesisThisMonth: number;
  therapiesCompleted24h: number;
  therapiesCompleted7d: number;
  therapiesCompleted1m: number;
}

interface RecentActivity {
  id: string;
  type: 'patient_created' | 'appointment_completed' | 'appointment_scheduled' | 'anamnesis_created' | 'communication_sent';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  color: string;
}

interface TodaySession {
  id: string;
  patientName: string;
  patientInitials: string;
  professionalName: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'first_time';
  color: string;
}

interface DashboardContextType {
  data: DashboardData;
  recentActivities: RecentActivity[];
  todaySessions: TodaySession[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => void;
  updateSessionStatus: (sessionId: string, status: TodaySession['status']) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [data, setData] = useState<DashboardData>({
    totalPatients: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    communicationsThisWeek: 0,
    recordsThisMonth: 0,
    anamnesisThisMonth: 0,
    therapiesCompleted24h: 0,
    therapiesCompleted7d: 0,
    therapiesCompleted1m: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [loading, setLoading] = useState(true);

  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados reais das APIs
      const [patients, appointments, anamneseResult] = await Promise.all([
        mockPatientsAPI.list(),
        mockAppointmentsAPI.list(),
        mockAnamneseAPI.anamneses.search()
      ]);
      const anamneses = anamneseResult.anamneses;

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Calcular estatísticas
      const appointmentsToday = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= todayStart && aptDate < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      }).length;

      const appointmentsThisWeek = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= weekStart;
      }).length;

      const recordsThisMonth = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= monthStart && apt.status === 'completed';
      }).length;

      const anamnesisThisMonth = anamneses.filter((anamnesis: any) => {
        const anamnesisDate = new Date(anamnesis.criadoEm);
        return anamnesisDate >= monthStart;
      }).length;

      // Calcular terapias concluídas por período
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last1m = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const therapiesCompleted24h = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return apt.status === 'completed' && aptDate >= last24h;
      }).length;

      const therapiesCompleted7d = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return apt.status === 'completed' && aptDate >= last7d;
      }).length;

      const therapiesCompleted1m = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return apt.status === 'completed' && aptDate >= last1m;
      }).length;

      setData({
        totalPatients: patients.length,
        appointmentsToday,
        appointmentsThisWeek,
        communicationsThisWeek: 24, // Mock data
        recordsThisMonth,
        anamnesisThisMonth,
        therapiesCompleted24h,
        therapiesCompleted7d,
        therapiesCompleted1m,
      });

      // Gerar sessões de hoje
      const todayAppointments = appointments.filter((apt: Appointment) => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= todayStart && aptDate < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      });

      const sessions: TodaySession[] = todayAppointments.map((apt: Appointment) => {
        const patient = patients.find((p: Patient) => p.id === apt.patient_id);
        const patientName = patient ? patient.name : 'Paciente não encontrado';
        
        return {
          id: apt.id,
          patientName,
          patientInitials: generateInitials(patientName),
          professionalName: apt.therapist?.user?.name || 'Profissional',
          time: new Date(apt.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: apt.status as TodaySession['status'],
          color: getSessionColor(apt.status)
        };
      });

      setTodaySessions(sessions);

      // Gerar atividades recentes (baseadas em dados reais + algumas simuladas)
      const activities: RecentActivity[] = [];

      // Adicionar pacientes recentes
      const recentPatients = patients
        .sort((a: Patient, b: Patient) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 2);

      recentPatients.forEach((patient: Patient) => {
        activities.push({
          id: `patient-${patient.id}`,
          type: 'patient_created',
          title: 'Novo paciente',
          description: `cadastrado: ${patient.name}`,
          user: 'Admin',
          timestamp: getRelativeTime(new Date(patient.created_at || '')),
          color: 'bg-sapere-orange'
        });
      });

      // Adicionar anamneses recentes
      const recentAnamneses = anamneses
        .sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
        .slice(0, 2);

      recentAnamneses.forEach((anamnesis: any) => {
        activities.push({
          id: `anamnesis-${anamnesis.id}`,
          type: 'anamnesis_created',
          title: 'Nova anamnese',
          description: `criada para ${anamnesis.pacienteNome}`,
          user: anamnesis.criadoPor,
          timestamp: getRelativeTime(new Date(anamnesis.criadoEm)),
          color: 'bg-blue-500'
        });
      });

      // Adicionar consultas concluídas recentes
      const completedAppointments = appointments
        .filter((apt: Appointment) => apt.status === 'completed')
        .sort((a: Appointment, b: Appointment) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
        .slice(0, 2);

      completedAppointments.forEach((apt: Appointment) => {
        const patient = patients.find((p: Patient) => p.id === apt.patient_id);
        activities.push({
          id: `appointment-${apt.id}`,
          type: 'appointment_completed',
          title: 'Sessão finalizada',
          description: `com ${patient?.name || 'Paciente'}`,
          user: apt.therapist?.user?.name || 'Profissional',
          timestamp: getRelativeTime(new Date(apt.appointment_date)),
          color: 'bg-sapere-whatsapp'
        });
      });

      // Ordenar atividades por timestamp
      activities.sort((a, b) => {
        const timeA = parseRelativeTime(a.timestamp);
        const timeB = parseRelativeTime(b.timestamp);
        return timeA - timeB;
      });

      setRecentActivities(activities.slice(0, 4));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'bg-sapere-orange';
      case 'pending': return 'bg-sapere-yellow';
      case 'completed': return 'bg-green-500';
      case 'first_time': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    } else {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return `${Math.max(1, diffInMinutes)} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
    }
  };

  const parseRelativeTime = (timeStr: string): number => {
    if (timeStr.includes('minuto')) {
      const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      return minutes;
    } else if (timeStr.includes('hora')) {
      const hours = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      return hours * 60;
    } else if (timeStr.includes('dia')) {
      const days = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      return days * 24 * 60;
    }
    return 0;
  };

  const addActivity = (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: 'agora'
    };

    setRecentActivities(prev => [newActivity, ...prev.slice(0, 3)]);
  };

  const updateSessionStatus = (sessionId: string, status: TodaySession['status']) => {
    setTodaySessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status, color: getSessionColor(status) }
          : session
      )
    );
  };

  useEffect(() => {
    refreshData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider value={{
      data,
      recentActivities,
      todaySessions,
      loading,
      refreshData,
      addActivity,
      updateSessionStatus
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;