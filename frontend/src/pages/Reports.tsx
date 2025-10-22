import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, BarChart3, PieChart, Activity } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'attendance' | 'performance' | 'patient';
  period: string;
  generated: string;
  size: string;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'analytics'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data
  const reports: Report[] = [
    {
      id: '1',
      name: 'Relatório Financeiro Mensal',
      type: 'financial',
      period: 'Março 2024',
      generated: '2024-03-15',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Taxa de Comparecimento',
      type: 'attendance',
      period: 'Março 2024',
      generated: '2024-03-14',
      size: '1.2 MB'
    },
    {
      id: '3',
      name: 'Desempenho dos Terapeutas',
      type: 'performance',
      period: 'Trimestre Q1 2024',
      generated: '2024-03-10',
      size: '3.1 MB'
    },
    {
      id: '4',
      name: 'Relatório de Pacientes',
      type: 'patient',
      period: 'Março 2024',
      generated: '2024-03-08',
      size: '1.8 MB'
    }
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'financial': return <TrendingUp className="text-green-600" size={20} />;
      case 'attendance': return <Calendar className="text-blue-600" size={20} />;
      case 'performance': return <BarChart3 className="text-purple-600" size={20} />;
      case 'patient': return <Users className="text-orange-600" size={20} />;
      default: return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'financial': return 'Financeiro';
      case 'attendance': return 'Presença';
      case 'performance': return 'Desempenho';
      case 'patient': return 'Pacientes';
      default: return 'Geral';
    }
  };

  // Mock statistics
  const stats = {
    totalRevenue: 'R$ 45.280',
    attendanceRate: '92%',
    activePatients: '42',
    avgRating: '4.8'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-sm text-gray-600 mt-1">
            Análises e relatórios do desempenho da clínica
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download size={20} className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Taxa de Presença</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePatients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Activity className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'reports', label: 'Relatórios', icon: FileText },
              { key: 'analytics', label: 'Analytics', icon: PieChart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Receita Mensal</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Gráfico de receita será exibido aqui</p>
                    </div>
                  </div>
                </div>

                {/* Attendance Chart Placeholder */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Taxa de Comparecimento</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Gráfico de comparecimento será exibido aqui</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo da Semana</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">28</div>
                    <div className="text-sm text-gray-600">Consultas Realizadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-gray-600">Novos Pacientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">R$ 8.450</div>
                    <div className="text-sm text-gray-600">Receita da Semana</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Relatórios Gerados</h3>
                <button className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  <FileText size={16} className="mr-2" />
                  Gerar Relatório
                </button>
              </div>

              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getReportIcon(report.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{getReportTypeLabel(report.type)}</span>
                            <span>{report.period}</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(report.generated).toLocaleDateString('pt-BR')}
                        </span>
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-8">
              <PieChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Avançados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Funcionalidades de analytics serão implementadas em breve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}