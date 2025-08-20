import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { adminAPI } from '@/services/api';
import Layout from '@/components/common/Layout';
import CreateTherapistModal from '@/components/admin/CreateTherapistModal';
import CreateUserModal from '@/components/admin/CreateUserModal';
import UserManagementTable from '@/components/admin/UserManagementTable';

const Administration: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'users' | 'therapists' | 'settings'>('users');

  // Debug das abas - detectar mudanças
  useEffect(() => {
    console.log('=== DEBUG ABAS ADMINISTRATION ===');
    console.log('Aba ativa atual:', activeTab);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('===================================');
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

  const tabs = [
    { id: 'users', label: 'Gerenciar Usuários', icon: '👥' },
    { id: 'therapists', label: 'Terapeutas', icon: '👨‍⚕️' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600 mt-2">Gerencie usuários, terapeutas e configurações do sistema</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🔄 ANTES: aba atual = ${activeTab}`);
                    console.log(`🔄 Clicando na aba ${tab.label.toUpperCase()}`);
                    setActiveTab(tab.id as any);
                    console.log(`🔄 DEPOIS: mudando para = ${tab.id}`);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    cursor: 'pointer'
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Usuários do Sistema</h2>
                <p className="text-gray-600 mt-1">
                  Gerencie todos os usuários, altere status e resete senhas quando necessário.
                </p>
              </div>
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                + Criar Usuário
              </button>
            </div>
            <UserManagementTable refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'therapists' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Terapeutas</h2>
                <p className="text-gray-600 mt-1">
                  Cadastre novos terapeutas e gerencie suas informações profissionais.
                </p>
              </div>
              <button
                onClick={() => setShowCreateTherapist(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Novo Terapeuta
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">
                Use o botão "Novo Terapeuta" para cadastrar profissionais no sistema. 
                Todos os terapeutas também aparecerão na aba "Gerenciar Usuários" onde você pode 
                alterar status e resetar senhas.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações do Administrador</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alterar senha do admin */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Minha Senha</h3>
                <p className="text-gray-600 mb-4">
                  Altere sua senha de administrador para manter a segurança da conta.
                </p>
                <button
                  onClick={() => setChangePasswordModal({ ...changePasswordModal, isOpen: true })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Alterar Senha
                </button>
              </div>

              {/* Informações do sistema */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Usuário logado:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Papel:</span> Administrador
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Alterar Senha do Administrador
              </h3>
              
              {changePasswordModal.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {changePasswordModal.error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setChangePasswordModal({
                    isOpen: false,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    loading: false,
                    error: null
                  })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={changePasswordModal.loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeAdminPassword}
                  disabled={changePasswordModal.loading || !changePasswordModal.currentPassword || !changePasswordModal.newPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

export default Administration;