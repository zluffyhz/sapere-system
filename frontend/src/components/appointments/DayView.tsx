// Componente de visualização diária do calendário

import React, { useState, useRef } from 'react';
import { 
  format, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Clock, User, MapPin, Phone, Bell, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import type { Appointment } from '@/types/appointments';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentAction: (id: string, action: string, newDateTime?: { start: Date; end: Date }) => void;
  onCreateAppointment: (date?: Date, time?: string) => void;
  onDeleteAppointment: (id: string) => void;
  onStartTimer?: (appointmentId: string) => void;
  loading: boolean;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentAction,
  onCreateAppointment,
  onStartTimer,
  loading,
  statusColors,
  statusLabels
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate time slots (7:00 - 19:00, every 15 minutes)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const totalMinutes = 7 * 60 + i * 15; // Start at 7:00 AM
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return {
      hour,
      minute,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      isHour: minute === 0
    };
  });

  // Get appointments for current day
  const dayAppointments = appointments.filter(apt => 
    isSameDay(parseISO(apt.inicio), currentDate)
  ).sort((a, b) => parseISO(a.inicio).getTime() - parseISO(b.inicio).getTime());

  // Get appointment position and size
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = parseISO(appointment.inicio);
    const end = parseISO(appointment.fim);
    
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    // Calculate position (7:00 AM = 0)
    const startPosition = ((startHour - 7) * 60 + startMinute) / 15; // 15-minute slots
    const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 15;
    
    return {
      top: `${startPosition * 1}rem`, // 1rem per 15-minute slot
      height: `${Math.max(duration * 1, 2)}rem`, // Minimum 2rem height
      left: '0.5rem',
      right: '0.5rem',
      position: 'absolute' as const,
      zIndex: 10
    };
  };

  // Handle time slot click
  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
    onCreateAppointment(currentDate, time);
  };

  // Get quick action buttons for appointment
  const getQuickActions = (appointment: Appointment) => {
    const actions = [];
    
    switch (appointment.status) {
      case 'agendado':
        actions.push(
          <button
            key="confirm"
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentAction(appointment.id, 'confirm');
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Confirmar"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        );
        break;
      case 'confirmado':
        actions.push(
          <button
            key="start"
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentAction(appointment.id, 'start');
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Iniciar Atendimento"
          >
            <PlayCircle className="h-4 w-4" />
          </button>
        );
        break;
      case 'em_atendimento':
        actions.push(
          <button
            key="complete"
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentAction(appointment.id, 'complete');
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Finalizar Atendimento"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        );
        break;
    }
    
    // Cancel/No-show actions (always available for non-completed appointments)
    if (!['atendido', 'cancelado', 'falta'].includes(appointment.status)) {
      actions.push(
        <button
          key="no-show"
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentAction(appointment.id, 'no-show');
          }}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Marcar como Falta"
        >
          <XCircle className="h-4 w-4" />
        </button>
      );
    }
    
    return actions;
  };

  // Scroll to current time on mount
  React.useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour <= 19 && scrollContainerRef.current) {
      const scrollPosition = ((currentHour - 7) * 60 + new Date().getMinutes()) * (1 / 15) * 16; // 16px = 1rem
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition - 200);
    }
  }, [currentDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white">
      {/* Main Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Day Header */}
        <div className="flex border-b border-gray-200 bg-gray-50 p-4">
          <div className="w-20 flex-shrink-0"></div>
          <div className={`flex-1 text-center ${isToday(currentDate) ? 'text-sapere-orange' : 'text-gray-900'}`}>
            <div className="text-lg font-semibold">
              {format(currentDate, 'EEEE, d MMMM yyyy', { locale: ptBR })}
            </div>
            <div className="text-sm text-gray-600">
              {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 border-r border-gray-200">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="h-4 border-b border-gray-100 flex items-center justify-end pr-2"
                  style={{ 
                    borderBottomStyle: slot.isHour ? 'solid' : 'dashed',
                    borderBottomWidth: slot.isHour ? '1px' : '0.5px'
                  }}
                >
                  {slot.isHour && (
                    <span className="text-xs text-gray-500 font-medium">
                      {slot.time}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Appointments column */}
            <div className="flex-1 relative">
              {/* Time slots */}
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`h-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                    selectedTimeSlot === slot.time ? 'bg-sapere-orange/20' : ''
                  }`}
                  style={{ 
                    borderBottomStyle: slot.isHour ? 'solid' : 'dashed',
                    borderBottomWidth: slot.isHour ? '1px' : '0.5px'
                  }}
                  onClick={() => handleTimeSlotClick(slot.time)}
                >
                  {/* Empty slot indicator on hover */}
                  <div className="opacity-0 hover:opacity-100 flex items-center justify-center h-full transition-opacity">
                    <Plus className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}

              {/* Appointments */}
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => onAppointmentClick(appointment)}
                  className={`rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-all ${
                    statusColors[appointment.status]
                  } group`}
                  style={getAppointmentStyle(appointment)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {appointment.patient?.nome}
                      </div>
                      <div className="text-xs opacity-90 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(appointment.inicio), 'HH:mm')} - {format(parseISO(appointment.fim), 'HH:mm')}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {getQuickActions(appointment)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {appointment.professional && (
                      <div className="text-xs opacity-90 flex items-center gap-1 truncate">
                        <User className="h-3 w-3" />
                        {appointment.professional.nome}
                      </div>
                    )}
                    
                    {appointment.sala && (
                      <div className="text-xs opacity-90 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.sala}
                      </div>
                    )}
                    
                    {appointment.patient?.contatos?.telefone && (
                      <div className="text-xs opacity-90 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {appointment.patient.contatos.telefone}
                      </div>
                    )}
                    
                    {appointment.motivo && (
                      <div className="text-xs opacity-90 truncate mt-1">
                        {appointment.motivo}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-1 right-1">
                    <div className="text-xs px-1.5 py-0.5 bg-white/20 rounded">
                      {statusLabels[appointment.status]}
                    </div>
                  </div>

                  {/* Notification indicators */}
                  {(appointment.confirmationSent || appointment.reminderSent24h) && (
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {appointment.confirmationSent && (
                        <Bell className="h-3 w-3 text-white/70" />
                      )}
                      {appointment.reminderSent24h && (
                        <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Current time indicator */}
              {isToday(currentDate) && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{
                    top: `${((new Date().getHours() - 7) * 60 + new Date().getMinutes()) / 15}rem`
                  }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="absolute right-2 -top-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                    {format(new Date(), 'HH:mm')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            Agendamentos do Dia
          </h3>
          
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum agendamento para hoje</p>
              <button
                onClick={() => onCreateAppointment(currentDate)}
                className="btn-primary mt-3 text-sm"
              >
                Criar Agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => onAppointmentClick(appointment)}
                  className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
                  style={{ borderLeftColor: statusColors[appointment.status].split(' ')[0].replace('bg-', '#') }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">
                      {appointment.patient?.nome}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[appointment.status]}`}>
                      {statusLabels[appointment.status]}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(appointment.inicio), 'HH:mm')} - {format(parseISO(appointment.fim), 'HH:mm')}
                    </div>
                    
                    {appointment.professional && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {appointment.professional.nome}
                      </div>
                    )}
                    
                    {appointment.sala && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.sala}
                      </div>
                    )}
                  </div>
                  
                  {appointment.motivo && (
                    <div className="text-xs text-gray-700 mt-2 font-medium">
                      {appointment.motivo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;