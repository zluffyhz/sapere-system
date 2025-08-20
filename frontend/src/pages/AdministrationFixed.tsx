import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { adminAPI } from '@/services/api';
import Layout from '@/components/common/Layout';
import CreateTherapistModal from '@/components/admin/CreateTherapistModal';
import CreateUserModal from '@/components/admin/CreateUserModal';
import UserManagementTable from '@/components/admin/UserManagementTable';

const AdministrationFixed: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'users' | 'therapists' | 'settings'>('users');

  // Debug das abas - detectar mudanças
  useEffect(() => {
    console.log('=== DEBUG ABAS ADMINISTRATION FIXED ===');
    console.log('Aba ativa atual:', activeTab);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('=========================================');
  }, [activeTab]);

  const [showCreateTherapist, setShowCreateTherapist] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [changePasswordModal, setChangePasswordModal] = useState({
    isOpen: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: null as string | null
  });

  // Verificar se o usuário é admin
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCreateTherapistSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateUserSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleChangeAdminPassword = async () => {
    if (changePasswordModal.newPassword !== changePasswordModal.confirmPassword) {
      setChangePasswordModal(prev => ({ ...prev, error: 'As senhas não coincidem' }));
      return;
    }

    if (changePasswordModal.newPassword.length < 6) {
      setChangePasswordModal(prev => ({ ...prev, error: 'A senha deve ter pelo menos 6 caracteres' }));
      return;
    }

    setChangePasswordModal(prev => ({ ...prev, loading: true, error: null }));

    try {
      await adminAPI.users.changeAdminPassword(
        changePasswordModal.currentPassword,
        changePasswordModal.newPassword
      );
      
      alert('Senha alterada com sucesso!');
      setChangePasswordModal({
        isOpen: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
        error: null
      });
    } catch (err: any) {
      setChangePasswordModal(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.error || 'Erro ao alterar senha'
      }));
    }
  };

  // Funções de mudança de aba SIMPLIFICADAS
  const switchToUsers = () => {
    console.log('🔄 SWITCH TO USERS CHAMADO');
    setActiveTab('users');
    console.log('✅ Users tab ativada');
  };

  const switchToTherapists = () => {
    console.log('🔄 SWITCH TO THERAPISTS CHAMADO');
    setActiveTab('therapists');
    console.log('✅ Therapists tab ativada');
  };

  const switchToSettings = () => {
    console.log('🔄 SWITCH TO SETTINGS CHAMADO');
    setActiveTab('settings');
    console.log('✅ Settings tab ativada');
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
            Administração (VERSÃO CORRIGIDA)
          </h1>
          <p style={{ color: '#6B7280' }}>
            Gerencie usuários, terapeutas e configurações do sistema
          </p>
        </div>

        {/* Debug Info */}
        <div style={{ 
          backgroundColor: '#FEF3C7', 
          border: '1px solid #F59E0B', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>🐛 Debug Info:</h3>
          <p>Aba ativa: <strong>{activeTab}</strong></p>
          <p>Timestamp: <strong>{new Date().toLocaleTimeString()}</strong></p>
        </div>

        {/* Tabs - VERSÃO SUPER SIMPLIFICADA */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              
              {/* Tab Users */}
              <button
                onClick={switchToUsers}
                style={{
                  padding: '8px 4px',
                  borderBottom: activeTab === 'users' ? '2px solid #3B82F6' : '2px solid transparent',
                  color: activeTab === 'users' ? '#2563EB' : '#6B7280',
                  fontWeight: '500',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>👥</span>
                Gerenciar Usuários
              </button>

              {/* Tab Therapists */}
              <button
                onClick={switchToTherapists}
                style={{
                  padding: '8px 4px',
                  borderBottom: activeTab === 'therapists' ? '2px solid #3B82F6' : '2px solid transparent',
                  color: activeTab === 'therapists' ? '#2563EB' : '#6B7280',
                  fontWeight: '500',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>👨‍⚕️</span>
                Terapeutas
              </button>

              {/* Tab Settings */}
              <button
                onClick={switchToSettings}
                style={{
                  padding: '8px 4px',
                  borderBottom: activeTab === 'settings' ? '2px solid #3B82F6' : '2px solid transparent',
                  color: activeTab === 'settings' ? '#2563EB' : '#6B7280',
                  fontWeight: '500',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>⚙️</span>
                Configurações
              </button>

            </div>
          </div>
        </div>

        {/* Botões de Teste Forçado */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔴 Força Users
          </button>
          <button
            onClick={() => setActiveTab('therapists')}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🟢 Força Therapists
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔵 Força Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  Usuários do Sistema
                </h2>
                <p style={{ color: '#6B7280' }}>
                  Gerencie todos os usuários, altere status e resete senhas quando necessário.
                </p>
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Criar Usuário
              </button>
            </div>
            <UserManagementTable refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'therapists' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  Terapeutas
                </h2>
                <p style={{ color: '#6B7280' }}>
                  Cadastre novos terapeutas e gerencie suas informações profissionais.
                </p>
              </div>
              <button
                onClick={() => setShowCreateTherapist(true)}
                style={{
                  backgroundColor: '#2563EB',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Novo Terapeuta
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
            }}>
              <p style={{ color: '#6B7280' }}>
                Use o botão "Novo Terapeuta" para cadastrar profissionais no sistema. 
                Todos os terapeutas também aparecerão na aba "Gerenciar Usuários" onde você pode 
                alterar status e resetar senhas.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Configurações do Administrador
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Alterar senha do admin */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>
                  Alterar Minha Senha
                </h3>
                <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                  Altere sua senha de administrador para manter a segurança da conta.
                </p>
                <button
                  onClick={() => setChangePasswordModal({ ...changePasswordModal, isOpen: true })}
                  style={{
                    backgroundColor: '#2563EB',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Alterar Senha
                </button>
              </div>

              {/* Informações do sistema */}
              <div style={{ 
                backgroundColor: 'white', 
                padding: '24px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>
                  Informações do Sistema
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div>
                    <span style={{ fontWeight: '500' }}>Usuário logado:</span> {user.name}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Email:</span> {user.email}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Papel:</span> Administrador
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Status:</span> 
                    <span style={{ 
                      marginLeft: '4px', 
                      padding: '2px 8px', 
                      backgroundColor: '#D1FAE5', 
                      color: '#065F46', 
                      borderRadius: '9999px', 
                      fontSize: '12px' 
                    }}>
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal criar terapeuta */}
      <CreateTherapistModal
        isOpen={showCreateTherapist}
        onClose={() => setShowCreateTherapist(false)}
        onSuccess={handleCreateTherapistSuccess}
      />

      {/* Modal alterar senha admin */}
      {changePasswordModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>
                Alterar Senha do Administrador
              </h3>
              
              {changePasswordModal.error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  {changePasswordModal.error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Senha atual
                  </label>
                  <input
                    type="password"
                    value={changePasswordModal.currentPassword}
                    onChange={(e) => setChangePasswordModal(prev => ({
                      ...prev,
                      currentPassword: e.target.value,
                      error: null
                    }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Nova senha
                  </label>
                  <input
                    type="password"
                    value={changePasswordModal.newPassword}
                    onChange={(e) => setChangePasswordModal(prev => ({
                      ...prev,
                      newPassword: e.target.value,
                      error: null
                    }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    minLength={6}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    value={changePasswordModal.confirmPassword}
                    onChange={(e) => setChangePasswordModal(prev => ({
                      ...prev,
                      confirmPassword: e.target.value,
                      error: null
                    }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    minLength={6}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setChangePasswordModal({
                    isOpen: false,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    loading: false,
                    error: null
                  })}
                  style={{
                    padding: '8px 16px',
                    color: '#374151',
                    backgroundColor: '#F3F4F6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  disabled={changePasswordModal.loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeAdminPassword}
                  disabled={changePasswordModal.loading || !changePasswordModal.currentPassword || !changePasswordModal.newPassword}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    opacity: (changePasswordModal.loading || !changePasswordModal.currentPassword || !changePasswordModal.newPassword) ? 0.5 : 1
                  }}
                >
                  {changePasswordModal.loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={handleCreateUserSuccess}
      />
    </Layout>
  );
};

export default AdministrationFixed;