// Componente de visualização mensal do calendário

import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Clock, Users } from 'lucide-react';
import type { Appointment } from '@/types/appointments';

interface MonthViewProps {
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

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  onAppointmentClick,
  onCreateAppointment,
  loading,
  statusColors,
  statusLabels
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate month calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Week days header
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(parseISO(apt.inicio), date));
  };

  // Get appointment counts by status for a day
  const getDayStats = (date: Date) => {
    const dayAppts = getAppointmentsForDay(date);
    const stats = {
      total: dayAppts.length,
      agendado: 0,
      confirmado: 0,
      em_atendimento: 0,
      atendido: 0,
      falta: 0,
      cancelado: 0
    };

    dayAppts.forEach(apt => {
      stats[apt.status as keyof typeof stats]++;
    });

    return stats;
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onCreateAppointment(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Month Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-7">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Days */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {calendarDays.map((day) => {
            const dayStats = getDayStats(day);
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`border-r border-b border-gray-200 last:border-r-0 p-2 relative cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isSelected ? 'bg-sapere-orange/10' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {/* Day number */}
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(day) 
                      ? 'bg-sapere-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' 
                      : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Add appointment button */}
                  {isCurrentMonth && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateAppointment(day);
                      }}
                      className="opacity-0 hover:opacity-100 p-1 rounded hover:bg-sapere-orange/20 transition-all"
                    >
                      <Plus className="h-3 w-3 text-sapere-orange" />
                    </button>
                  )}
                </div>

                {/* Appointment indicators */}
                {dayStats.total > 0 && (
                  <div className="space-y-1">
                    {/* Show up to 3 appointments */}
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appointment);
                        }}
                        className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow ${
                          statusColors[appointment.status]
                        }`}
                        title={`${appointment.patient?.nome} - ${format(parseISO(appointment.inicio), 'HH:mm')}`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="h-2 w-2" />
                          <span className="truncate">
                            {format(parseISO(appointment.inicio), 'HH:mm')} {appointment.patient?.nome}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* More indicator */}
                    {dayStats.total > 3 && (
                      <div className="text-xs text-gray-600 text-center py-1">
                        +{dayStats.total - 3} mais
                      </div>
                    )}
                  </div>
                )}

                {/* Status indicators at bottom */}
                {dayStats.total > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                    <div className="flex gap-1">
                      {dayStats.agendado > 0 && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title={`${dayStats.agendado} agendado(s)`}></div>
                      )}
                      {dayStats.confirmado > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${dayStats.confirmado} confirmado(s)`}></div>
                      )}
                      {dayStats.em_atendimento > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title={`${dayStats.em_atendimento} em atendimento`}></div>
                      )}
                      {dayStats.atendido > 0 && (
                        <div className="w-2 h-2 bg-green-800 rounded-full" title={`${dayStats.atendido} atendido(s)`}></div>
                      )}
                      {dayStats.falta > 0 && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title={`${dayStats.falta} falta(s)`}></div>
                      )}
                      {dayStats.cancelado > 0 && (
                        <div className="w-2 h-2 bg-gray-500 rounded-full" title={`${dayStats.cancelado} cancelado(s)`}></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar with selected day details */}
      {selectedDate && (
        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, d MMMM', { locale: ptBR })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Day appointments */}
            <div className="space-y-3">
              {getAppointmentsForDay(selectedDate).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">Nenhum agendamento para este dia</p>
                  <button
                    onClick={() => onCreateAppointment(selectedDate)}
                    className="btn-primary text-sm"
                  >
                    Criar Agendamento
                  </button>
                </div>
              ) : (
                <>
                  {/* Day summary */}
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Resumo do Dia</h4>
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{getDayStats(selectedDate).total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Atendidos:</span>
                        <span className="font-medium text-green-600">{getDayStats(selectedDate).atendido}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointments list */}
                  {getAppointmentsForDay(selectedDate)
                    .sort((a, b) => parseISO(a.inicio).getTime() - parseISO(b.inicio).getTime())
                    .map((appointment) => (
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
                          <div className="text-gray-700">
                            {appointment.professional.nome}
                          </div>
                        )}
                        
                        {appointment.motivo && (
                          <div className="text-gray-700 font-medium">
                            {appointment.motivo}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthView;