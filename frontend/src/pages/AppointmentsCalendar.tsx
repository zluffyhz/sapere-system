// Sistema completo de calendário de agendamentos

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  startOfMonth, 
  endOfMonth, 
  addDays,
  formatISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Search
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import mockAppointmentsAPI, { mockAppointmentUtils } from '@/services/mockAppointments';
import { useDashboardIntegration } from '@/hooks/useDashboardIntegration';
import { formatDate, formatDuration } from '@/utils/formatting';

import type { 
  Appointment, 
  ViewType, 
  AppointmentStatus,
  AppointmentFilters,
  Professional,
  Patient,
  AppointmentStats,
  DaySchedule
} from '@/types/appointments';

// Components
import WeekView from '@/components/appointments/WeekView';
import DayView from '@/components/appointments/DayView';
import MonthView from '@/components/appointments/MonthView';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import AppointmentFiltersPanel from '@/components/appointments/AppointmentFiltersPanel';
import QuickActionsPanel from '@/components/appointments/QuickActionsPanel';
import AppointmentsList from '@/components/appointments/AppointmentsList';

const AppointmentsCalendar: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const { notifyAppointmentScheduled, notifyAppointmentCompleted } = useDashboardIntegration();
  const navigate = useNavigate();

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status colors
  const statusColors = {
    agendado: 'bg-yellow-500 border-yellow-600 text-white',
    confirmado: 'bg-blue-500 border-blue-600 text-white',
    em_atendimento: 'bg-green-500 border-green-600 text-white',
    atendido: 'bg-green-800 border-green-900 text-white',
    falta: 'bg-red-500 border-red-600 text-white',
    cancelado: 'bg-gray-500 border-gray-600 text-white'
  };

  const statusLabels = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_atendimento: 'Em Atendimento',
    atendido: 'Atendido',
    falta: 'Falta',
    cancelado: 'Cancelado'
  };

  // Load initial data
  useEffect(() => {
    loadAppointments();
    loadProfessionals();
    loadPatients();
    loadStats();
  }, [currentDate, viewType, filters]);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      
      const dateFilters: AppointmentFilters = {
        ...filters,
        startDate: getDateRange().start,
        endDate: getDateRange().end,
        search: searchTerm || undefined
      };

      const data = await mockAppointmentsAPI.list(dateFilters);
      setAppointments(data);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewType, filters, searchTerm, error]);

  const loadProfessionals = async () => {
    try {
      const professionals = mockAppointmentUtils.getProfessionals();
      setProfessionals(professionals);
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
    }
  };

  const loadPatients = async () => {
    try {
      const patients = mockAppointmentUtils.getPatients();
      setPatients(patients);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await mockAppointmentsAPI.getStats(
        getDateRange().start,
        getDateRange().end
      );
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const getDateRange = () => {
    switch (viewType) {
      case 'day':
        return {
          start: formatISO(currentDate, { representation: 'date' }),
          end: formatISO(currentDate, { representation: 'date' })
        };
      case 'week':
        return {
          start: formatISO(startOfWeek(currentDate, { weekStartsOn: 1 }), { representation: 'date' }),
          end: formatISO(endOfWeek(currentDate, { weekStartsOn: 1 }), { representation: 'date' })
        };
      case 'month':
        return {
          start: formatISO(startOfMonth(currentDate), { representation: 'date' }),
          end: formatISO(endOfMonth(currentDate), { representation: 'date' })
        };
      default:
        return {
          start: formatISO(startOfWeek(currentDate, { weekStartsOn: 1 }), { representation: 'date' }),
          end: formatISO(endOfWeek(currentDate, { weekStartsOn: 1 }), { representation: 'date' })
        };
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Appointment actions
  const handleCreateAppointment = (date?: Date, time?: string) => {
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    try {
      await mockAppointmentsAPI.delete(appointmentId);
      success('Agendamento excluído com sucesso');
      loadAppointments();
    } catch (err) {
      error('Erro ao excluir agendamento');
    }
  };


  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      if (selectedAppointment) {
        await mockAppointmentsAPI.update({
          id: selectedAppointment.id,
          ...appointmentData
        });
        success('Agendamento atualizado com sucesso');
      } else {
        const newAppointment = await mockAppointmentsAPI.create(appointmentData);
        success('Agendamento criado com sucesso');
        
        // Notificar o dashboard sobre o novo agendamento
        const patient = patients.find(p => p.id === appointmentData.patientId);
        if (patient) {
          notifyAppointmentScheduled(patient.name, appointmentData.date);
        }
      }
      
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
      loadAppointments();
      loadStats();
    } catch (err) {
      error('Erro ao salvar agendamento');
    }
  };

  const handleStartTimer = (appointmentId: string) => {
    navigate(`/session/${appointmentId}`);
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await mockAppointmentsAPI.export(format, {
        ...filters,
        startDate: getDateRange().start,
        endDate: getDateRange().end
      });
      
      success(`Agendamentos exportados em ${format.toUpperCase()}`);
    } catch (err) {
      error('Erro ao exportar agendamentos');
    }
  };

  // Handle appointment actions (status changes, etc.)
  const handleAppointmentAction = async (appointmentId: string, action: string, newDateTime?: { start: Date; end: Date }) => {
    try {
      switch (action) {
        case 'confirm':
          await mockAppointmentsAPI.confirm(appointmentId);
          success('Agendamento confirmado');
          break;
        case 'start':
          await mockAppointmentsAPI.startSession(appointmentId);
          success('Sessão iniciada');
          break;
        case 'complete':
          await mockAppointmentsAPI.completeSession(appointmentId);
          success('Sessão concluída');
          
          // Notificar o dashboard sobre a sessão completada
          const completedAppointment = appointments.find(apt => apt.id === appointmentId);
          if (completedAppointment) {
            const patient = patients.find(p => p.id === completedAppointment.patientId);
            if (patient) {
              notifyAppointmentCompleted(patient.name, completedAppointment.professionalName);
            }
          }
          break;
        case 'cancel':
          await mockAppointmentsAPI.cancel(appointmentId, 'Cancelado pelo usuário');
          success('Agendamento cancelado');
          break;
        case 'no-show':
          await mockAppointmentsAPI.markNoShow(appointmentId, 'Paciente não compareceu');
          success('Marcado como falta');
          break;
        case 'reschedule':
          if (newDateTime) {
            await mockAppointmentsAPI.update({
              id: appointmentId,
              inicio: formatISO(newDateTime.start),
              fim: formatISO(newDateTime.end)
            });
            success('Agendamento reagendado');
          }
          break;
        default:
          console.warn(`Ação não reconhecida: ${action}`);
      }
      
      // Recarregar agendamentos após a ação
      loadAppointments();
      loadStats();
    } catch (err) {
      error(`Erro ao ${action} agendamento`);
      console.error(`Erro na ação ${action}:`, err);
    }
  };

  // Get title for current view
  const getViewTitle = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'EEEE, d MMMM yyyy', { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      default:
        return '';
    }
  };

  const renderCurrentView = () => {
    const props = {
      currentDate,
      appointments,
      onAppointmentClick: handleEditAppointment,
      onAppointmentAction: handleAppointmentAction,
      onCreateAppointment: handleCreateAppointment,
      onDeleteAppointment: handleDeleteAppointment,
      onStartTimer: handleStartTimer,
      loading,
      statusColors,
      statusLabels
    };

    switch (viewType) {
      case 'day':
        return <DayView {...props} />;
      case 'week':
        return <WeekView {...props} />;
      case 'month':
        return <MonthView {...props} />;
      default:
        return <WeekView {...props} />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title and Navigation */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Agenda
              </h1>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={goToToday}
                  className="btn-secondary text-sm px-3 py-1.5"
                >
                  Hoje
                </button>
                
                <button
                  onClick={goToNext}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <div className="text-lg font-semibold text-gray-900 ml-4">
                  {getViewTitle()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar agendamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                />
              </div>

              {/* View Type Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['day', 'week', 'month'] as ViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setViewType(view)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewType === view
                        ? 'bg-white text-sapere-brown shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {view === 'day' ? 'Dia' : view === 'week' ? 'Semana' : 'Mês'}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-sapere-orange text-white' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Ações
              </button>

              <button
                onClick={() => handleCreateAppointment()}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </button>

              <button
                onClick={loadAppointments}
                className="btn-secondary p-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Agendados: {stats.byStatus.agendado || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Confirmados: {stats.byStatus.confirmado || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Em Atendimento: {stats.byStatus.em_atendimento || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-800 rounded-full"></div>
                  <span>Atendidos: {stats.byStatus.atendido || 0}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {stats.total} | Taxa de conclusão: {(stats.completionRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <AppointmentFiltersPanel
            filters={filters}
            professionals={professionals}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Main Calendar View */}
        <div className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </div>
      </div>

      {/* Quick Actions Sidebar */}
      {showQuickActions && (
        <QuickActionsPanel
          appointments={appointments}
          onExport={handleExport}
          onClose={() => setShowQuickActions(false)}
          stats={stats}
        />
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          professionals={professionals}
          patients={patients}
          onSave={handleSaveAppointment}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsCalendar;