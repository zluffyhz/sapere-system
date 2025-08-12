// Modal para criação e edição de agendamentos

import React, { useState, useEffect } from 'react';
import { format, parseISO, formatISO } from 'date-fns';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  FileText,
  Repeat,
  // AlertCircle
} from 'lucide-react';

import type { 
  Appointment, 
  Professional, 
  Patient, 
  AppointmentFormData,
  RecurrenceType,
  CreateAppointmentData,
  UpdateAppointmentData
} from '@/types/appointments';

interface AppointmentModalProps {
  appointment: Appointment | null;
  professionals: Professional[];
  patients: Patient[];
  onSave: (data: CreateAppointmentData | UpdateAppointmentData) => void;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  professionals,
  patients,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient: null,
    professional: null,
    date: formatISO(new Date(), { representation: 'date' }),
    startTime: '08:00',
    endTime: '09:00',
    duration: 60,
    sala: '',
    motivo: '',
    notas: '',
    isRecurring: false,
    recurringType: 'none',
    recurringInterval: 1,
    recurringDays: [],
    recurringEndDate: '',
    recurringOccurrences: 10
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (appointment) {
      const startDate = parseISO(appointment.inicio);
      const endDate = parseISO(appointment.fim);
      
      setFormData({
        patient: appointment.patient || null,
        professional: appointment.professional || null,
        date: formatISO(startDate, { representation: 'date' }),
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
        sala: appointment.sala || '',
        motivo: appointment.motivo || '',
        notas: appointment.notas || '',
        isRecurring: appointment.isRecurring,
        recurringType: appointment.recurringPattern?.type || 'none',
        recurringInterval: appointment.recurringPattern?.interval || 1,
        recurringDays: appointment.recurringPattern?.daysOfWeek || [],
        recurringEndDate: appointment.recurringPattern?.endDate || '',
        recurringOccurrences: appointment.recurringPattern?.occurrences || 10
      });
    }
  }, [appointment]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient) {
      newErrors.patient = 'Selecione um paciente';
    }

    if (!formData.professional) {
      newErrors.professional = 'Selecione um profissional';
    }

    if (!formData.date) {
      newErrors.date = 'Selecione uma data';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Selecione o horário de início';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Selecione o horário de término';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'O horário de término deve ser após o início';
    }

    if (formData.isRecurring && formData.recurringType !== 'none') {
      if (!formData.recurringEndDate && !formData.recurringOccurrences) {
        newErrors.recurring = 'Defina quando a recorrência deve terminar';
      }

      if (formData.recurringType === 'weekly' && formData.recurringDays?.length === 0) {
        newErrors.recurringDays = 'Selecione pelo menos um dia da semana';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

      const baseData = {
        patientId: formData.patient!.id,
        professionalId: formData.professional!.id,
        inicio: formatISO(startDateTime),
        fim: formatISO(endDateTime),
        sala: formData.sala || undefined,
        motivo: formData.motivo || undefined,
        notas: formData.notas || undefined
      };

      if (appointment) {
        // Update existing appointment
        const updateData: UpdateAppointmentData = {
          ...baseData,
          updateType: 'this_only'
        };
        onSave(updateData);
      } else {
        // Create new appointment
        const createData: CreateAppointmentData = {
          ...baseData,
          isRecurring: formData.isRecurring,
          recurringPattern: formData.isRecurring && formData.recurringType !== 'none' ? {
            type: formData.recurringType,
            interval: formData.recurringInterval,
            daysOfWeek: formData.recurringType === 'weekly' ? formData.recurringDays : undefined,
            endDate: formData.recurringEndDate || undefined,
            occurrences: formData.recurringOccurrences || undefined
          } : undefined
        };
        onSave(createData);
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (time: string) => {
    setFormData(prev => ({
      ...prev,
      startTime: time,
      endTime: updateEndTime(time, prev.duration)
    }));
  };

  const handleDurationChange = (duration: number) => {
    setFormData(prev => ({
      ...prev,
      duration,
      endTime: updateEndTime(prev.startTime, duration)
    }));
  };

  const weekDays = [
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Paciente *
              </label>
              <select
                value={formData.patient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  setFormData(prev => ({ ...prev, patient: patient || null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                  errors.patient ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Selecione um paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nome}
                  </option>
                ))}
              </select>
              {errors.patient && (
                <p className="mt-1 text-sm text-red-600">{errors.patient}</p>
              )}
            </div>

            {/* Professional Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Profissional *
              </label>
              <select
                value={formData.professional?.id || ''}
                onChange={(e) => {
                  const professional = professionals.find(p => p.id === e.target.value);
                  setFormData(prev => ({ ...prev, professional: professional || null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                  errors.professional ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Selecione um profissional</option>
                {professionals.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome} - {prof.especialidade}
                  </option>
                ))}
              </select>
              {errors.professional && (
                <p className="mt-1 text-sm text-red-600">{errors.professional}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Início *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (min)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h 30min</option>
                  <option value={120}>2 horas</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Término: {formData.endTime}
                </p>
              </div>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Sala
              </label>
              <input
                type="text"
                value={formData.sala}
                onChange={(e) => setFormData(prev => ({ ...prev, sala: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                placeholder="Ex: Sala 1, Consultório A"
              />
            </div>

            {/* Reason and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Ex: Consulta inicial, Retorno"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Observações
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  rows={2}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            {/* Recurring Appointments */}
            {!appointment && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isRecurring: e.target.checked,
                      recurringType: e.target.checked ? 'weekly' : 'none'
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 flex items-center">
                    <Repeat className="inline h-4 w-4 mr-1" />
                    Agendamento recorrente
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repetir
                      </label>
                      <select
                        value={formData.recurringType}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recurringType: e.target.value as RecurrenceType 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                      >
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="monthly">Mensalmente</option>
                      </select>
                    </div>

                    {formData.recurringType === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dias da semana
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {weekDays.map(day => (
                            <label key={day.value} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.recurringDays?.includes(day.value) || false}
                                onChange={(e) => {
                                  const days = formData.recurringDays || [];
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      recurringDays: [...days, day.value]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      recurringDays: days.filter(d => d !== day.value)
                                    }));
                                  }
                                }}
                                className="mr-1"
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.recurringDays && (
                          <p className="mt-1 text-sm text-red-600">{errors.recurringDays}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Terminar em
                        </label>
                        <input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            recurringEndDate: e.target.value,
                            recurringOccurrences: undefined
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ou após X ocorrências
                        </label>
                        <input
                          type="number"
                          value={formData.recurringOccurrences || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            recurringOccurrences: e.target.value ? Number(e.target.value) : undefined,
                            recurringEndDate: ''
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>

                    {errors.recurring && (
                      <p className="text-sm text-red-600">{errors.recurring}</p>
                    )}
                  </div>
                )}
              </div>
            )}


            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  appointment ? 'Atualizar Agendamento' : 'Criar Agendamento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;