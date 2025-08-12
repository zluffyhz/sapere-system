import React from 'react';
import { useAuth } from '@/context/AuthContext';

const DebugAuth: React.FC = () => {
  const { user, token, isAuthenticated, hasRole, hasAnyRole } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug de Autenticação</h1>
      
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Estado da Autenticação</h2>
        <div className="space-y-2">
          <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : '❌ Sem token'}</p>
        </div>
      </div>

      {user && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Dados do Usuário</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Nome:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Verificações de Roles</h2>
        <div className="space-y-2">
          <p><strong>hasRole('admin'):</strong> {hasRole('admin') ? '✅' : '❌'}</p>
          <p><strong>hasRole('therapist'):</strong> {hasRole('therapist') ? '✅' : '❌'}</p>
          <p><strong>hasRole('profissional'):</strong> {hasRole('profissional') ? '✅' : '❌'}</p>
          <p><strong>hasRole('responsible'):</strong> {hasRole('responsible') ? '✅' : '❌'}</p>
          <p><strong>hasAnyRole(['admin', 'therapist']):</strong> {hasAnyRole(['admin', 'therapist']) ? '✅' : '❌'}</p>
          <p><strong>hasAnyRole(['admin', 'profissional', 'therapist']):</strong> {hasAnyRole(['admin', 'profissional', 'therapist']) ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;