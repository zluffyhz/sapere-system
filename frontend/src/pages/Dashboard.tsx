import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw, Users, Calendar, MessageSquare, FileText, Play, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { useDashboard } from '@/context/DashboardContext';
import { useAuth } from '@/context/AuthContext';
import { healthCheck, debugAPI, protectedAPI } from '@/services/api';
import SimpleTabTest from '@/components/test/SimpleTabTest';

const Dashboard: React.FC = () => {
  const { todaySessions, recentActivities, loading, refreshData } = useDashboard();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingAPI, setLoadingAPI] = useState(false);

  // Testar conectividade com a API
  const testAPIConnection = async () => {
    console.log('🧪 Dashboard: Testing API connection...');
    setLoadingAPI(true);
    try {
      const status = await debugAPI.testConnection();
      setApiStatus(status);
      console.log('🧪 Dashboard: API test result:', status);
      
      // Tentar carregar dados do dashboard se autenticado
      if (isAuthenticated && status.health.status === 'healthy') {
        try {
          console.log('📊 Dashboard: Fetching protected dashboard data...');
          const data = await protectedAPI.getDashboard();
          setDashboardData(data);
          console.log('✅ Dashboard: Protected data loaded:', data);
        } catch (error) {
          console.error('❌ Dashboard: Failed to load protected data:', error);
        }
      }
    } catch (error) {
      console.error('❌ Dashboard: API test failed:', error);
    } finally {
      setLoadingAPI(false);
    }
  };

  useEffect(() => {
    console.log('📋 Dashboard: Component mounted');
    console.log('👤 User:', user);
    console.log('🔒 Is Authenticated:', isAuthenticated);
    
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a[href]');
    console.log(`🔘 Total buttons: ${buttons.length}`);
    console.log(`🔗 Total links: ${links.length}`);
    
    // Testar API automaticamente
    testAPIConnection();
  }, [isAuthenticated]);

  const handleRefreshData = async () => {
    console.log('🔄 Dashboard: Manual refresh triggered');
    await refreshData();
    await testAPIConnection();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Aguardando';
      case 'completed': return 'Concluído';
      case 'first_time': return 'Primeira consulta';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'first_time': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getGradientClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-gradient-to-r from-orange-50 to-amber-50 border-sapere-orange/20';
      case 'pending': return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-sapere-yellow/30';
      case 'completed': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'first_time': return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
      default: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sapere-brown">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Visão geral e métricas do Centro de Desenvolvimento Sapere</p>
        </div>
        <button
          onClick={handleRefreshData}
          className="btn-secondary flex items-center gap-2"
          disabled={loading || loadingAPI}
        >
          <RefreshCw className={`h-4 w-4 ${(loading || loadingAPI) ? 'animate-spin' : ''}`} />
          {(loading || loadingAPI) ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* TESTE DE ABAS - REMOVER APÓS CORREÇÃO */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>TESTE DE ABAS:</strong> Componente de teste para verificar funcionalidade das abas
            </p>
          </div>
        </div>
      </div>
      <SimpleTabTest />

      {/* Cards de Resumo Estatístico */}
      <DashboardStats />

      {/* Seção de Pacientes do Dia e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border-2 border-sapere-orange p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-sapere-brown flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Sessões de Hoje</span>
            </h3>
            <span className="bg-sapere-orange text-white text-xs px-2 py-1 rounded-full font-medium">
              {todaySessions.length} sessões
            </span>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
              </div>
            ) : todaySessions.length > 0 ? (
              todaySessions.map(session => (
                <div key={session.id} className={`flex items-center space-x-4 p-4 rounded-lg border hover:shadow-md transition-shadow ${getGradientClass(session.status)}`}>
                  <div className="flex-shrink-0">
                    <div className={`h-12 w-12 rounded-full ${session.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-sm font-bold">{session.patientInitials}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sapere-brown">
                      {session.patientName}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center space-x-1">
                      <span>👨‍⚕️ {session.professionalName}</span>
                      <span>•</span>
                      <span className="font-medium">{session.time}</span>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(session.status)}`}>
                        {getStatusLabel(session.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma sessão agendada para hoje</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-sapere-orange p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-sapere-brown flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm0 10v-5a2 2 0 012-2h5" />
              </svg>
              <span>Atividades Recentes</span>
            </h3>
            <span className="bg-sapere-orange text-white text-xs px-2 py-1 rounded-full font-medium">
              {recentActivities.length} atividades
            </span>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`h-3 w-3 ${activity.color} rounded-full mt-2 shadow-sm`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-sapere-brown">
                      <span className="font-semibold">{activity.title}</span> {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-blue-600 font-medium">{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm0 10v-5a2 2 0 012-2h5" />
                </svg>
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Teste - Seção de Debug */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Teste de Navegação</h3>
          <p className="text-sm text-gray-600">Testando os botões do header - Usuário: {user?.name} ({user?.role})</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            to="/patients"
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sapere-orange transition-colors"
            onClick={() => console.log('Clicando no link Pacientes')}
          >
            <Users className="h-6 w-6 text-sapere-orange" />
            <span className="text-sm font-medium text-gray-700">Pacientes</span>
          </Link>
          <button
            onClick={() => {
              console.log('Navegando para /patients via button');
              navigate('/patients');
            }}
            className="flex flex-col items-center space-y-2 p-4 border border-sapere-orange bg-sapere-orange/10 rounded-lg hover:bg-sapere-orange/20 transition-colors"
          >
            <Users className="h-6 w-6 text-sapere-orange" />
            <span className="text-sm font-medium text-sapere-brown">Botão Pacientes</span>
          </button>

          <button
            onClick={() => {
              console.log('Navegando para /appointments via button');
              navigate('/appointments');
            }}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sapere-orange transition-colors"
          >
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Agendamentos</span>
          </button>

          <button
            onClick={() => {
              console.log('Navegando para /therapy via button');
              navigate('/therapy');
            }}
            className="flex flex-col items-center space-y-2 p-4 border border-sapere-orange bg-sapere-orange/10 rounded-lg hover:bg-sapere-orange/20 transition-colors"
          >
            <Play className="h-6 w-6 text-sapere-orange" />
            <span className="text-sm font-medium text-sapere-brown">Terapia</span>
          </button>

          <button
            onClick={() => {
              console.log('Navegando para /communication via button');
              navigate('/communication');
            }}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sapere-orange transition-colors"
          >
            <MessageSquare className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Comunicação</span>
          </button>

          <button
            onClick={() => {
              console.log('Navegando para /anamnese via button');
              navigate('/anamnese');
            }}
            className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sapere-orange transition-colors"
          >
            <FileText className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Anamneses</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Todos os botões devem funcionar agora!</strong> Clique em qualquer botão acima para testar a navegação.
          </p>
          <div className="mt-2 text-xs text-green-700">
            <p>• Link Pacientes (React Router Link)</p>
            <p>• Botões com useNavigate hook</p>
            <p>• Console logs para debug</p>
          </div>
        </div>
        {/* Status da API */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Status da Conexão com API
          </h4>
          {loadingAPI ? (
            <div className="mt-2 text-xs text-blue-600">
              <p>Testando conectividade...</p>
            </div>
          ) : apiStatus ? (
            <div className="mt-2 text-xs space-y-1">
              <p><strong>Ambiente:</strong> {apiStatus.environment}</p>
              <p><strong>API URL:</strong> {apiStatus.apiUrl}</p>
              <p><strong>Saúde:</strong> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  apiStatus.health.status === 'healthy' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {apiStatus.health.status === 'healthy' ? '✅ Saudável' : '❌ Problema'}
                </span>
              </p>
              <p><strong>Autenticado:</strong> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  apiStatus.authenticated 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {apiStatus.authenticated ? '✅ Sim' : '❌ Não'}
                </span>
              </p>
              {dashboardData && (
                <p><strong>Dados Protegidos:</strong> 
                  <span className="ml-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                    ✅ Carregados
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-600">
              <p>Clique em "Testar API" para verificar conectividade</p>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={testAPIConnection}
              disabled={loadingAPI}
              className="btn-secondary text-xs"
            >
              {loadingAPI ? '🔄 Testando...' : '🧪 Testar API'}
            </button>
            <button
              onClick={() => {
                console.log('🔧 Navegando para página de teste de botões');
                navigate('/button-test');
              }}
              className="btn-primary text-xs"
            >
              🔧 Teste de Botões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;