import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Calendar, Clock, User, Trash2, Edit } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onAppointmentMove?: (appointmentId: string, newDate: string, newTime: string) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
  onAppointmentDelete?: (appointmentId: string) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  appointments,
  onAppointmentMove,
  onAppointmentEdit,
  onAppointmentDelete
}) => {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    generateWeekDays(currentWeek);
  }, [currentWeek]);

  const generateWeekDays = (date: Date) => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Domingo

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    setWeekDays(week);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getDayName = (date: Date): string => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  const getAppointmentsForDayAndTime = (date: Date, time: string): Appointment[] => {
    const dateStr = formatDate(date);
    return appointments.filter(apt =>
      apt.date === dateStr && apt.time === time
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const [newDate, newTime] = destination.droppableId.split('_');

    if (onAppointmentMove) {
      onAppointmentMove(draggableId, newDate, newTime);
    }
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      scheduled: 'bg-blue-100 border-blue-300 text-blue-800',
      confirmed: 'bg-green-100 border-green-300 text-green-800',
      completed: 'bg-gray-100 border-gray-300 text-gray-600',
      cancelled: 'bg-red-100 border-red-300 text-red-600'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sapere-orange" />
            <h2 className="text-2xl font-bold text-gray-900">Calendário Semanal</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousWeek}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ← Anterior
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-sapere-orange text-white hover:bg-orange-600 rounded-lg transition-colors"
            >
              Hoje
            </button>

            <button
              onClick={nextWeek}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Próxima →
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-600">
          Arraste e solte os agendamentos para reorganizar
        </p>
      </div>

      {/* Calendar Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 bg-gray-50 font-semibold text-gray-600 text-sm">
                Horário
              </div>
              {weekDays.map((day, idx) => {
                const isToday = formatDate(day) === formatDate(new Date());
                return (
                  <div
                    key={idx}
                    className={`p-3 text-center border-l border-gray-200 ${
                      isToday ? 'bg-sapere-orange text-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">{getDayName(day)}</div>
                    <div className={`text-xs ${isToday ? 'text-white' : 'text-gray-500'}`}>
                      {day.getDate()}/{day.getMonth() + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-200">
                {/* Time Column */}
                <div className="p-3 bg-gray-50 font-semibold text-gray-600 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {time}
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIdx) => {
                  const dateStr = formatDate(day);
                  const dayAppointments = getAppointmentsForDayAndTime(day, time);
                  const droppableId = `${dateStr}_${time}`;

                  return (
                    <Droppable key={droppableId} droppableId={droppableId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-2 border-l border-gray-200 min-h-[80px] transition-colors ${
                            snapshot.isDraggingOver
                              ? 'bg-blue-50'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          {dayAppointments.map((apt, idx) => (
                            <Draggable
                              key={apt.id}
                              draggableId={apt.id}
                              index={idx}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-2 p-2 rounded-lg border-2 cursor-move ${getStatusColor(
                                    apt.status
                                  )} ${
                                    snapshot.isDragging ? 'opacity-75 shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 mb-1">
                                        <User className="w-3 h-3 flex-shrink-0" />
                                        <p className="text-xs font-semibold truncate">
                                          {apt.patientName}
                                        </p>
                                      </div>
                                      <p className="text-xs truncate">{apt.type}</p>
                                      <p className="text-xs font-medium">
                                        {apt.duration} min
                                      </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-1">
                                      {onAppointmentEdit && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onAppointmentEdit(apt);
                                          }}
                                          className="p-1 hover:bg-white/50 rounded"
                                          title="Editar"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                      )}
                                      {onAppointmentDelete && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Deseja excluir este agendamento?')) {
                                              onAppointmentDelete(apt.id);
                                            }
                                          }}
                                          className="p-1 hover:bg-white/50 rounded text-red-600"
                                          title="Excluir"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-semibold text-gray-700">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span>Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
