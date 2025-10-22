import React from 'react';

const DashboardTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
        Dashboard - Sistema Sapere
      </h1>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
          Bem-vindo ao Sistema Sapere
        </h2>

        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Sistema de gestão para clínica de neurodivergentes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e' }}>Pacientes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>0</p>
          </div>

          <div style={{ backgroundColor: '#dbeafe', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af' }}>Agendamentos</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>0</p>
          </div>

          <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#166534' }}>Sessões</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>0</p>
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Sistema Funcionando ✅
          </h3>
          <p style={{ color: '#6b7280' }}>
            O dashboard está carregando corretamente. Se você está vendo esta mensagem,
            o problema da tela branca foi resolvido.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;