import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppNavigation } from '@/components/Navigation';

const SystemSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { goToDashboard } = useAppNavigation();
  const [activeTab, setActiveTab] = useState('profile');


  const clearAllData = () => {
    if (window.confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema (pacientes, agendamentos, anamneses). Esta ação é IRREVERSÍVEL. Tem certeza?')) {
      if (window.confirm('Confirma novamente? Todos os dados serão perdidos permanentemente.')) {
        localStorage.removeItem('sapere_patients');
        localStorage.removeItem('sapere_appointments');
        localStorage.removeItem('sapere_anamneses');
        alert('✅ Todos os dados foram removidos do sistema.');
        goToDashboard();
      }
    }
  };

  const exportData = () => {
    try {
      const data = {
        patients: JSON.parse(localStorage.getItem('sapere_patients') || '[]'),
        appointments: JSON.parse(localStorage.getItem('sapere_appointments') || '[]'),
        anamneses: JSON.parse(localStorage.getItem('sapere_anamneses') || '[]'),
        exportDate: new Date().toISOString(),
        systemVersion: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sapere-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('✅ Backup dos dados exportado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao exportar dados: ' + error);
    }
  };

  const commonStyle = {
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box' as const
  };

  const buttonStyle = {
    ...commonStyle,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const
  };

  const tabButtonStyle = (isActive: boolean) => ({
    ...buttonStyle,
    backgroundColor: isActive ? '#f59e0b' : '#e5e7eb',
    color: isActive ? 'white' : '#374151',
    marginRight: '10px'
  });

  return (
    <div style={{ ...commonStyle, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={goToDashboard}
            style={{
              ...buttonStyle,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            ← Dashboard
          </button>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
              ⚙️ Configurações do Sistema
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
              Sistema Sapere - Administração
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>{user?.name}</span>
          <button onClick={logout} style={{
            ...buttonStyle,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={tabButtonStyle(activeTab === 'profile')}
          >
            👤 Perfil
          </button>
          <button
            onClick={() => setActiveTab('system')}
            style={tabButtonStyle(activeTab === 'system')}
          >
            🗄️ Sistema
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            style={tabButtonStyle(activeTab === 'backup')}
          >
            💾 Backup & Dados
          </button>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'profile' && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: '0', color: '#1f2937', marginBottom: '20px' }}>
              Informações do Usuário
            </h3>

            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Nome Completo</label>
                <div style={{
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '5px',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280'
                }}>
                  {user?.name || 'Não informado'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Email</label>
                <div style={{
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '5px',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280'
                }}>
                  {user?.email || 'Não informado'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Função</label>
                <div style={{
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '5px',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280'
                }}>
                  {user?.role === 'admin' ? 'Administrador' :
                   user?.role === 'therapist' ? 'Terapeuta' :
                   user?.role === 'responsible' ? 'Responsável' :
                   user?.role || 'Não informado'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Status</label>
                <div style={{
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '5px',
                  backgroundColor: '#dcfce7',
                  color: '#166534'
                }}>
                  ✅ Ativo
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: '0', color: '#1f2937', marginBottom: '20px' }}>
              Informações do Sistema
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Sistema Sapere</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <strong>Versão:</strong> 1.0.0
                  </div>
                  <div>
                    <strong>Tipo:</strong> Gestão Clínica
                  </div>
                  <div>
                    <strong>Ambiente:</strong> {window.location.hostname === 'localhost' ? 'Desenvolvimento' : 'Produção'}
                  </div>
                  <div>
                    <strong>Status:</strong> <span style={{ color: '#10b981' }}>✅ Operacional</span>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Estatísticas de Uso</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div>
                    <strong>Pacientes:</strong> {JSON.parse(localStorage.getItem('sapere_patients') || '[]').length}
                  </div>
                  <div>
                    <strong>Agendamentos:</strong> {JSON.parse(localStorage.getItem('sapere_appointments') || '[]').length}
                  </div>
                  <div>
                    <strong>Anamneses:</strong> {JSON.parse(localStorage.getItem('sapere_anamneses') || '[]').length}
                  </div>
                  <div>
                    <strong>Armazenamento:</strong> LocalStorage
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                backgroundColor: '#fef3c7'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>⚠️ Informações Importantes</h4>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
                  <li>Os dados são armazenados localmente no navegador</li>
                  <li>Limpar dados do navegador irá apagar todas as informações</li>
                  <li>Faça backups regulares dos seus dados</li>
                  <li>Para uso em produção, considere implementar um banco de dados</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: '0', color: '#1f2937', marginBottom: '20px' }}>
              Backup e Gerenciamento de Dados
            </h3>

            <div style={{ display: 'grid', gap: '25px' }}>
              {/* Exportar dados */}
              <div style={{
                padding: '20px',
                border: '1px solid #10b981',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#059669' }}>💾 Exportar Dados</h4>
                <p style={{ margin: '0 0 15px 0', color: '#065f46' }}>
                  Faça o download de todos os dados do sistema em formato JSON.
                </p>
                <button
                  onClick={exportData}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  📥 Baixar Backup Completo
                </button>
              </div>

              {/* Estatísticas */}
              <div style={{
                padding: '20px',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                backgroundColor: '#eff6ff'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1d4ed8' }}>📊 Resumo dos Dados</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
                      {JSON.parse(localStorage.getItem('sapere_patients') || '[]').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>Pacientes</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
                      {JSON.parse(localStorage.getItem('sapere_appointments') || '[]').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>Agendamentos</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
                      {JSON.parse(localStorage.getItem('sapere_anamneses') || '[]').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>Anamneses</div>
                  </div>
                </div>
              </div>

              {/* Limpar dados */}
              <div style={{
                padding: '20px',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                backgroundColor: '#fef2f2'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>🗑️ Limpar Dados do Sistema</h4>
                <p style={{ margin: '0 0 15px 0', color: '#991b1b' }}>
                  <strong>⚠️ ATENÇÃO:</strong> Esta ação irá remover TODOS os dados do sistema permanentemente.
                  Esta ação é irreversível. Certifique-se de fazer um backup antes.
                </p>
                <button
                  onClick={clearAllData}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                >
                  🗑️ Apagar Todos os Dados
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voltar ao Dashboard */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={goToDashboard}
            style={{
              ...buttonStyle,
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '16px',
              padding: '15px 30px'
            }}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;