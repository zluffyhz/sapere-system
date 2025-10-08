import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { navigationManager } from '@/services/navigationService';
import NotificationProvider from '@/context/NotificationContext';
import Layout from '@/components/common/Layout';
import Login from '@/pages/Login.tsx';
import DashboardReal from '@/pages/DashboardReal.tsx';
import DashboardTest from '@/pages/DashboardTest.tsx';
import SimpleDashboard from '@/pages/SimpleDashboard.tsx';
import PatientManagement from '@/pages/PatientManagement.tsx';
import AppointmentManagement from '@/pages/AppointmentManagement.tsx';
import AnamneseManagement from '@/pages/AnamneseManagement.tsx';
import SystemSettings from '@/pages/SystemSettings.tsx';
import AppointmentsReal from '@/pages/AppointmentsReal.tsx';
import PatientsReal from '@/pages/PatientsReal.tsx';
import Profile from '@/pages/Profile.tsx';
import AnamneseReal from '@/pages/AnamneseReal.tsx';
import Administration from '@/pages/Administration.tsx';
import Therapists from '@/pages/Therapists.tsx';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoadingTimeout, setShowLoadingTimeout] = React.useState(false);

  // Proteção: Se loading demorar mais de 3 segundos, mostrar mensagem
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoadingTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
          {showLoadingTimeout && (
            <div className="mt-4">
              <p className="text-yellow-600 text-sm">Verificando conexão...</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="mt-2 text-sapere-orange underline text-sm"
              >
                Ir para login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para layout protegido
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // Initialize navigation service
  useEffect(() => {
    navigationManager.setNavigation(navigate);
  }, [navigate]);

  // Proteção contra loading infinito
  useEffect(() => {
    if (isLoading) {
      console.log('🔄 Sistema carregando...');
      const timer = setTimeout(() => {
        console.warn('⚠️ Loading demorou mais de 2 segundos');
        setLoadingTimeout(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      console.log('✅ Sistema carregado!');
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sapere-orange to-orange-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Sistema Sapere</h2>
          <p className="text-white/80 mt-2">Carregando...</p>
          {loadingTimeout && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm">Isso está demorando mais que o esperado</p>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="mt-2 bg-white text-sapere-orange px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100"
              >
                Reiniciar Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rota pública */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <SimpleDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientManagement />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        } 
      />
      
      <Route
        path="/anamnese"
        element={
          <ProtectedRoute>
            <AnamneseManagement />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/therapists" 
        element={
          <ProtectedLayout>
            <Therapists />
          </ProtectedLayout>
        } 
      />
      
      <Route
        path="/administration"
        element={
          <ProtectedLayout>
            <Administration />
          </ProtectedLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SystemSettings />
          </ProtectedRoute>
        }
      />

      {/* Rota 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Página não encontrada</h1>
              <p className="text-gray-600 mb-4">A página que você está procurando não existe.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-sapere-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Ir para Dashboard
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// Componente raiz da aplicação
const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;