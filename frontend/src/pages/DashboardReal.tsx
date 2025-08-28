import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

const DashboardReal: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    todayAppointments: 0,
    therapySessions: 0,
    communications: 0,
    anamneses: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivities();
  }, []);

  const loadStats = () => {
    // Carregar dados do localStorage
    const patients = JSON.parse(localStorage.getItem('sapere_patients') || '[]');
    const appointments = JSON.parse(localStorage.getItem('sapere_appointments') || '[]');
    const sessions = JSON.parse(localStorage.getItem('sapere_therapy_sessions') || '[]');
    const communications = JSON.parse(localStorage.getItem('sapere_communications') || '[]');
    const anamneses = JSON.parse(localStorage.getItem('sapere_anamneses') || '[]');

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayAppointments = appointments.filter((apt: any) => apt.date === today);

    setStats({
      patients: patients.length,
      appointments: appointments.length,
      todayAppointments: todayAppointments.length,
      therapySessions: sessions.length,
      communications: communications.length,
      anamneses: anamneses.length
    });
  };

  const loadRecentActivities = () => {
    // Simular atividades recentes (em uma implementação real, viria da API)
    setRecentActivities([]);
  };

  const quickActions = [
    {
      title: 'Novo Paciente',
      description: 'Cadastrar um novo paciente',
      icon: Users,
      link: '/patients',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Agendar Consulta',
      description: 'Criar novo agendamento',
      icon: Calendar,
      link: '/appointments',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Iniciar Terapia',
      description: 'Começar nova sessão',
      icon: Play,
      link: '/therapy',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Nova Anamnese',
      description: 'Criar anamnese',
      icon: FileText,
      link: '/anamnese',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Professional Dashboard Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} · {format(new Date(), 'HH:mm')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {stats.todayAppointments > 0 && (
              <div className="flex items-center space-x-2 bg-sapere-orange/10 text-sapere-orange px-3 py-1 rounded-full text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span>{stats.todayAppointments} consultas hoje</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes Cadastrados</p>
              <p className="text-3xl font-bold text-sapere-brown">{stats.patients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/patients" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todos os pacientes →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
              <p className="text-3xl font-bold text-green-600">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/appointments" 
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Ver agenda completa →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
              <p className="text-3xl font-bold text-purple-600">{stats.appointments}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/appointments" 
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Gerenciar agendamentos →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessões de Terapia</p>
              <p className="text-3xl font-bold text-orange-600">{stats.therapySessions}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/therapy" 
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              Iniciar nova sessão →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comunicações</p>
              <p className="text-3xl font-bold text-blue-500">{stats.communications}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/communication" 
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Ver comunicações →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anamneses</p>
              <p className="text-3xl font-bold text-teal-600">{stats.anamneses}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <FileText className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/anamnese" 
              className="text-teal-600 hover:text-teal-800 text-sm font-medium"
            >
              Gerenciar anamneses →
            </Link>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-sapere-brown mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white rounded-lg p-4 transition-all duration-200 transform hover:scale-105 shadow-md`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Informações da Clínica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-sapere-brown mb-4">Contatos da Clínica</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">WhatsApp</p>
                <p className="text-gray-600 text-sm">(92) 99230-5850</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-600 text-sm">Sapere.recepcao@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-sapere-brown mb-4">Status do Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sistema</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Operacional</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Backup</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Ativo</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Última atualização</span>
              <span className="text-gray-600 font-medium">
                {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de Início */}
      {stats.patients === 0 && stats.appointments === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 text-center">
          <div className="mb-4">
            <Activity className="h-12 w-12 text-blue-500 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Sistema Sapere!
          </h3>
          <p className="text-gray-600 mb-6">
            Este é o seu primeiro acesso. Comece cadastrando pacientes e criando agendamentos.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/patients" className="btn-primary">
              Cadastrar Primeiro Paciente
            </Link>
            <Link to="/appointments" className="px-4 py-2 border border-sapere-brown text-sapere-brown rounded-md hover:bg-sapere-brown hover:text-white transition-colors">
              Criar Agendamento
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardReal;