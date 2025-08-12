import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  phone?: string;
  last_login_at?: string;
  created_at: string;
  therapist_info?: {
    id: string;
    professional_id?: string;
    active: boolean;
  };
}

interface UserManagementTableProps {
  refreshTrigger: number;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ refreshTrigger }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    user: User | null;
    newPassword: string;
    loading: boolean;
  }>({
    isOpen: false,
    user: null,
    newPassword: '',
    loading: false
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users.list();
      setUsers(response.users || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminAPI.users.updateStatus(userId, newStatus);
      await loadUsers(); // Recarregar lista
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordModal.user || !resetPasswordModal.newPassword) {
      alert('Usuário e nova senha são obrigatórios');
      return;
    }

    if (resetPasswordModal.newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setResetPasswordModal(prev => ({ ...prev, loading: true }));

    try {
      await adminAPI.users.resetPassword(resetPasswordModal.user.id, resetPasswordModal.newPassword);
      alert(`Senha resetada com sucesso para ${resetPasswordModal.user.name}`);
      setResetPasswordModal({
        isOpen: false,
        user: null,
        newPassword: '',
        loading: false
      });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao resetar senha');
      setResetPasswordModal(prev => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const statusLabels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      therapist: 'bg-blue-100 text-blue-800'
    };

    const roleLabels = {
      admin: 'Administrador',
      therapist: 'Terapeuta'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabels[role as keyof typeof roleLabels] || role}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Papel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                      {user.therapist_info?.professional_id && (
                        <div className="text-xs text-blue-600">{user.therapist_info.professional_id}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.last_login_at || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="pending">Pendente</option>
                    </select>
                    
                    <button
                      onClick={() => setResetPasswordModal({
                        isOpen: true,
                        user,
                        newPassword: '',
                        loading: false
                      })}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      Resetar Senha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de reset de senha */}
      {resetPasswordModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resetar Senha - {resetPasswordModal.user?.name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={resetPasswordModal.newPassword}
                  onChange={(e) => setResetPasswordModal(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a nova senha"
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setResetPasswordModal({
                    isOpen: false,
                    user: null,
                    newPassword: '',
                    loading: false
                  })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={resetPasswordModal.loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resetPasswordModal.loading || !resetPasswordModal.newPassword}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {resetPasswordModal.loading ? 'Resetando...' : 'Resetar Senha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementTable;