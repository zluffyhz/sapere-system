import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';
import WeeklyCalendar from '@/components/appointments/WeeklyCalendar';
import DailyCalendar from '@/components/appointments/DailyCalendar';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import DaySidebar from '@/components/appointments/DaySidebar';
import { useAuth } from '@/context/AuthContext';

export interface Appointment {
  id: string;
  patient_name: string;
  patient_id: string;
  therapist_name: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  service_type: string;
  notes?: string;
  is_first_appointment: boolean;
  patient_phone?: string;
  confirmation_sent?: boolean;
  reminder_sent_24h?: boolean;
  reminder_sent_2h?: boolean;
  checked_in_at?: string;
  waiting_time?: number;
}

type ViewType = 'week' | 'day';

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  // Mock data - em produção viria da API
  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock appointments
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patient_name: 'Ana Maria Silva',
          patient_id: '1',
          therapist_name: 'Dr. João Santos',
          therapist_id: '1',
          start_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 0), "yyyy-MM-dd'T'HH:mm:ss"),
          end_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0), "yyyy-MM-dd'T'HH:mm:ss"),
          status: 'confirmed',
          service_type: 'Terapia Ocupacional',
          is_first_appointment: false,
          patient_phone: '+5592999887766',
          confirmation_sent: true,
          reminder_sent_24h: true,
          reminder_sent_2h: false
        },
        {
          id: '2',
          patient_name: 'Pedro Costa',
          patient_id: '2',
          therapist_name: 'Dra. Maria Oliveira',
          therapist_id: '2',
          start_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 30), "yyyy-MM-dd'T'HH:mm:ss"),
          end_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 30), "yyyy-MM-dd'T'HH:mm:ss"),
          status: 'scheduled',
          service_type: 'Fonoaudiologia',
          is_first_appointment: true,
          patient_phone: '+5592988776655',
          confirmation_sent: false,
          reminder_sent_24h: false,
          reminder_sent_2h: false
        },
        {
          id: '3',
          patient_name: 'Lucas Santos',
          patient_id: '3',
          therapist_name: 'Dr. Carlos Lima',
          therapist_id: '3',
          start_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 14, 0), "yyyy-MM-dd'T'HH:mm:ss"),
          end_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 0), "yyyy-MM-dd'T'HH:mm:ss"),
          status: 'in_progress',
          service_type: 'Psicologia',
          is_first_appointment: false,
          patient_phone: '+5592977665544',
          confirmation_sent: true,
          reminder_sent_24h: true,
          reminder_sent_2h: true,
          checked_in_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          waiting_time: 5
        },
        {
          id: '4',
          patient_name: 'Maria Fernanda',
          patient_id: '4',
          therapist_name: 'Dra. Ana Paula',
          therapist_id: '4',
          start_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0), "yyyy-MM-dd'T'HH:mm:ss"),
          end_time: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 17, 0), "yyyy-MM-dd'T'HH:mm:ss"),
          status: 'completed',
          service_type: 'Fisioterapia',
          is_first_appointment: false,
          patient_phone: '+5592966554433',
          confirmation_sent: true,
          reminder_sent_24h: true,
          reminder_sent_2h: true,
          notes: 'Sessão muito produtiva. Paciente mostrou melhora significativa.'
        }
      ];
      
      setAppointments(mockAppointments);
      setLoading(false);
    };

    loadAppointments();
  }, [currentDate]);

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      scheduled: 'bg-sapere-orange border-sapere-orange text-white',
      confirmed: 'bg-blue-500 border-blue-500 text-white',
      in_progress: 'bg-green-500 border-green-500 text-white',
      completed: 'bg-green-800 border-green-800 text-white',
      no_show: 'bg-red-500 border-red-500 text-white',
      cancelled: 'bg-gray-500 border-gray-500 text-white'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em Atendimento',
      completed: 'Realizado',
      no_show: 'Não Compareceu',
      cancelled: 'Cancelado'
    };
    return labels[status];
  };

  const getStatusIcon = (status: Appointment['status']) => {
    const icons = {
      scheduled: <CalendarIcon className="h-4 w-4" />,
      confirmed: <CheckCircle className="h-4 w-4" />,
      in_progress: <Clock className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      no_show: <XCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />
    };
    return icons[status];
  };

  const navigatePrevious = () => {
    if (viewType === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const navigateNext = () => {
    if (viewType === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleNewAppointment = (date?: Date, time?: string) => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentSave = (appointment: Appointment) => {
    if (selectedAppointment) {
      // Update existing appointment
      setAppointments(prev => prev.map(app => 
        app.id === appointment.id ? appointment : app
      ));
    } else {
      // Add new appointment
      setAppointments(prev => [...prev, { ...appointment, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentDelete = (appointmentId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentMove = (appointment: Appointment, newDate: Date, newTime: string) => {
    // Calcular nova data e hora de fim baseada na duração original
    const originalStart = parseISO(appointment.start_time);
    const originalEnd = parseISO(appointment.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    const [hours, minutes] = newTime.split(':').map(Number);
    const newStart = new Date(newDate);
    newStart.setHours(hours, minutes, 0, 0);
    
    const newEnd = new Date(newStart.getTime() + duration);
    
    const updatedAppointment = {
      ...appointment,
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString()
    };
    
    setAppointments(prev => prev.map(app => 
      app.id === appointment.id ? updatedAppointment : app
    ));
    
    // Mostrar notificação de sucesso (opcional)
    console.log(`Sessão de ${appointment.patient_name} movida para ${format(newDate, 'dd/MM/yyyy')} às ${newTime}`);
  };

  const getCurrentPeriodText = () => {
    if (viewType === 'week') {
      const start = startOfWeek(currentDate, { locale: ptBR });
      const end = endOfWeek(currentDate, { locale: ptBR });
      return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM yyyy', { locale: ptBR })}`;
    } else {
      return format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
    }
  };

  const todayAppointments = appointments.filter(app => 
    isSameDay(parseISO(app.start_time), selectedDate)
  );

  return (
    <div className="h-full flex flex-col bg-sapere-gray">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-sapere-brown flex items-center space-x-2">
              <CalendarIcon className="h-6 w-6" />
              <span>Agenda</span>
            </h1>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{todayAppointments.length} sessões hoje</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'week' 
                    ? 'bg-white text-sapere-brown shadow-sm' 
                    : 'text-gray-600 hover:text-sapere-brown'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewType('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'day' 
                    ? 'bg-white text-sapere-brown shadow-sm' 
                    : 'text-gray-600 hover:text-sapere-brown'
                }`}
              >
                Dia
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={navigatePrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="text-lg font-semibold text-sapere-brown min-w-[200px] text-center">
                {getCurrentPeriodText()}
              </div>
              
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* New Appointment Button */}
            <button
              onClick={() => handleNewAppointment()}
              className="bg-sapere-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Sessão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando agenda...</p>
              </div>
            </div>
          ) : (
            <>
              {viewType === 'week' ? (
                <WeeklyCalendar
                  currentDate={currentDate}
                  appointments={appointments}
                  onAppointmentClick={handleAppointmentClick}
                  onNewAppointment={handleNewAppointment}
                  onDateChange={setSelectedDate}
                  onAppointmentMove={handleAppointmentMove}
                  getStatusColor={getStatusColor}
                />
              ) : (
                <DailyCalendar
                  currentDate={currentDate}
                  appointments={appointments}
                  onAppointmentClick={handleAppointmentClick}
                  onNewAppointment={handleNewAppointment}
                  onAppointmentMove={handleAppointmentMove}
                  getStatusColor={getStatusColor}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <DaySidebar
          date={selectedDate}
          appointments={todayAppointments}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onAppointmentClick={handleAppointmentClick}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getStatusIcon={getStatusIcon}
        />
      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAppointmentSave}
          onDelete={handleAppointmentDelete}
        />
      )}
    </div>
  );
};

export default Calendar;