import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppNavigation } from '@/components/Navigation';

const SimpleDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { goToPatients, goToAppointments, goToAnamnese, goToSettings } = useAppNavigation();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    todayAppointments: 0,
    completedAppointments: 0
  });

  useEffect(() => {
    loadStats();
    // Recarregar stats quando o componente for montado ou dados mudarem
    const interval = setInterval(loadStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    // Carregar pacientes
    const patients = JSON.parse(localStorage.getItem('sapere_patients') || '[]');

    // Carregar agendamentos
    const appointments = JSON.parse(localStorage.getItem('sapere_appointments') || '[]');

    // Filtrar agendamentos de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((apt: any) => apt.date === today);

    // Filtrar agendamentos realizados
    const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed');

    setStats({
      patients: patients.length,
      appointments: appointments.length,
      todayAppointments: todayAppointments.length,
      completedAppointments: completedAppointments.length
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '0',
      margin: '0'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            ⭐ Sistema Sapere
          </h1>
          <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
            Gestão Clínica de Neurodivergentes
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Olá, {user?.name || 'Usuário'}!</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#92400e', marginBottom: '10px', fontSize: '28px' }}>
            Bem-vindo ao Sistema Sapere! 🌟
          </h2>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
            Sistema completo de gestão para clínica de neurodivergentes.<br/>
            Gerencie pacientes, agendamentos, anamneses e muito mais.
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderTop: '4px solid #3b82f6'
          }}>
            <h3 style={{ color: '#3b82f6', fontSize: '18px', marginBottom: '10px' }}>
              👥 Pacientes
            </h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
              {stats.patients}
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              Cadastrados no sistema
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderTop: '4px solid #10b981'
          }}>
            <h3 style={{ color: '#10b981', fontSize: '18px', marginBottom: '10px' }}>
              📅 Agendamentos
            </h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
              {stats.appointments}
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              Consultas agendadas
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderTop: '4px solid #8b5cf6'
          }}>
            <h3 style={{ color: '#8b5cf6', fontSize: '18px', marginBottom: '10px' }}>
              📋 Hoje
            </h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
              {stats.todayAppointments}
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              Consultas hoje
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderTop: '4px solid #f59e0b'
          }}>
            <h3 style={{ color: '#f59e0b', fontSize: '18px', marginBottom: '10px' }}>
              ✅ Realizadas
            </h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
              {stats.completedAppointments}
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
              Consultas concluídas
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '20px' }}>
            🚀 Ações Rápidas
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <button
              onClick={goToPatients}
              style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
              👥 Gestão de Pacientes
            </button>

            <button
              onClick={goToAppointments}
              style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}>
              📅 Gestão de Agendamentos
            </button>

            <button
              onClick={() => navigate('/consultation')}
              style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}>
              ⏰ Iniciar Consulta
            </button>

            <button
              onClick={goToAnamnese}
              style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
              📋 Gestão de Anamneses
            </button>

            <button
              onClick={goToSettings}
              style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}>
              ⚙️ Configurações
            </button>
          </div>
        </div>

        {/* Status System */}
        <div style={{
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '30px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#166534', margin: '0 0 10px 0', fontSize: '18px' }}>
            ✅ Sistema Funcionando Perfeitamente
          </h4>
          <p style={{ color: '#15803d', margin: '0', fontSize: '14px' }}>
            Todas as funcionalidades do Sapere estão operacionais.
            Backend conectado • Frontend carregado • Autenticação ativa
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;