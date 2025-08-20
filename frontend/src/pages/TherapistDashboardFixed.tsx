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

const TherapistDashboardFixed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'patients' | 'schedule' | 'stats'>('today');

  // Debug das abas - detectar mudanças
  useEffect(() => {
    console.log('=== DEBUG ABAS THERAPIST DASHBOARD FIXED ===');
    console.log('Aba ativa atual:', activeTab);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('===========================================');
  }, [activeTab]);

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

  // Funções de mudança de aba SIMPLIFICADAS
  const switchToToday = () => {
    console.log('🔄 SWITCH TO TODAY');
    setActiveTab('today');
  };

  const switchToPatients = () => {
    console.log('🔄 SWITCH TO PATIENTS');
    setActiveTab('patients');
  };

  const switchToSchedule = () => {
    console.log('🔄 SWITCH TO SCHEDULE');
    setActiveTab('schedule');
  };

  const switchToStats = () => {
    console.log('🔄 SWITCH TO STATS');
    setActiveTab('stats');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6B7280' }}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          Terapeuta não encontrado
        </h2>
        <p style={{ color: '#6B7280' }}>
          O terapeuta solicitado não existe ou foi removido.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Debug Info */}
      <div style={{ 
        backgroundColor: '#FEF3C7', 
        border: '1px solid #F59E0B', 
        borderRadius: '8px', 
        padding: '16px' 
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>🐛 Debug Therapist Dashboard:</h3>
        <p>Aba ativa: <strong>{activeTab}</strong></p>
        <p>Timestamp: <strong>{new Date().toLocaleTimeString()}</strong></p>
      </div>

      {/* Header do Terapeuta */}
      <div style={{
        background: 'linear-gradient(to right, #f97316, #ea580c)',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        color: 'white',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              height: '80px',
              width: '80px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                {therapist.name}
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px', margin: '4px 0' }}>
                {therapist.registration_number}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star style={{ height: '16px', width: '16px' }} />
                  <span style={{ fontSize: '14px' }}>{therapist.stats.rating}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users style={{ height: '16px', width: '16px' }} />
                  <span style={{ fontSize: '14px' }}>{therapist.stats.patients_count} pacientes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Target style={{ height: '16px', width: '16px' }} />
                  <span style={{ fontSize: '14px' }}>{therapist.stats.completion_rate}% conclusão</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Especialidades */}
        <div style={{ marginTop: '16px' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '8px' }}>
            Especialidades:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {therapist.specialties.map((specialty, index) => (
              <span 
                key={index} 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '14px' 
                }}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #f97316',
          padding: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Sessões Hoje</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', marginTop: '4px' }}>
                {todayAppointments.length}
              </p>
            </div>
            <Calendar style={{ height: '32px', width: '32px', color: '#f97316' }} />
          </div>
        </div>
      </div>

      {/* Tabs - VERSÃO SUPER SIMPLIFICADA */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            
            {/* Tab Today */}
            <button
              onClick={switchToToday}
              style={{
                padding: '12px 24px',
                borderBottom: activeTab === 'today' ? '2px solid #f97316' : '2px solid transparent',
                color: activeTab === 'today' ? '#f97316' : '#6B7280',
                backgroundColor: activeTab === 'today' ? '#fff7ed' : 'transparent',
                fontWeight: '500',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 'max-content'
              }}
            >
              <Clock style={{ height: '16px', width: '16px' }} />
              <span>Agenda de Hoje</span>
            </button>

            {/* Tab Patients */}
            <button
              onClick={switchToPatients}
              style={{
                padding: '12px 24px',
                borderBottom: activeTab === 'patients' ? '2px solid #f97316' : '2px solid transparent',
                color: activeTab === 'patients' ? '#f97316' : '#6B7280',
                backgroundColor: activeTab === 'patients' ? '#fff7ed' : 'transparent',
                fontWeight: '500',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 'max-content'
              }}
            >
              <Users style={{ height: '16px', width: '16px' }} />
              <span>Meus Pacientes</span>
            </button>

            {/* Tab Schedule */}
            <button
              onClick={switchToSchedule}
              style={{
                padding: '12px 24px',
                borderBottom: activeTab === 'schedule' ? '2px solid #f97316' : '2px solid transparent',
                color: activeTab === 'schedule' ? '#f97316' : '#6B7280',
                backgroundColor: activeTab === 'schedule' ? '#fff7ed' : 'transparent',
                fontWeight: '500',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 'max-content'
              }}
            >
              <Calendar style={{ height: '16px', width: '16px' }} />
              <span>Horários</span>
            </button>

            {/* Tab Stats */}
            <button
              onClick={switchToStats}
              style={{
                padding: '12px 24px',
                borderBottom: activeTab === 'stats' ? '2px solid #f97316' : '2px solid transparent',
                color: activeTab === 'stats' ? '#f97316' : '#6B7280',
                backgroundColor: activeTab === 'stats' ? '#fff7ed' : 'transparent',
                fontWeight: '500',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 'max-content'
              }}
            >
              <BarChart3 style={{ height: '16px', width: '16px' }} />
              <span>Estatísticas</span>
            </button>

          </div>
        </div>

        {/* Botões de Teste Forçado */}
        <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('today')}
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔴 Força Today
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🟢 Força Patients
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔵 Força Schedule
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              style={{
                backgroundColor: '#8B5CF6',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🟣 Força Stats
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                  Agenda de {format(new Date(), 'EEEE, dd \'de\' MMMM', { locale: ptBR })}
                </h2>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  {todayAppointments.length} sessões agendadas
                </div>
              </div>

              {todayAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <Calendar style={{ height: '64px', width: '64px', color: '#D1D5DB', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                    Nenhuma sessão hoje
                  </h3>
                  <p style={{ color: '#6B7280' }}>Aproveite para descansar ou estudar!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {todayAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                              height: '48px',
                              width: '48px',
                              backgroundColor: '#f97316',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}>
                              {appointment.patient_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                                {appointment.patient_name}
                              </h3>
                              <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
                                {format(new Date(appointment.start_time), 'HH:mm')} - {format(new Date(appointment.end_time), 'HH:mm')} • {appointment.service_type}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                Meus Pacientes
              </h2>
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Users style={{ height: '64px', width: '64px', color: '#D1D5DB', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
                  Lista de pacientes
                </h3>
                <p style={{ color: '#6B7280' }}>
                  Total de {therapist.stats.patients_count} pacientes ativos
                </p>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                Configuração de Horários
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px' 
              }}>
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
                    <div 
                      key={day} 
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                          {dayLabels[day as keyof typeof dayLabels]}
                        </h3>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: schedule.is_working ? '#D1FAE5' : '#F3F4F6',
                          color: schedule.is_working ? '#065F46' : '#374151'
                        }}>
                          {schedule.is_working ? 'Trabalha' : 'Folga'}
                        </span>
                      </div>
                      
                      {schedule.is_working && schedule.shifts.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {schedule.shifts.map((shift, index) => (
                            <div 
                              key={index} 
                              style={{
                                backgroundColor: '#F9FAFB',
                                padding: '12px',
                                borderRadius: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                  {shift.start_time} - {shift.end_time}
                                </span>
                                {shift.break_start && shift.break_end && (
                                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                Estatísticas Detalhadas
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '24px' 
              }}>
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>
                    {therapist.stats.total_appointments}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>Total de Atendimentos</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Histórico completo</div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563EB', marginBottom: '8px' }}>
                    {therapist.stats.appointments_this_month}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>Este Mês</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Sessões realizadas</div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>
                    {therapist.stats.completion_rate}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>Taxa de Conclusão</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Sessões finalizadas</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboardFixed;