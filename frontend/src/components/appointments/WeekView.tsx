// Componente de visualização semanal do calendário

import React, { useState, useRef } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isToday,
  parseISO,
  setHours,
  setMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Clock, User, MapPin } from 'lucide-react';
import type { Appointment } from '@/types/appointments';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentAction: (id: string, action: string, newDateTime?: { start: Date; end: Date }) => void;
  onCreateAppointment: (date?: Date, time?: string) => void;
  onDeleteAppointment: (id: string) => void;
  loading: boolean;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  appointments,
  onAppointmentClick,
  onAppointmentAction,
  onCreateAppointment,
  loading,
  statusColors
  // statusLabels
}) => {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: Date; time: string } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Generate time slots (8:00 - 18:00)
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return { hour, minute, time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` };
  });

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(parseISO(apt.inicio), date));
  };

  // Get appointment position and size
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = parseISO(appointment.inicio);
    const end = parseISO(appointment.fim);
    
    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();
    
    // Calculate position (8:00 AM = 0)
    const startPosition = ((startHour - 8) * 60 + startMinute) / 30; // 30-minute slots
    const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 30;
    
    return {
      top: `${startPosition * 2}rem`, // 2rem per 30-minute slot
      height: `${duration * 2}rem`,
      position: 'absolute' as const,
      left: '0.25rem',
      right: '0.25rem',
      zIndex: 10
    };
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    console.log('Drag started for appointment:', appointment.id);
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(appointment));
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only set drop target if we actually have a dragged appointment
    if (draggedAppointment) {
      setDropTarget({ date, time });
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Drag ended');
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedAppointment(null);
    setDropTarget(null);
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    console.log('Drop event triggered for:', date, time);
    
    if (!draggedAppointment) {
      console.log('No dragged appointment found');
      return;
    }
    
    const [hour, minute] = time.split(':').map(Number);
    const newStart = setMinutes(setHours(date, hour), minute);
    
    // Calculate new end time based on original duration
    const originalStart = parseISO(draggedAppointment.inicio);
    const originalEnd = parseISO(draggedAppointment.fim);
    const duration = originalEnd.getTime() - originalStart.getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    
    // Check if the appointment is actually being moved to a different time
    const isSameDateTime = newStart.getTime() === originalStart.getTime();
    if (isSameDateTime) {
      console.log('Same date/time, not rescheduling');
      setDraggedAppointment(null);
      setDropTarget(null);
      return;
    }
    
    console.log('Rescheduling appointment from', originalStart, 'to', newStart);
    
    try {
      await onAppointmentAction(draggedAppointment.id, 'reschedule', {
        start: newStart,
        end: newEnd
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
    
    setDraggedAppointment(null);
    setDropTarget(null);
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, time: string) => {
    onCreateAppointment(date, time);
  };

  // Scroll to current time on mount
  React.useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour <= 18 && scrollContainerRef.current) {
      const scrollPosition = ((currentHour - 8) * 60) * (2 / 30) * 16; // 16px = 1rem
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition - 200);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Week Header */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {/* Time column header */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200 p-4">
          <div className="text-xs font-medium text-gray-500">Horário</div>
        </div>
        
        {/* Day headers */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`flex-1 p-4 text-center border-r border-gray-200 ${
              isToday(day) ? 'bg-sapere-orange/10' : ''
            }`}
          >
            <div className={`text-sm font-medium ${isToday(day) ? 'text-sapere-orange' : 'text-gray-900'}`}>
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={`text-lg font-semibold ${isToday(day) ? 'text-sapere-orange' : 'text-gray-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex min-h-full">
          {/* Time column */}
          <div className="w-20 flex-shrink-0 border-r border-gray-200">
            {timeSlots.map((slot, index) => (
              <div
                key={slot.time}
                className="h-8 border-b border-gray-100 flex items-center justify-end pr-2"
                style={{ borderBottomStyle: index % 2 === 1 ? 'solid' : 'dashed' }}
              >
                {index % 2 === 0 && (
                  <span className="text-xs text-gray-500 font-medium">
                    {slot.time}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            
            return (
              <div
                key={day.toISOString()}
                className="flex-1 border-r border-gray-200 relative"
              >
                {/* Time slots for this day */}
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot.time}
                    data-date={day.toISOString()}
                    data-time-slot={slot.time}
                    className={`h-8 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                      dropTarget?.date === day && dropTarget?.time === slot.time
                        ? 'bg-sapere-orange/20'
                        : ''
                    }`}
                    style={{ borderBottomStyle: index % 2 === 1 ? 'solid' : 'dashed' }}
                    onClick={() => handleTimeSlotClick(day, slot.time)}
                    onDragOver={(e) => handleDragOver(e, day, slot.time)}
                    onDrop={(e) => handleDrop(e, day, slot.time)}
                  >
                    {/* Empty slot indicator on hover */}
                    <div className="opacity-0 hover:opacity-100 flex items-center justify-center h-full transition-opacity">
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}

                {/* Appointments for this day */}
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, appointment)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onAppointmentClick(appointment)}
                    className={`rounded-lg p-2 cursor-move shadow-sm hover:shadow-md transition-all ${
                      statusColors[appointment.status]
                    } ${draggedAppointment?.id === appointment.id ? 'opacity-50' : ''}`}
                    style={getAppointmentStyle(appointment)}
                    title={`Arrastar para reagendar - ${appointment.patient?.nome}`}
                  >
                    <div className="text-xs font-medium truncate">
                      {appointment.patient?.nome}
                    </div>
                    <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(appointment.inicio), 'HH:mm')} - {format(parseISO(appointment.fim), 'HH:mm')}
                    </div>
                    {appointment.professional && (
                      <div className="text-xs opacity-90 flex items-center gap-1 mt-1 truncate">
                        <User className="h-3 w-3" />
                        {appointment.professional.nome}
                      </div>
                    )}
                    {appointment.sala && (
                      <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.sala}
                      </div>
                    )}
                  </div>
                ))}

                {/* Current time indicator */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 pointer-events-none"
                    style={{
                      top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) / 30 * 2}rem`
                    }}
                  >
                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;