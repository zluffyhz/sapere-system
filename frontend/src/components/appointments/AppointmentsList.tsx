// Visualização em lista dos agendamentos

import React, { useState } from 'react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  FileText,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  PlayCircle,
  Edit3,
  Trash2,
  Bell,
  Timer
} from 'lucide-react';

import type { Appointment } from '@/types/appointments';

interface AppointmentsListProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentAction: (id: string, action: string) => void;
  onDeleteAppointment: (id: string) => void;
  onStartTimer?: (appointmentId: string) => void;
  loading?: boolean;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  onAppointmentClick,
  onAppointmentAction,
  onDeleteAppointment,
  onStartTimer,
  loading = false,
  statusColors,
  statusLabels
}) => {
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = parseISO(appointment.inicio).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Sort dates and appointments within each date
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  sortedDates.forEach(date => {
    groupedAppointments[date].sort((a, b) => 
      parseISO(a.inicio).getTime() - parseISO(b.inicio).getTime()
    );
  });

  const getQuickActions = (appointment: Appointment) => {
    const actions = [];
    const appointmentDate = parseISO(appointment.inicio);
    const isTodayAppointment = isToday(appointmentDate);
    
    // Timer action (for confirmed appointments TODAY)
    if (appointment.status === 'confirmado' && isTodayAppointment && onStartTimer) {
      actions.push({
        key: 'timer',
        label: 'Iniciar Sessão',
        icon: Timer,
        onClick: () => onStartTimer(appointment.id),
        color: 'text-sapere-orange hover:text-sapere-brown'
      });
    }

    // Edit action
    actions.push({
      key: 'edit',
      label: 'Editar',
      icon: Edit3,
      onClick: () => onAppointmentClick(appointment),
      color: 'text-blue-600 hover:text-blue-800'
    });

    // Status-specific actions
    switch (appointment.status) {
      case 'agendado':
        actions.push({
          key: 'confirm',
          label: 'Confirmar',
          icon: CheckCircle,
          onClick: () => onAppointmentAction(appointment.id, 'confirm'),
          color: 'text-green-600 hover:text-green-800'
        });
        break;
      case 'confirmado':
        actions.push({
          key: 'start',
          label: 'Iniciar',
          icon: PlayCircle,
          onClick: () => onAppointmentAction(appointment.id, 'start'),
          color: 'text-green-600 hover:text-green-800'
        });
        break;
      case 'em_atendimento':
        actions.push({
          key: 'complete',
          label: 'Finalizar',
          icon: CheckCircle,
          onClick: () => onAppointmentAction(appointment.id, 'complete'),
          color: 'text-green-600 hover:text-green-800'
        });
        break;
    }

    // Cancel/No-show actions (for non-completed appointments)
    if (!['atendido', 'cancelado', 'falta'].includes(appointment.status)) {
      actions.push({
        key: 'no-show',
        label: 'Marcar Falta',
        icon: XCircle,
        onClick: () => onAppointmentAction(appointment.id, 'no-show'),
        color: 'text-red-600 hover:text-red-800'
      });
    }

    // Delete action
    if (['agendado', 'cancelado'].includes(appointment.status)) {
      actions.push({
        key: 'delete',
        label: 'Excluir',
        icon: Trash2,
        onClick: () => onDeleteAppointment(appointment.id),
        color: 'text-red-600 hover:text-red-800'
      });
    }

    return actions;
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Hoje';
    } else if (isPast(date)) {
      return format(date, 'EEEE, d \'de\' MMMM', { locale: ptBR });
    } else {
      return format(date, 'EEEE, d \'de\' MMMM', { locale: ptBR });
    }
  };

  const getDurationMinutes = (appointment: Appointment) => {
    const start = parseISO(appointment.inicio);
    const end = parseISO(appointment.fim);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
        <p className="text-gray-500">
          Não há agendamentos para o período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="divide-y divide-gray-200">
        {sortedDates.map(dateString => {
          const date = new Date(dateString);
          const dayAppointments = groupedAppointments[dateString];
          
          return (
            <div key={dateString} className="py-6">
              {/* Date Header */}
              <div className={`sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-3 ${
                isToday(date) ? 'bg-sapere-orange/10 border-sapere-orange/20' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${
                    isToday(date) ? 'text-sapere-brown' : 'text-gray-900'
                  }`}>
                    {getDateLabel(dateString)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}</span>
                    <span className="text-xs">
                      {format(date, 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointments for this date */}
              <div className="px-6">
                <div className="space-y-4">
                  {dayAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="relative group"
                    >
                      <div 
                        className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          isPast(parseISO(appointment.fim)) && appointment.status !== 'atendido' 
                            ? 'border-l-4 border-l-red-300' 
                            : isToday(parseISO(appointment.inicio)) && appointment.status === 'confirmado'
                            ? 'border-l-4 border-l-green-300'
                            : ''
                        }`}
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <div className="flex items-start justify-between">
                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              {/* Time */}
                              <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                <Clock className="h-4 w-4" />
                                {format(parseISO(appointment.inicio), 'HH:mm')} - {format(parseISO(appointment.fim), 'HH:mm')}
                                <span className="text-xs text-gray-500">
                                  ({getDurationMinutes(appointment)}min)
                                </span>
                              </div>

                              {/* Status Badge */}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                                {statusLabels[appointment.status]}
                              </span>
                            </div>

                            {/* Patient */}
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {appointment.patient?.nome}
                              </span>
                              {appointment.patient?.contatos?.telefone && (
                                <a
                                  href={`tel:${appointment.patient.contatos.telefone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-sapere-orange hover:text-sapere-orange-dark"
                                >
                                  <Phone className="h-3 w-3" />
                                </a>
                              )}
                            </div>

                            {/* Professional */}
                            {appointment.professional && (
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {appointment.professional.nome}
                                </span>
                                {appointment.professional.especialidade && (
                                  <span className="text-xs text-gray-500">
                                    • {appointment.professional.especialidade}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Room */}
                            {appointment.sala && (
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {appointment.sala}
                                </span>
                              </div>
                            )}

                            {/* Reason/Notes */}
                            {(appointment.motivo || appointment.notas) && (
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                <div className="text-sm text-gray-600">
                                  {appointment.motivo && (
                                    <div className="font-medium">{appointment.motivo}</div>
                                  )}
                                  {appointment.notas && (
                                    <div className="text-gray-500 mt-1">{appointment.notas}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Notifications */}
                            {(appointment.confirmationSent || appointment.reminderSent24h) && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                <Bell className="h-3 w-3 text-gray-400" />
                                <div className="text-xs text-gray-500">
                                  {appointment.confirmationSent && (
                                    <span className="mr-2">Confirmação enviada</span>
                                  )}
                                  {appointment.reminderSent24h && (
                                    <span>Lembrete enviado</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActions(showActions === appointment.id ? null : appointment.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </button>

                            {showActions === appointment.id && (
                              <div 
                                className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getQuickActions(appointment).map(action => (
                                  <button
                                    key={action.key}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick();
                                      setShowActions(null);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${action.color}`}
                                  >
                                    <action.icon className="h-3 w-3" />
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(null)}
        ></div>
      )}
    </div>
  );
};

export default AppointmentsList;