import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  User,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Star,
  Bell,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  MapPin,
  FileText,
  Activity,
  Award,
  Timer,
  Target,
  BarChart3,
  Eye,
  Settings
} from 'lucide-react';
import { SAPERE_THERAPISTS, type Therapist } from '@/types/therapist';
import type { Appointment } from '@/pages/Calendar';

const TherapistDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'patients' | 'schedule' | 'stats'>('today');

  useEffect(() => {
    const loadTherapistData = async () => {
      setLoading(true);
      
      // Simular carregamento da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar terapeuta pelos dados mock
      const foundTherapist = SAPERE_THERAPISTS.find((_, index) => (index + 1).toString() === id);
      
      if (foundTherapist) {
        const therapistWithId: Therapist = {
          ...foundTherapist,
          id: id!,
          created_at: new Date(2023, parseInt(id!) - 1, 15).toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setTherapist(therapistWithId);
        
        // Mock appointments para hoje
        const mockTodayAppointments: Appointment[] = [
          {
            id: '1',
            patient_name: 'Ana Clara Santos',
            patient_id: '1',
            therapist_name: therapistWithId.name,
            therapist_id: therapistWithId.id,
            start_time: format(new Date(new Date().setHours(9, 0)), "yyyy-MM-dd'T'HH:mm:ss"),
            end_time: format(new Date(new Date().setHours(10, 0)), "yyyy-MM-dd'T'HH:mm:ss"),
            status: 'confirmed',
            service_type: therapistWithId.specialties[0],
            is_first_appointment: false,
            patient_phone: '+5592999111111',
            confirmation_sent: true,
            reminder_sent_24h: true,
            reminder_sent_2h: false
          },
          {
            id: '2',
            patient_name: 'Pedro Henrique Lima',
            patient_id: '2',
            therapist_name: therapistWithId.name,
            therapist_id: therapistWithId.id,
            start_time: format(new Date(new Date().setHours(11, 0)), "yyyy-MM-dd'T'HH:mm:ss"),
            end_time: format(new Date(new Date().setHours(12, 0)), "yyyy-MM-dd'T'HH:mm:ss"),
            status: 'in_progress',
            service_type: therapistWithId.specialties[1] || therapistWithId.specialties[0],
            is_first_appointment: true,
            patient_phone: '+5592999222222',
            confirmation_sent: true,
            reminder_sent_24h: true,
            reminder_sent_2h: true,
            checked_in_at: new Date().toISOString(),
            waiting_time: 5
          },
          {
            id: '3',
            patient_name: 'Maria Eduarda Oliveira',
            patient_id: '3',
            therapist_name: therapistWithId.name,
            therapist_id: therapistWithId.id,
            start_time: format(new Date(new Date().setHours(14, 0)), "yyyy-MM-dd'T'HH:mm:ss"),
            end_time: format(new Date(new Date().setHours(15, 0)), "yyyy-MM-dd'T'HH:mm:ss"),
            status: 'scheduled',
            service_type: therapistWithId.specialties[0],
            is_first_appointment: false,
            patient_phone: '+5592999333333',
            confirmation_sent: false,
            reminder_sent_24h: false,
            reminder_sent_2h: false
          }
        ];
        
        setTodayAppointments(mockTodayAppointments);
      }
      
      setLoading(false);
    };

    if (id) {
      loadTherapistData();
    }
  }, [id]);

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

  const handlePatientArrival = (appointmentId: string) => {
    setTodayAppointments(prev => prev.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'confirmed' as const, checked_in_at: new Date().toISOString() }
        : app
    ));
  };

  const handleStartAppointment = (appointmentId: string) => {
    setTodayAppointments(prev => prev.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'in_progress' as const }
        : app
    ));
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    setTodayAppointments(prev => prev.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'completed' as const }
        : app
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Terapeuta não encontrado</h2>
        <p className="text-gray-600">O terapeuta solicitado não existe ou foi removido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Terapeuta */}
      <div className="bg-gradient-to-r from-sapere-orange to-orange-500 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{therapist.name}</h1>
              <p className="text-orange-100 text-lg">{therapist.registration_number}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">{therapist.stats.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{therapist.stats.patients_count} pacientes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">{therapist.stats.completion_rate}% conclusão</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{therapist.phone}</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{therapist.email}</span>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </button>
          </div>
        </div>

        {/* Especialidades */}
        <div className="mt-4">
          <p className="text-orange-100 text-sm mb-2">Especialidades:</p>
          <div className="flex flex-wrap gap-2">
            {therapist.specialties.map((specialty, index) => (
              <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border-2 border-sapere-orange p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessões Hoje</p>
              <p className="text-3xl font-bold text-sapere-brown mt-1">{todayAppointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-green-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Progresso</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {todayAppointments.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-blue-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmadas</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {todayAppointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-yellow-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {todayAppointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'today'
                ? 'border-sapere-orange text-sapere-orange bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Agenda de Hoje</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'patients'
                ? 'border-sapere-orange text-sapere-orange bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Meus Pacientes</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-sapere-orange text-sapere-orange bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Horários</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-sapere-orange text-sapere-orange bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Estatísticas</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'today' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-sapere-brown">
                  Agenda de {format(new Date(), 'EEEE, dd \'de\' MMMM', { locale: ptBR })}
                </h2>
                <div className="text-sm text-gray-500">
                  {todayAppointments.length} sessões agendadas
                </div>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão hoje</h3>
                  <p className="text-gray-500">Aproveite para descansar ou estudar!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-12 w-12 bg-sapere-orange text-white rounded-full flex items-center justify-center font-bold">
                              {appointment.patient_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-sapere-brown">
                                {appointment.patient_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')} • {appointment.service_type}
                              </p>
                              {appointment.is_first_appointment && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                  Primeira consulta
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusLabel(appointment.status)}
                            </div>
                            
                            {appointment.checked_in_at && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <MapPin className="h-4 w-4" />
                                <span>Check-in: {format(new Date(appointment.checked_in_at), 'HH:mm')}</span>
                              </div>
                            )}

                            {appointment.waiting_time && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Timer className="h-4 w-4" />
                                <span>Aguardando: {appointment.waiting_time}min</span>
                              </div>
                            )}
                          </div>

                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                <p className="text-sm text-gray-700">{appointment.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handlePatientArrival(appointment.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors"
                              >
                                Check-in
                              </button>
                              <a
                                href={`https://wa.me/${appointment.patient_phone?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-sapere-whatsapp text-white rounded-lg text-xs hover:bg-green-600 transition-colors text-center"
                              >
                                WhatsApp
                              </a>
                            </>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => handleStartAppointment(appointment.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                            >
                              Iniciar
                            </button>
                          )}
                          
                          {appointment.status === 'in_progress' && (
                            <button
                              onClick={() => handleCompleteAppointment(appointment.id)}
                              className="px-3 py-1 bg-sapere-orange text-white rounded-lg text-xs hover:bg-orange-600 transition-colors"
                            >
                              Finalizar
                            </button>
                          )}

                          <button className="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600 transition-colors">
                            <Eye className="h-3 w-3 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sapere-brown">Meus Pacientes</h2>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lista de pacientes</h3>
                <p className="text-gray-500">Total de {therapist.stats.patients_count} pacientes ativos</p>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sapere-brown">Configuração de Horários</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(therapist.work_schedule).map(([day, schedule]) => {
                  const dayLabels = {
                    monday: 'Segunda-feira',
                    tuesday: 'Terça-feira',
                    wednesday: 'Quarta-feira',
                    thursday: 'Quinta-feira',
                    friday: 'Sexta-feira',
                    saturday: 'Sábado',
                    sunday: 'Domingo'
                  };

                  return (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {dayLabels[day as keyof typeof dayLabels]}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.is_working 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.is_working ? 'Trabalha' : 'Folga'}
                        </span>
                      </div>
                      
                      {schedule.is_working && schedule.shifts.length > 0 && (
                        <div className="space-y-2">
                          {schedule.shifts.map((shift, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {shift.start_time} - {shift.end_time}
                                </span>
                                {shift.break_start && shift.break_end && (
                                  <span className="text-xs text-gray-500">
                                    Intervalo: {shift.break_start} - {shift.break_end}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sapere-brown">Estatísticas Detalhadas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-sapere-brown mb-2">
                    {therapist.stats.total_appointments}
                  </div>
                  <div className="text-sm text-gray-600">Total de Atendimentos</div>
                  <div className="text-xs text-gray-500 mt-1">Histórico completo</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {therapist.stats.appointments_this_month}
                  </div>
                  <div className="text-sm text-gray-600">Este Mês</div>
                  <div className="text-xs text-gray-500 mt-1">Sessões realizadas</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {therapist.stats.completion_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Conclusão</div>
                  <div className="text-xs text-gray-500 mt-1">Sessões finalizadas</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {therapist.stats.average_session_duration}min
                  </div>
                  <div className="text-sm text-gray-600">Duração Média</div>
                  <div className="text-xs text-gray-500 mt-1">Por sessão</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2 flex items-center justify-center space-x-1">
                    <span>{therapist.stats.rating}</span>
                    <Star className="h-8 w-8 text-yellow-500 fill-current" />
                  </div>
                  <div className="text-sm text-gray-600">Avaliação</div>
                  <div className="text-xs text-gray-500 mt-1">Média dos pacientes</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-sapere-orange mb-2">
                    {therapist.stats.patients_count}
                  </div>
                  <div className="text-sm text-gray-600">Pacientes Ativos</div>
                  <div className="text-xs text-gray-500 mt-1">Em acompanhamento</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;