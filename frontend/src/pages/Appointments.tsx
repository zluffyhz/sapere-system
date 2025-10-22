import { useState } from 'react';
import { Calendar, Clock, Users, Plus, Search, Filter, Play } from 'lucide-react';
import SessionTimer from '../components/SessionTimer';

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  
  // Para simular o ID do terapeuta logado - em um app real viria do contexto de autenticação
  const currentTherapistId = 'therapist_1';

  // Mock data
  const appointments = [
    {
      id: '1',
      patient: 'João Silva Santos',
      patient_id: 'patient_1',
      therapist: 'Dra. Maria Oliveira',
      therapist_id: 'therapist_1',
      time: '14:00',
      duration: 60,
      type: 'Neuropsicologia',
      status: 'confirmed'
    },
    {
      id: '2',
      patient: 'Ana Beatriz Lima',
      patient_id: 'patient_2',
      therapist: 'Dr. Carlos Santos',
      therapist_id: 'therapist_2',
      time: '15:30',
      duration: 60,
      type: 'Terapia TEA',
      status: 'pending'
    },
    {
      id: '3',
      patient: 'Pedro Henrique Souza',
      patient_id: 'patient_3',
      therapist: 'Dra. Maria Oliveira',
      therapist_id: 'therapist_1',
      time: '16:00',
      duration: 50,
      type: 'Avaliação',
      status: 'confirmed'
    }
  ];

  const handleStartSession = async (appointment: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/sessions/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          therapist_id: appointment.therapist_id,
          patient_id: appointment.patient_id,
          appointment_id: appointment.id
        })
      });

      if (response.ok) {
        alert(`Sessão iniciada para ${appointment.patient}`);
        // O SessionTimer será atualizado automaticamente
      } else {
        const error = await response.json();
        alert(`Erro ao iniciar sessão: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      alert('Erro ao iniciar sessão');
    }
  };

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie consultas e horários dos terapeutas
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Nova Consulta
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visualização</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="day">Dia</option>
                <option value="week">Semana</option>
                <option value="month">Mês</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Search size={18} />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Confirmadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Terapeutas</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Timer */}
      <SessionTimer 
        therapistId={currentTherapistId}
        onSessionComplete={(sessionData) => {
          console.log('Sessão finalizada:', sessionData);
          // Aqui você pode atualizar a lista de consultas ou mostrar um resumo
        }}
      />

      {/* Calendar/Schedule View */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Agenda do dia {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Time Slots */}
            <div className="lg:col-span-1">
              <h4 className="font-medium text-gray-900 mb-4">Horários</h4>
              <div className="space-y-2">
                {timeSlots.map(time => (
                  <div key={time} className="text-sm text-gray-600 p-2 border-l-2 border-gray-200">
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div className="lg:col-span-3">
              <h4 className="font-medium text-gray-900 mb-4">Consultas Agendadas</h4>
              <div className="space-y-3">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {appointment.time}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{appointment.patient}</p>
                          <p className="text-sm text-gray-600">{appointment.therapist}</p>
                          <p className="text-sm text-blue-600">{appointment.type} • {appointment.duration} min</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {appointment.therapist_id === currentTherapistId && appointment.status === 'confirmed' && (
                          <button 
                            onClick={() => handleStartSession(appointment)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Play size={14} />
                            <span className="text-sm">Iniciar</span>
                          </button>
                        )}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                          Editar
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma consulta agendada</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Agende a primeira consulta do dia.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}