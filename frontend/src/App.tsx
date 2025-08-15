import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { SystemNotificationsProvider } from '@/context/SystemNotificationsContext';
import NotificationProvider from '@/context/NotificationContext';
import ProtectedRoute, { AdminRoute, ProfissionalRoute, ClinicalRoute } from '@/components/common/ProtectedRoute';
import Layout from '@/components/common/Layout';
import Login from '@/pages/Login';
import DashboardReal from '@/pages/DashboardReal';
import PatientsReal from '@/pages/PatientsReal';
import AppointmentsReal from '@/pages/AppointmentsReal';
import TherapyReal from '@/pages/TherapyReal';
import CommunicationReal from '@/pages/CommunicationReal';
import AnamneseReal from '@/pages/AnamneseReal';
import Therapists from '@/pages/Therapists';
import TherapistDashboard from '@/pages/TherapistDashboard';
import Profile from '@/pages/Profile';
import TherapySession from '@/pages/TherapySession';
import DebugAuth from '@/pages/DebugAuth';
import Administration from '@/pages/Administration';

// Páginas de teste para demonstrar funcionalidades por role
const TestRolesPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sapere-brown">Teste de Roles e Permissões</h1>
        <p className="text-gray-600">Página para testar o sistema de autenticação baseado em roles</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Suas informações:</h2>
        <div className="bg-sapere-gray p-4 rounded-lg">
          <p><strong>Nome:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Status:</strong> {user?.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminRoute fallback={<div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-500">Seção Admin</h3>
          <p className="text-sm text-gray-400 mt-2">Disponível apenas para administradores</p>
        </div>}>
          <div className="card bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">🔒 Seção Admin</h3>
            <p className="text-sm text-red-600 mt-2">Você tem acesso total ao sistema!</p>
            <ul className="text-xs text-red-600 mt-2 space-y-1">
              <li>• Gerenciar usuários</li>
              <li>• Configurações da clínica</li>
              <li>• Relatórios completos</li>
            </ul>
          </div>
        </AdminRoute>

        <ProfissionalRoute fallback={<div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-500">Seção Profissional</h3>
          <p className="text-sm text-gray-400 mt-2">Disponível apenas para profissionais</p>
        </div>}>
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800">🩺 Seção Profissional</h3>
            <p className="text-sm text-blue-600 mt-2">Área clínica disponível para você!</p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1">
              <li>• Criar prontuários</li>
              <li>• Gerenciar agenda</li>
              <li>• Visualizar pacientes</li>
            </ul>
          </div>
        </ProfissionalRoute>

        <div className="card bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-800">👨‍👩‍👧‍👦 Área Comum</h3>
          <p className="text-sm text-green-600 mt-2">Disponível para todos os usuários</p>
          <ul className="text-xs text-green-600 mt-2 space-y-1">
            <li>• Dashboard pessoal</li>
            <li>• Perfil do usuário</li>
            <li>• Notificações</li>
          </ul>
        </div>
      </div>

      <ClinicalRoute>
        <div className="card bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-purple-800">🏥 Área Clínica</h3>
          <p className="text-sm text-purple-600 mt-2">
            Área restrita para profissionais da clínica (Admin e Profissionais)
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-purple-200">
              <h4 className="font-medium text-purple-800 text-sm">Pacientes</h4>
              <p className="text-xs text-purple-600 mt-1">Acesso a todos os pacientes da clínica</p>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <h4 className="font-medium text-purple-800 text-sm">Agendamentos</h4>
              <p className="text-xs text-purple-600 mt-1">Criar e gerenciar consultas</p>
            </div>
          </div>
        </div>
      </ClinicalRoute>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rota pública de login */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        
        {/* Rotas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard - todos podem acessar */}
                  <Route path="/" element={<DashboardReal />} />
                  
                  {/* Página de teste de roles - todos podem acessar */}
                  <Route path="/test-roles" element={<TestRolesPage />} />
                  
                  {/* Debug de autenticação */}
                  <Route path="/debug-auth" element={<DebugAuth />} />
                  
                  {/* Páginas que serão implementadas */}
                  <Route 
                    path="/patients" 
                    element={
                      <ClinicalRoute>
                        <PatientsReal />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/appointments" 
                    element={
                      <ClinicalRoute>
                        <AppointmentsReal />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/calendar" 
                    element={
                      <ClinicalRoute>
                        <AppointmentsReal />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/therapists" 
                    element={
                      <AdminRoute>
                        <Therapists />
                      </AdminRoute>
                    } 
                  />
                  
                  <Route 
                    path="/therapists/:id" 
                    element={
                      <ClinicalRoute>
                        <TherapistDashboard />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/communication" 
                    element={
                      <ClinicalRoute>
                        <CommunicationReal />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/anamnese" 
                    element={
                      <ClinicalRoute>
                        <AnamneseReal />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/therapy" 
                    element={
                      <ClinicalRoute>
                        <TherapyReal />
                      </ClinicalRoute>
                    } 
                  />

                  <Route 
                    path="/session/:appointmentId?" 
                    element={
                      <ClinicalRoute>
                        <TherapyReal />
                      </ClinicalRoute>
                    } 
                  />
                  
                  <Route 
                    path="/administration" 
                    element={
                      <AdminRoute>
                        <Administration />
                      </AdminRoute>
                    } 
                  />
                  
                  <Route 
                    path="/settings" 
                    element={
                      <AdminRoute>
                        <div className="text-center p-8">
                          <h2 className="text-xl font-semibold mb-4">Configurações da Clínica</h2>
                          <p className="text-gray-600">Em construção - Apenas Administradores</p>
                        </div>
                      </AdminRoute>
                    } 
                  />

                  <Route path="/profile" element={<Profile />} />
                  
                  
                  {/* Página 404 para rotas não encontradas */}
                  <Route 
                    path="*" 
                    element={
                      <div className="text-center p-8">
                        <h2 className="text-xl font-semibold mb-4">Página não encontrada</h2>
                        <p className="text-gray-600">A página que você está procurando não existe.</p>
                      </div>
                    } 
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SystemNotificationsProvider>
        <DashboardProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </DashboardProvider>
      </SystemNotificationsProvider>
    </AuthProvider>
  );
};

export default App;