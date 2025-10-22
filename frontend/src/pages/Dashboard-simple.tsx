import { Link } from 'react-router-dom';
import { Users, Calendar, UserCheck, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { 
      title: 'Pacientes Ativos', 
      value: '42', 
      change: '+3 este mês', 
      icon: Users, 
      color: 'bg-orange-500',
      link: '/dashboard/patients' 
    },
    { 
      title: 'Consultas Hoje', 
      value: '8', 
      change: '4 concluídas', 
      icon: Calendar, 
      color: 'bg-green-500',
      link: '/dashboard/appointments' 
    },
    { 
      title: 'Terapeutas', 
      value: '3', 
      change: '2 disponíveis', 
      icon: UserCheck, 
      color: 'bg-blue-500',
      link: '/dashboard/therapists' 
    },
    { 
      title: 'Taxa Sucesso', 
      value: '94%', 
      change: '+2% vs mês anterior', 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      link: '/dashboard/reports' 
    },
  ];

  const recentActivities = [
    { id: 1, text: 'Nova consulta agendada para João Silva', time: '2 min atrás', type: 'appointment' },
    { id: 2, text: 'Paciente Maria Santos confirmou presença', time: '15 min atrás', type: 'confirmation' },
    { id: 3, text: 'Dr. Carlos atualizou prontuário de Pedro', time: '1h atrás', type: 'record' },
    { id: 4, text: 'Novo paciente cadastrado: Ana Costa', time: '2h atrás', type: 'patient' },
  ];

  const upcomingAppointments = [
    { id: 1, patient: 'João Silva', therapist: 'Dra. Maria', time: '14:00', type: 'Neuropsicologia' },
    { id: 2, patient: 'Ana Costa', therapist: 'Dr. Carlos', time: '15:30', type: 'Terapia TEA' },
    { id: 3, patient: 'Pedro Santos', therapist: 'Dra. Maria', time: '16:00', type: 'Avaliação' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/dashboard/patients"
              className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors"
            >
              <Users className="mr-2" size={18} />
              Novo Paciente
            </Link>
            <Link
              to="/dashboard/appointments"
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors"
            >
              <Calendar className="mr-2" size={18} />
              Agendar Consulta
            </Link>
            <Link
              to="/dashboard/appointments"
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors"
            >
              <Clock className="mr-2" size={18} />
              Ver Agenda
            </Link>
            <Link
              to="/dashboard/reports"
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors"
            >
              <TrendingUp className="mr-2" size={18} />
              Relatórios
            </Link>
          </div>
        </div>

        {/* Próximas Consultas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Consultas</h3>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">{appointment.therapist} • {appointment.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                </div>
              </div>
            ))}
            <Link 
              to="/dashboard/appointments"
              className="block text-center text-orange-600 hover:text-orange-700 text-sm font-medium mt-4"
            >
              Ver todas as consultas →
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {activity.type === 'appointment' && <Calendar size={16} className="text-green-600" />}
                {activity.type === 'confirmation' && <Clock size={16} className="text-blue-600" />}
                {activity.type === 'record' && <AlertCircle size={16} className="text-orange-600" />}
                {activity.type === 'patient' && <Users size={16} className="text-purple-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}