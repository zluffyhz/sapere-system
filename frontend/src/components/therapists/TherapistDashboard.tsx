import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Star,
  Calendar,
  Award,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface ProductivityStats {
  total_sessions: number;
  total_patients: number;
  avg_session_duration: number;
  cancellation_rate: number;
  no_show_rate: number;
  avg_rating: number;
  hourly_distribution: Array<{
    hour: number;
    sessions_count: number;
  }>;
  weekly_trend: Array<{
    week: string;
    sessions_count: number;
    avg_duration: number;
  }>;
}

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
  total_sessions?: number;
  total_patients?: number;
  patient_satisfaction_score?: number;
  specialties_details: Array<{
    name: string;
    color: string;
    experience_level: number;
  }>;
}

interface Props {
  therapist: Therapist;
  onRefresh?: () => void;
}

export default function TherapistDashboard({ therapist, onRefresh }: Props) {
  const [stats, setStats] = useState<ProductivityStats | null>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, [therapist.id, period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Simular chamada à API
      const mockStats: ProductivityStats = {
        total_sessions: 87,
        total_patients: 23,
        avg_session_duration: 52,
        cancellation_rate: 8.5,
        no_show_rate: 3.2,
        avg_rating: 4.7,
        hourly_distribution: [
          { hour: 8, sessions_count: 12 },
          { hour: 9, sessions_count: 15 },
          { hour: 10, sessions_count: 18 },
          { hour: 11, sessions_count: 14 },
          { hour: 14, sessions_count: 16 },
          { hour: 15, sessions_count: 12 },
          { hour: 16, sessions_count: 10 }
        ],
        weekly_trend: [
          { week: '2024-01-01', sessions_count: 18, avg_duration: 50 },
          { week: '2024-01-08', sessions_count: 21, avg_duration: 52 },
          { week: '2024-01-15', sessions_count: 19, avg_duration: 53 },
          { week: '2024-01-22', sessions_count: 23, avg_duration: 51 },
          { week: '2024-01-29', sessions_count: 25, avg_duration: 54 }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangePercentage = (current: number, previous: number): { value: number; isPositive: boolean } => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    change 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
    change?: { value: number; isPositive: boolean };
  }) => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.isPositive ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              {change.value.toFixed(1)}% vs período anterior
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar estatísticas</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          {therapist.avatar_url && (
            <img
              src={therapist.avatar_url}
              alt={therapist.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{therapist.name}</h2>
            <p className="text-sm text-gray-600">Dashboard de Produtividade</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          
          <button
            onClick={fetchStats}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>
          
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Download size={16} className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Sessões"
          value={stats.total_sessions}
          subtitle={`${(stats.total_sessions / parseInt(period) * 7).toFixed(1)} por semana`}
          icon={Calendar}
          color="bg-blue-500"
          change={{ value: 12.5, isPositive: true }}
        />
        
        <StatCard
          title="Pacientes Atendidos"
          value={stats.total_patients}
          subtitle="Únicos no período"
          icon={Users}
          color="bg-green-500"
          change={{ value: 8.3, isPositive: true }}
        />
        
        <StatCard
          title="Duração Média"
          value={`${stats.avg_session_duration}min`}
          subtitle="Por sessão"
          icon={Clock}
          color="bg-yellow-500"
          change={{ value: 2.1, isPositive: false }}
        />
        
        <StatCard
          title="Avaliação Média"
          value={stats.avg_rating.toFixed(1)}
          subtitle="⭐ Satisfação dos pacientes"
          icon={Star}
          color="bg-purple-500"
          change={{ value: 4.2, isPositive: true }}
        />
      </div>

      {/* Specialties */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidades</h3>
        <div className="flex flex-wrap gap-3">
          {therapist.specialties_details.map((specialty, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 rounded-full border"
              style={{ 
                borderColor: specialty.color,
                backgroundColor: specialty.color + '20'
              }}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: specialty.color }}
              />
              <span className="text-sm font-medium">{specialty.name}</span>
              <div className="ml-2 flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i < specialty.experience_level
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Cancelamento</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${stats.cancellation_rate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.cancellation_rate}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Ausência</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${stats.no_show_rate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.no_show_rate}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Satisfação do Paciente</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.avg_rating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.avg_rating}/5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Pico</h3>
          <div className="space-y-3">
            {stats.hourly_distribution
              .sort((a, b) => b.sessions_count - a.sessions_count)
              .slice(0, 5)
              .map((slot, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {String(slot.hour).padStart(2, '0')}:00 - {String(slot.hour + 1).padStart(2, '0')}:00
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ 
                          width: `${(slot.sessions_count / Math.max(...stats.hourly_distribution.map(s => s.sessions_count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{slot.sessions_count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Análise Temporal</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveChart('overview')}
              className={`px-3 py-2 text-sm rounded-lg ${
                activeChart === 'overview'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveChart('sessions')}
              className={`px-3 py-2 text-sm rounded-lg ${
                activeChart === 'sessions'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sessões
            </button>
            <button
              onClick={() => setActiveChart('duration')}
              className={`px-3 py-2 text-sm rounded-lg ${
                activeChart === 'duration'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Duração
            </button>
          </div>
        </div>

        {/* Placeholder for charts - In a real implementation, you would use a charting library like Chart.js or Recharts */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Gráfico de {activeChart} será renderizado aqui</p>
            <p className="text-sm text-gray-400 mt-2">
              Integração com biblioteca de gráficos (Chart.js/Recharts)
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {[
            { time: '14:30', action: 'Sessão concluída', patient: 'João S.', duration: '55min' },
            { time: '13:00', action: 'Sessão concluída', patient: 'Maria O.', duration: '50min' },
            { time: '11:30', action: 'Agendamento movido', patient: 'Pedro L.', duration: 'Para 16:00' },
            { time: '10:00', action: 'Nova avaliação', patient: 'Ana C.', duration: '⭐ 5.0' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.patient}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{activity.time}</p>
                <p className="text-xs text-gray-500">{activity.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}