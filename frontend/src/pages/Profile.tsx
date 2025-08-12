// Página de perfil do usuário
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Save,
  X,
  Camera,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: typeof user?.address === 'string' ? user.address : '',
    bio: user?.bio || ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validações básicas
      if (!profileForm.name.trim()) {
        setErrors({ name: 'Nome é obrigatório' });
        return;
      }

      if (!profileForm.email.trim()) {
        setErrors({ email: 'Email é obrigatório' });
        return;
      }

      // Simular atualização do perfil
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
        bio: profileForm.bio
      });

      success('Perfil atualizado com sucesso');
      setIsEditing(false);
    } catch (err) {
      error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validações
      if (!passwordForm.currentPassword) {
        setErrors({ currentPassword: 'Senha atual é obrigatória' });
        return;
      }

      if (!passwordForm.newPassword) {
        setErrors({ newPassword: 'Nova senha é obrigatória' });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setErrors({ newPassword: 'Nova senha deve ter pelo menos 6 caracteres' });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setErrors({ confirmPassword: 'Senhas não conferem' });
        return;
      }

      // Simular alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Senha alterada com sucesso');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      profissional: 'Profissional',
      responsible: 'Responsável'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      profissional: 'bg-blue-100 text-blue-800',
      responsible: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown flex items-center gap-2">
            <User className="h-6 w-6" />
            Meu Perfil
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Alterar Senha
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Perfil
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setProfileForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    address: typeof user?.address === 'string' ? user.address : '',
                    bio: user?.bio || ''
                  });
                  setErrors({});
                }}
                className="btn-secondary flex items-center gap-2"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                className="btn-primary flex items-center gap-2"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto e informações básicas */}
        <div className="card p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="h-24 w-24 bg-sapere-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-gray-200 hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {user?.name}
            </h3>
            
            {user?.role && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                <Shield className="h-4 w-4 mr-1" />
                {getRoleLabel(user.role)}
              </span>
            )}

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
              
              {user?.createdAt && (
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulário de informações */}
        <div className="lg:col-span-2 card p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Informações Pessoais</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.name}</p>
                )}
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user?.email}</p>
                )}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {user?.phone || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Endereço
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                    placeholder="Seu endereço"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {typeof user?.address === 'string' ? user.address : 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia
              </label>
              {isEditing ? (
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Conte um pouco sobre você..."
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                  {user?.bio || 'Nenhuma biografia adicionada'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de alteração de senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPasswordModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
                  <button 
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Digite a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirme a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;