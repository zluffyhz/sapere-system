import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import {
  Users,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  UserPlus,
  CalendarPlus,
  FileCheck,
  PlayCircle
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  activeSessions: number;
  completedToday: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    activeSessions: 0,
    completedToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      setUserName(user.name || 'Usuário');

      // Carregar estatísticas
      const [patientsRes, appointmentsRes, sessionsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${apiUrl}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${apiUrl}/api/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsRes.data.filter((apt: any) =>
        apt.date?.startsWith(today)
      );

      const activeSessions = sessionsRes.data.filter((s: any) =>
        s.status === 'active' || s.status === 'in_progress'
      );

      const completedToday = sessionsRes.data.filter((s: any) =>
        s.status === 'completed' && s.end_time?.startsWith(today)
      );

      setStats({
        totalPatients: patientsRes.data.length || 0,
        totalAppointments: appointmentsRes.data.length || 0,
        todayAppointments: todayAppointments.length || 0,
        activeSessions: activeSessions.length || 0,
        completedToday: completedToday.length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPatients,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Consultas Hoje',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Sessões Ativas',
      value: stats.activeSessions,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Concluídas Hoje',
      value: stats.completedToday,
      icon: FileCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'Novo Paciente',
      description: 'Cadastrar um novo paciente',
      icon: UserPlus,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/patients')
    },
    {
      title: 'Agendar Consulta',
      description: 'Criar novo agendamento',
      icon: CalendarPlus,
      color: 'from-orange-500 to-orange-600',
      onClick: () => navigate('/appointments')
    },
    {
      title: 'Iniciar Consulta',
      description: 'Começar atendimento',
      icon: PlayCircle,
      color: 'from-green-500 to-green-600',
      onClick: () => navigate('/consultation-session')
    },
    {
      title: 'Registros',
      description: 'Ver prontuários',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/patients')
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {userName}!
          </h1>
          <p className="text-orange-50">
            Dashboard - Sistema Sapere de Gestão de Clínica
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-1 text-left group"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estatísticas Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo de Atividades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-800">Resumo de Atividades</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Pacientes Ativos</span>
                <span className="font-semibold text-gray-800">{stats.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Consultas Agendadas</span>
                <span className="font-semibold text-gray-800">{stats.totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Taxa de Conclusão</span>
                <span className="font-semibold text-green-600">
                  {stats.totalAppointments > 0
                    ? Math.round((stats.completedToday / stats.todayAppointments) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Próximas Ações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-800">Próximas Ações</h3>
            </div>
            <div className="space-y-3">
              {stats.todayAppointments > 0 ? (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    Você tem <span className="font-semibold">{stats.todayAppointments}</span> consulta(s) agendada(s) para hoje
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Nenhuma consulta agendada para hoje
                  </p>
                </div>
              )}

              {stats.activeSessions > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">{stats.activeSessions}</span> sessão(ões) em andamento
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/consultation-session')}
                className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-medium rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Iniciar Nova Consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
