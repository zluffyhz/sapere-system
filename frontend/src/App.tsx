import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { SystemNotificationsProvider } from '@/context/SystemNotificationsContext';
import NotificationProvider from '@/context/NotificationContext';
import ProtectedRoute, { AdminRoute, ClinicalRoute } from '@/components/common/ProtectedRoute';
import Layout from '@/components/common/Layout';
import Home from '@/pages/Home';
import LoginSimple from '@/pages/LoginSimple';
import DashboardReal from '@/pages/DashboardReal';
import PatientsReal from '@/pages/PatientsReal';
import AppointmentsReal from '@/pages/AppointmentsReal';
import TherapyReal from '@/pages/TherapyReal';
import CommunicationReal from '@/pages/CommunicationReal';
import AnamneseUpload from '@/pages/AnamneseUpload';
import Therapists from '@/pages/Therapists';
import Administration from '@/pages/Administration';
import Profile from '@/pages/Profile';


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
    <Routes>
      {/* Rota inicial */}
      <Route path="/" element={<Home />} />
      
      {/* Rota pública de login */}
      <Route 
        path="/login" 
        element={<LoginSimple />} 
      />
      
      {/* Rotas protegidas */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                  {/* Dashboard Principal */}
                  <Route path="/" element={<DashboardReal />} />
                  
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
                        <AnamneseUpload />
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
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SystemNotificationsProvider>
        <DashboardProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </DashboardProvider>
      </SystemNotificationsProvider>
    </AuthProvider>
  );
};

export default App;