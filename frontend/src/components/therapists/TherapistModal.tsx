import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  Save,
  X,
  Plus,
  Bell
} from 'lucide-react';
import type { Therapist, WorkDay, WorkShift } from '@/types/therapist';

interface TherapistModalProps {
  therapist?: Therapist | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (therapist: Therapist) => void;
}

interface TherapistFormData {
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  registration_number: string;
  registration_type: 'CRM' | 'CRP' | 'CREFITO' | 'Outros';
  status: 'active' | 'inactive' | 'vacation';
  work_schedule: {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
  };
  notification_settings: {
    email_notifications: boolean;
    sms_notifications: boolean;
    whatsapp_notifications: boolean;
    appointment_reminders: boolean;
    patient_arrival_alerts: boolean;
  };
}

const TherapistModal: React.FC<TherapistModalProps> = ({ 
  therapist, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TherapistFormData>({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    registration_number: '',
    registration_type: 'CRP',
    status: 'active',
    work_schedule: {
      monday: { is_working: false, shifts: [] },
      tuesday: { is_working: false, shifts: [] },
      wednesday: { is_working: false, shifts: [] },
      thursday: { is_working: false, shifts: [] },
      friday: { is_working: false, shifts: [] },
      saturday: { is_working: false, shifts: [] },
      sunday: { is_working: false, shifts: [] }
    },
    notification_settings: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      appointment_reminders: true,
      patient_arrival_alerts: true
    }
  });

  useEffect(() => {
    if (therapist) {
      setFormData({
        name: therapist.name,
        email: therapist.email,
        phone: therapist.phone,
        specialties: therapist.specialties,
        registration_number: therapist.registration_number,
        registration_type: therapist.registration_type,
        status: therapist.status,
        work_schedule: therapist.work_schedule,
        notification_settings: therapist.notification_settings
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialties: [],
        registration_number: '',
        registration_type: 'CRP',
        status: 'active',
        work_schedule: {
          monday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
          tuesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
          wednesday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
          thursday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }] },
          friday: { is_working: true, shifts: [{ start_time: '08:00', end_time: '16:00' }] },
          saturday: { is_working: false, shifts: [] },
          sunday: { is_working: false, shifts: [] }
        },
        notification_settings: {
          email_notifications: true,
          sms_notifications: false,
          whatsapp_notifications: true,
          appointment_reminders: true,
          patient_arrival_alerts: true
        }
      });
    }
  }, [therapist, isOpen]);

  if (!isOpen) return null;

  // Funções utilitárias para máscaras
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    if (!formData.registration_number.trim()) {
      newErrors.registration_number = 'Número de registro é obrigatório';
    } else if (formData.registration_number.trim().length < 3) {
      newErrors.registration_number = 'Número do registro deve ter pelo menos 3 caracteres';
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = 'Pelo menos uma especialidade é obrigatória';
    }

    // Validar horários de trabalho
    const hasAtLeastOneWorkDay = Object.values(formData.work_schedule).some(day => day.is_working && day.shifts.length > 0);
    if (!hasAtLeastOneWorkDay) {
      newErrors.work_schedule = 'Configure pelo menos um dia de trabalho';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const therapistData: Therapist = {
        id: therapist?.id || Date.now().toString(),
        ...formData,
        created_at: therapist?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: therapist?.stats || {
          total_appointments: 0,
          appointments_this_month: 0,
          patients_count: 0,
          completion_rate: 0,
          average_session_duration: 60,
          rating: 5.0
        }
      };

      onSave(therapistData);
    } catch (error) {
      console.error('Erro ao salvar terapeuta:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = (specialty: string) => {
    if (specialty.trim() && !formData.specialties.includes(specialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty.trim()]
      }));
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const updateWorkDay = (day: keyof typeof formData.work_schedule, isWorking: boolean) => {
    setFormData(prev => ({
      ...prev,
      work_schedule: {
        ...prev.work_schedule,
        [day]: {
          is_working: isWorking,
          shifts: isWorking ? [{ start_time: '08:00', end_time: '17:00' }] : []
        }
      }
    }));
  };

  const updateWorkShift = (day: keyof typeof formData.work_schedule, shiftIndex: number, shift: Partial<WorkShift>) => {
    setFormData(prev => ({
      ...prev,
      work_schedule: {
        ...prev.work_schedule,
        [day]: {
          ...prev.work_schedule[day],
          shifts: prev.work_schedule[day].shifts.map((s, i) => 
            i === shiftIndex ? { ...s, ...shift } : s
          )
        }
      }
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Dados Básicos', icon: User },
    { id: 'schedule', label: 'Horários', icon: Clock },
    { id: 'notifications', label: 'Notificações', icon: Bell }
  ];

  const weekDays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const renderBasicTab = () => {
    const [newSpecialty, setNewSpecialty] = useState('');

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome completo do terapeuta"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@exemplo.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="vacation">Férias</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Registro
            </label>
            <select
              value={formData.registration_type}
              onChange={(e) => setFormData(prev => ({ ...prev, registration_type: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            >
              <option value="CRM">CRM (Médico)</option>
              <option value="CRP">CRP (Psicólogo)</option>
              <option value="CREFITO">CREFITO (Fisioterapeuta/TO)</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Registro *
            </label>
            <input
              type="text"
              value={formData.registration_number}
              onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                errors.registration_number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: CRP-20 12345"
            />
            {errors.registration_number && <p className="text-red-500 text-sm mt-1">{errors.registration_number}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidades *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialty(newSpecialty);
                  setNewSpecialty('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="Digite uma especialidade e pressione Enter"
            />
            <button
              type="button"
              onClick={() => {
                addSpecialty(newSpecialty);
                setNewSpecialty('');
              }}
              className="btn-secondary px-3"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.specialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-sapere-orange/10 text-sapere-brown rounded text-sm"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="text-sapere-brown/60 hover:text-sapere-brown"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
        </div>
      </div>
    );
  };

  const renderScheduleTab = () => (
    <div className="space-y-6">
      {weekDays.map(({ key, label }) => {
        const workDay = formData.work_schedule[key as keyof typeof formData.work_schedule];
        
        return (
          <div key={key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{label}</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={workDay.is_working}
                  onChange={(e) => updateWorkDay(key as keyof typeof formData.work_schedule, e.target.checked)}
                  className="mr-2 rounded text-sapere-orange focus:ring-sapere-orange"
                />
                Trabalha neste dia
              </label>
            </div>
            
            {workDay.is_working && (
              <div className="space-y-3">
                {workDay.shifts.map((shift, shiftIndex) => (
                  <div key={shiftIndex} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Início</label>
                      <input
                        type="time"
                        value={shift.start_time}
                        onChange={(e) => updateWorkShift(
                          key as keyof typeof formData.work_schedule,
                          shiftIndex,
                          { start_time: e.target.value }
                        )}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fim</label>
                      <input
                        type="time"
                        value={shift.end_time}
                        onChange={(e) => updateWorkShift(
                          key as keyof typeof formData.work_schedule,
                          shiftIndex,
                          { end_time: e.target.value }
                        )}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Início Pausa</label>
                      <input
                        type="time"
                        value={shift.break_start || ''}
                        onChange={(e) => updateWorkShift(
                          key as keyof typeof formData.work_schedule,
                          shiftIndex,
                          { break_start: e.target.value || undefined }
                        )}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fim Pausa</label>
                      <input
                        type="time"
                        value={shift.break_end || ''}
                        onChange={(e) => updateWorkShift(
                          key as keyof typeof formData.work_schedule,
                          shiftIndex,
                          { break_end: e.target.value || undefined }
                        )}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Notificações por E-mail</h4>
            <p className="text-sm text-gray-600">Receber notificações por e-mail</p>
          </div>
          <input
            type="checkbox"
            checked={formData.notification_settings.email_notifications}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notification_settings: {
                ...prev.notification_settings,
                email_notifications: e.target.checked
              }
            }))}
            className="rounded text-sapere-orange focus:ring-sapere-orange"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Notificações por SMS</h4>
            <p className="text-sm text-gray-600">Receber notificações por SMS</p>
          </div>
          <input
            type="checkbox"
            checked={formData.notification_settings.sms_notifications}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notification_settings: {
                ...prev.notification_settings,
                sms_notifications: e.target.checked
              }
            }))}
            className="rounded text-sapere-orange focus:ring-sapere-orange"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Notificações por WhatsApp</h4>
            <p className="text-sm text-gray-600">Receber notificações por WhatsApp</p>
          </div>
          <input
            type="checkbox"
            checked={formData.notification_settings.whatsapp_notifications}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notification_settings: {
                ...prev.notification_settings,
                whatsapp_notifications: e.target.checked
              }
            }))}
            className="rounded text-sapere-orange focus:ring-sapere-orange"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Lembretes de Agendamento</h4>
            <p className="text-sm text-gray-600">Receber lembretes sobre agendamentos</p>
          </div>
          <input
            type="checkbox"
            checked={formData.notification_settings.appointment_reminders}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notification_settings: {
                ...prev.notification_settings,
                appointment_reminders: e.target.checked
              }
            }))}
            className="rounded text-sapere-orange focus:ring-sapere-orange"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Alertas de Chegada</h4>
            <p className="text-sm text-gray-600">Receber alertas quando pacientes chegam</p>
          </div>
          <input
            type="checkbox"
            checked={formData.notification_settings.patient_arrival_alerts}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notification_settings: {
                ...prev.notification_settings,
                patient_arrival_alerts: e.target.checked
              }
            }))}
            className="rounded text-sapere-orange focus:ring-sapere-orange"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              {therapist ? 'Editar Terapeuta' : 'Novo Terapeuta'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 text-sm font-medium rounded-t-lg flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-sapere-brown border-b-2 border-sapere-orange bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'basic' && renderBasicTab()}
              {activeTab === 'schedule' && renderScheduleTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {therapist ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TherapistModal;