// Hook para integrar ações do sistema com o dashboard
import { useCallback } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { useSystemNotifications } from '@/context/SystemNotificationsContext';
import { useAuth } from '@/context/AuthContext';
import type { Patient } from '@/types/appointments';
import type { AnamneseCompartilhada } from '@/types/anamnese';

export const useDashboardIntegration = () => {
  const { addActivity, refreshData } = useDashboard();
  const { addNotification: addSystemNotification } = useSystemNotifications();
  const { user } = useAuth();

  const notifyPatientCreated = useCallback((patient: Patient) => {
    addActivity({
      type: 'patient_created',
      title: 'Novo paciente',
      description: `cadastrado: ${patient.name}`,
      user: user?.name || 'Sistema',
      color: 'bg-sapere-orange'
    });

    // Adicionar notificação do sistema
    addSystemNotification({
      type: 'patient_created',
      title: 'Novo paciente cadastrado',
      message: `${patient.name} foi adicionado ao sistema`,
      priority: 'normal',
      data: { patientId: patient.id }
    });
    
    // Atualizar dados do dashboard
    setTimeout(() => refreshData(), 1000);
  }, [addActivity, addSystemNotification, refreshData, user]);

  const notifyAppointmentScheduled = useCallback((patientName: string, date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const isToday = appointmentDate.toDateString() === today.toDateString();
    const isTomorrow = appointmentDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let description = `marcado para ${patientName}`;
    if (isToday) {
      description = `marcado para hoje - ${patientName}`;
    } else if (isTomorrow) {
      description = `marcado para amanhã - ${patientName}`;
    }

    addActivity({
      type: 'appointment_scheduled',
      title: 'Novo agendamento',
      description,
      user: user?.name || 'Sistema',
      color: 'bg-sapere-yellow'
    });

    // Adicionar notificação do sistema
    addSystemNotification({
      type: 'appointment_scheduled',
      title: 'Novo agendamento',
      message: `Consulta agendada para ${patientName} - ${appointmentDate.toLocaleDateString('pt-BR')}`,
      priority: isToday || isTomorrow ? 'high' : 'normal'
    });

    setTimeout(() => refreshData(), 1000);
  }, [addActivity, addSystemNotification, refreshData, user]);

  const notifyAppointmentCompleted = useCallback((patientName: string, professionalName: string) => {
    addActivity({
      type: 'appointment_completed',
      title: 'Sessão finalizada',
      description: `com ${patientName}`,
      user: professionalName || user?.name || 'Sistema',
      color: 'bg-sapere-whatsapp'
    });

    // Adicionar notificação do sistema
    addSystemNotification({
      type: 'appointment_completed',
      title: 'Sessão finalizada',
      message: `${professionalName} finalizou a sessão com ${patientName}`,
      priority: 'normal'
    });

    setTimeout(() => refreshData(), 1000);
  }, [addActivity, addSystemNotification, refreshData, user]);

  const notifyAnamneseCreated = useCallback((anamnese: AnamneseCompartilhada) => {
    addActivity({
      type: 'anamnesis_created',
      title: 'Nova anamnese',
      description: `criada para ${anamnese.pacienteNome}`,
      user: anamnese.criadoPor || user?.name || 'Sistema',
      color: 'bg-blue-500'
    });

    setTimeout(() => refreshData(), 1000);
  }, [addActivity, refreshData, user]);

  const notifyCommunicationSent = useCallback((recipientCount: number, type: string = 'WhatsApp') => {
    addActivity({
      type: 'communication_sent',
      title: 'Comunicação enviada',
      description: `via ${type} para ${recipientCount} paciente${recipientCount > 1 ? 's' : ''}`,
      user: user?.name || 'Sistema',
      color: 'bg-sapere-whatsapp'
    });

    setTimeout(() => refreshData(), 1000);
  }, [addActivity, refreshData, user]);

  const refreshDashboard = useCallback(() => {
    refreshData();
  }, [refreshData]);

  return {
    notifyPatientCreated,
    notifyAppointmentScheduled,
    notifyAppointmentCompleted,
    notifyAnamneseCreated,
    notifyCommunicationSent,
    refreshDashboard
  };
};

export default useDashboardIntegration;