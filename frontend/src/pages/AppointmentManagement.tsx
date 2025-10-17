import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppNavigation } from '@/components/Navigation';
import WeeklyCalendar from '@/components/appointments/WeeklyCalendar';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  therapist: string;
  notes: string;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
}

const AppointmentManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const { goToDashboard, goToPatients } = useAppNavigation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const [formData, setFormData] = useState<Omit<Appointment, 'id' | 'createdAt' | 'patientName'>>({
    patientId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'consulta',
    status: 'scheduled',
    therapist: user?.name || 'Terapeuta',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = () => {
    const stored = localStorage.getItem('sapere_appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
    }
  };

  const loadPatients = () => {
    const stored = localStorage.getItem('sapere_patients');
    if (stored) {
      const allPatients = JSON.parse(stored);
      setPatients(allPatients.map((p: any) => ({
        id: p.id,
        name: p.name,
        phone: p.phone
      })));
    }
  };

  const saveAppointments = (updatedAppointments: Appointment[]) => {
    localStorage.setItem('sapere_appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      alert('Selecione um paciente válido');
      return;
    }

    if (editingAppointment) {
      // Editar agendamento existente
      const updated = appointments.map(a =>
        a.id === editingAppointment.id
          ? {
              ...formData,
              id: editingAppointment.id,
              createdAt: editingAppointment.createdAt,
              patientName: selectedPatient.name
            }
          : a
      );
      saveAppointments(updated);
    } else {
      // Criar novo agendamento
      const newAppointment: Appointment = {
        ...formData,
        id: Date.now().toString(),
        patientName: selectedPatient.name,
        createdAt: new Date().toISOString()
      };
      saveAppointments([...appointments, newAppointment]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      date: '',
      time: '',
      duration: 60,
      type: 'consulta',
      status: 'scheduled',
      therapist: user?.name || 'Terapeuta',
      notes: ''
    });
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      therapist: appointment.therapist,
      notes: appointment.notes
    });
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const filtered = appointments.filter(a => a.id !== id);
      saveAppointments(filtered);
    }
  };

  const handleAppointmentMove = (appointmentId: string, newDate: string, newTime: string) => {
    const updated = appointments.map(a =>
      a.id === appointmentId ? { ...a, date: newDate, time: newTime } : a
    );
    saveAppointments(updated);
  };

  const updateStatus = (id: string, newStatus: Appointment['status']) => {
    const updated = appointments.map(a =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    saveAppointments(updated);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const statusMatch = filterStatus === 'all' || appointment.status === filterStatus;
    const dateMatch = !filterDate || appointment.date === filterDate;
    return statusMatch && dateMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#6b7280';
      case 'confirmed': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Realizado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };


  const commonStyle = {
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box' as const
  };

  const inputStyle = {
    ...commonStyle,
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  };

  const buttonStyle = {
    ...commonStyle,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const
  };

  return (
    <div style={{ ...commonStyle, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={goToDashboard}
            style={{
              ...buttonStyle,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            ← Dashboard
          </button>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
              📅 Gestão de Agendamentos
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
              Sistema Sapere - Agenda Clínica
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>{user?.name}</span>
          <button onClick={logout} style={{
            ...buttonStyle,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Controles superiores */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' as const }}>
            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '5px', border: '1px solid #ddd', borderRadius: '5px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  ...buttonStyle,
                  padding: '6px 12px',
                  backgroundColor: viewMode === 'list' ? '#f59e0b' : 'transparent',
                  color: viewMode === 'list' ? 'white' : '#666',
                  fontSize: '13px'
                }}
              >
                📋 Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                style={{
                  ...buttonStyle,
                  padding: '6px 12px',
                  backgroundColor: viewMode === 'calendar' ? '#f59e0b' : 'transparent',
                  color: viewMode === 'calendar' ? 'white' : '#666',
                  fontSize: '13px'
                }}
              >
                📅 Calendário
              </button>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ ...inputStyle, width: '150px' }}
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Realizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ ...inputStyle, width: '150px' }}
            />
            <span style={{ color: '#666', fontSize: '14px' }}>
              {filteredAppointments.length} agendamento(s)
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              ...buttonStyle,
              backgroundColor: '#10b981',
              color: 'white'
            }}
          >
            + Novo Agendamento
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: '0', color: '#1f2937' }}>
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>

            {patients.length === 0 && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '20px',
                color: '#92400e'
              }}>
                ⚠️ Você precisa cadastrar pacientes primeiro para criar agendamentos.
                <br />
                <a href="/patients" style={{ color: '#f59e0b', textDecoration: 'underline' }}>
                  Clique aqui para cadastrar pacientes
                </a>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Paciente *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="">Selecione um paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Horário *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Duração (min) *</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    style={inputStyle}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                    <option value={90}>90 minutos</option>
                    <option value={120}>120 minutos</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Tipo de Consulta *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="consulta">Consulta Regular</option>
                    <option value="avaliacao">Avaliação Inicial</option>
                    <option value="terapia">Sessão de Terapia</option>
                    <option value="acompanhamento">Acompanhamento</option>
                    <option value="retorno">Retorno</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Appointment['status']})}
                    style={inputStyle}
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Realizado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Terapeuta</label>
                <input
                  type="text"
                  value={formData.therapist}
                  onChange={(e) => setFormData({...formData, therapist: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                  placeholder="Observações sobre a consulta..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  style={{
                    ...buttonStyle,
                    backgroundColor: patients.length === 0 ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    cursor: patients.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {editingAppointment ? 'Atualizar' : 'Agendar'} Consulta
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#6b7280',
                    color: 'white'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' ? (
          <WeeklyCalendar
            appointments={appointments}
            onAppointmentMove={handleAppointmentMove}
            onAppointmentEdit={handleEdit}
            onAppointmentDelete={handleDelete}
          />
        ) : (
          /* Lista de agendamentos */
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: '0', color: '#1f2937' }}>
                Agendamentos ({filteredAppointments.length})
              </h3>
            </div>

          {filteredAppointments.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '18px', margin: '0' }}>
                {appointments.length === 0
                  ? 'Nenhum agendamento criado ainda.'
                  : 'Nenhum agendamento encontrado com os filtros aplicados.'}
              </p>
              {appointments.length === 0 && patients.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#10b981',
                    color: 'white',
                    marginTop: '15px'
                  }}
                >
                  Criar Primeiro Agendamento
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Paciente</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Data/Hora</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Duração</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Terapeuta</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => (
                    <tr key={appointment.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{appointment.patientName}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        <div>{new Date(appointment.date).toLocaleDateString('pt-BR')}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{appointment.time}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {appointment.type}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {appointment.duration}min
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <select
                          value={appointment.status}
                          onChange={(e) => updateStatus(appointment.id, e.target.value as Appointment['status'])}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: getStatusColor(appointment.status),
                            color: 'white',
                            fontSize: '12px'
                          }}
                        >
                          <option value="scheduled">Agendado</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="completed">Realizado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {appointment.therapist}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(appointment)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;