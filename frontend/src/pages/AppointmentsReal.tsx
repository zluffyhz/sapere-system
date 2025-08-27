import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format, startOfDay, endOfDay, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  service: string;
  therapist: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const AppointmentsReal: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    date: '',
    time: '',
    duration: 60,
    service: '',
    therapist: '',
    notes: ''
  });

  // Opções de serviços
  const services = [
    'Terapia Ocupacional',
    'Fonoaudiologia',
    'Psicologia',
    'Fisioterapia',
    'Psicopedagogia',
    'Avaliação Neuropsicológica'
  ];

  // Carregar agendamentos
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const savedAppointments = localStorage.getItem('sapere_appointments');
      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      } else {
        // Dados mock para demonstração
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            patientName: 'João Silva',
            patientPhone: '(11) 99999-9999',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: '09:00',
            duration: 60,
            service: 'Terapia Ocupacional',
            therapist: 'Dr. Carlos Mendes',
            status: 'scheduled',
            notes: 'Primeira sessão',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            patientName: 'Ana Costa', 
            patientPhone: '(11) 77777-7777',
            date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // amanhã
            time: '14:00',
            duration: 60,
            service: 'Fonoaudiologia',
            therapist: 'Dra. Maria Santos',
            status: 'confirmed',
            notes: 'Avaliação de fala',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            patientName: 'Pedro Oliveira',
            patientPhone: '(11) 88888-8888', 
            date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), // ontem
            time: '10:30',
            duration: 45,
            service: 'Psicologia',
            therapist: 'Dr. João Ferreira',
            status: 'completed',
            notes: 'Sessão realizada com sucesso',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('sapere_appointments', JSON.stringify(mockAppointments));
        setAppointments(mockAppointments);
      }
    } catch (err) {
      error('Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppointments = (updatedAppointments: Appointment[]) => {
    localStorage.setItem('sapere_appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.date || !formData.time || !formData.service) {
      error('Preencha todos os campos obrigatórios');
      return;
    }

    const appointmentData: Appointment = {
      id: editingAppointment?.id || Date.now().toString(),
      ...formData,
      status: 'scheduled',
      createdAt: editingAppointment?.createdAt || new Date().toISOString()
    };

    let updatedAppointments: Appointment[];
    
    if (editingAppointment) {
      updatedAppointments = appointments.map(a => a.id === editingAppointment.id ? appointmentData : a);
      success('Agendamento atualizado com sucesso!');
    } else {
      updatedAppointments = [...appointments, appointmentData];
      success('Agendamento criado com sucesso!');
    }

    saveAppointments(updatedAppointments);
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      service: appointment.service,
      therapist: appointment.therapist,
      notes: appointment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const updatedAppointments = appointments.filter(a => a.id !== id);
      saveAppointments(updatedAppointments);
      success('Agendamento excluído com sucesso!');
    }
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    const updatedAppointments = appointments.map(a => 
      a.id === id ? { ...a, status } : a
    );
    saveAppointments(updatedAppointments);
    
    const statusLabels = {
      scheduled: 'agendado',
      confirmed: 'confirmado',
      completed: 'concluído',
      cancelled: 'cancelado'
    };
    
    success(`Agendamento ${statusLabels[status]} com sucesso!`);
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      date: '',
      time: '',
      duration: 60,
      service: '',
      therapist: '',
      notes: ''
    });
    setEditingAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isYesterday(date)) return 'Ontem';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const filteredAppointments = appointments
    .filter(appointment => {
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.patientPhone.includes(searchTerm) ||
                           appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = selectedDate ? appointment.date === selectedDate : true;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return a.time.localeCompare(b.time);
    });

  const todayAppointments = appointments.filter(a => a.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Agendamentos</h1>
          <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-sapere-brown">{todayAppointments.length}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-blue-600">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-600">{appointments.length}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar agendamentos..."
              className="pl-10 input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento para esta data'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Crie um novo agendamento'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patientName}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{getDateLabel(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time} ({appointment.duration}min)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{appointment.service}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.patientPhone}</span>
                      </div>
                    </div>
                    
                    {appointment.therapist && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Terapeuta:</strong> {appointment.therapist}
                      </div>
                    )}
                    
                    {appointment.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Observações:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Botões de Status */}
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Confirmar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'completed')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Marcar como concluído"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-2 text-sapere-orange hover:bg-sapere-orange/10 rounded"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Cancelar"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sapere-brown">
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    className="input-field"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (minutos)
                  </label>
                  <select
                    className="input-field"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                    <option value={90}>90 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serviço *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terapeuta
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.therapist}
                  onChange={(e) => setFormData({ ...formData, therapist: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingAppointment ? 'Atualizar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsReal;