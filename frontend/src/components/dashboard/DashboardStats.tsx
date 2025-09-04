import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, MessageSquare, TrendingUp, FileText, BookOpen } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

const DashboardStats: React.FC = () => {
  const { data, loading } = useDashboard();

  const monthlyData = [
    { month: 'Jan', appointments: 45, communications: 78 },
    { month: 'Fev', appointments: 52, communications: 85 },
    { month: 'Mar', appointments: 48, communications: 92 },
    { month: 'Abr', appointments: 61, communications: 88 },
    { month: 'Mai', appointments: 55, communications: 76 },
    { month: 'Jun', appointments: 67, communications: 94 },
  ];

  const patientTypeData = [
    { name: 'TEA', value: 45, color: '#4F46E5' },
    { name: 'TDAH', value: 32, color: '#10B981' },
    { name: 'DI', value: 23, color: '#F59E0B' },
    { name: 'Outros', value: 12, color: '#EF4444' },
  ];

  const StatCard = ({ icon: Icon, title, value, color, trend }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: string;
    trend?: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{loading ? '...' : value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total de Pacientes"
          value={data.totalPatients}
          color="sapere-blue"
          trend="+12%"
        />
        <StatCard
          icon={Calendar}
          title="Consultas Hoje"
          value={data.appointmentsToday}
          color="sapere-green"
          trend="+5%"
        />
        <StatCard
          icon={MessageSquare}
          title="Comunicações (Semana)"
          value={data.communicationsThisWeek}
          color="sapere-orange"
          trend="+18%"
        />
        <StatCard
          icon={BookOpen}
          title="Anamneses (Mês)"
          value={data.anamnesisThisMonth}
          color="sapere-purple"
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha - Evolução Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução Mensal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="#4F46E5" name="Consultas" />
              <Line type="monotone" dataKey="communications" stroke="#10B981" name="Comunicações" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição por Tipo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Tipo de Atendimento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={patientTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {patientTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Terapias Concluídas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Terapias Concluídas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-sapere-orange-600 mb-2">
              {loading ? '...' : data.therapiesCompleted24h}
            </div>
            <div className="text-sm text-gray-500">Últimas 24 horas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sapere-blue-600 mb-2">
              {loading ? '...' : data.therapiesCompleted7d}
            </div>
            <div className="text-sm text-gray-500">Últimos 7 dias</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sapere-green-600 mb-2">
              {loading ? '...' : data.therapiesCompleted1m}
            </div>
            <div className="text-sm text-gray-500">Último mês</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;