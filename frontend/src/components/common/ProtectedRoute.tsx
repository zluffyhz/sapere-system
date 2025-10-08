import React, { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[]; // Roles permitidos para acessar a rota
  requireAll?: boolean; // Se true, usuário deve ter TODOS os roles. Se false, apenas UM
  fallbackPath?: string; // Caminho para redirecionar se não autorizado
  showUnauthorized?: boolean; // Se true, mostra tela de não autorizado em vez de redirecionar
}

const UnauthorizedPage: React.FC<{ userRole?: UserRole; requiredRoles?: UserRole[]; onGoBack: () => void }> = ({
  userRole,
  requiredRoles,
  onGoBack
}) => {
  const navigate = useNavigate();
  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        Acesso Negado
      </h1>
      
      <p className="text-gray-600 mb-6">
        Você não tem permissão para acessar esta página.
      </p>
      
      {userRole && requiredRoles && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Seu perfil:</strong> {getRoleLabel(userRole)}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Perfis necessários:</strong> {requiredRoles.map(getRoleLabel).join(', ')}
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        <button
          onClick={onGoBack}
          className="w-full btn-primary"
        >
          Voltar
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-sapere-brown hover:text-sapere-orange transition-colors"
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange"></div>
      <p className="text-gray-600">Verificando permissões...</p>
    </div>
  </div>
);

// Helper para mapear roles para labels em português
const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: 'Administrador',
    profissional: 'Profissional',
    therapist: 'Terapeuta',
    responsible: 'Responsável'
  };
  return labels[role] || role;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
  requireAll = false,
  fallbackPath = '/login',
  showUnauthorized = false
}) => {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace 
      />
    );
  }

  // Se não foram especificados roles, apenas verificar se está autenticado
  if (roles.length === 0) {
    return <>{children}</>;
  }

  // Verificar permissões baseadas nos roles
  let hasPermission = false;

  if (requireAll) {
    // Usuário deve ter TODOS os roles especificados
    hasPermission = roles.every(role => hasRole(role));
  } else {
    // Usuário deve ter PELO MENOS UM dos roles especificados
    hasPermission = hasAnyRole(roles);
  }

  // Se não tem permissão
  if (!hasPermission) {
    if (showUnauthorized) {
      return (
        <UnauthorizedPage
          userRole={user?.role}
          requiredRoles={roles}
          onGoBack={() => navigate(-1)}
        />
      );
    } else {
      // Redirecionar para fallback path
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Usuário tem permissão, renderizar children
  return <>{children}</>;
};

// Hook para usar em componentes para verificar permissões condicionalmente
export const usePermissions = () => {
  const { user, hasRole } = useAuth();

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const canAccessPatient = (patientId: string): boolean => {
    // Implementar lógica de acesso a paciente baseado no role
    if (hasRole('admin')) return true;
    if (hasRole('profissional') || hasRole('therapist')) {
      // Aqui você pode implementar lógica mais específica
      // Por enquanto, permitir acesso a todos os profissionais
      return true;
    }
    return false;
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    canAccessPatient,
    isAdmin: () => hasRole('admin'),
    isProfissional: () => hasRole('profissional'),
    isTherapist: () => hasRole('therapist'),
    isResponsible: () => hasRole('responsible'),
    isAdminOrProfissional: () => hasAnyRole(['admin', 'profissional', 'therapist']),
    canManageUsers: () => hasRole('admin'),
    canCreateRecords: () => hasAnyRole(['admin', 'profissional', 'therapist']),
    canViewAllPatients: () => hasAnyRole(['admin', 'profissional', 'therapist']),
    canManageClinicSettings: () => hasRole('admin')
  };
};

// Componente para renderizar conteúdo baseado em permissões
interface ConditionalRenderProps {
  children: ReactNode;
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  roles = [],
  requireAll = false,
  fallback = null
}) => {
  const { hasRole, hasAnyRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (roles.length === 0) {
    return <>{children}</>;
  }

  const hasPermission = requireAll 
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Tipos específicos de ProtectedRoute para melhor developer experience
export const AdminRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute roles={['admin']} showUnauthorized={!!fallback}>
    {children}
  </ProtectedRoute>
);

export const ProfissionalRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute roles={['profissional', 'therapist']} showUnauthorized={!!fallback}>
    {children}
  </ProtectedRoute>
);

export const TherapistRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute roles={['therapist']} showUnauthorized={!!fallback}>
    {children}
  </ProtectedRoute>
);

export const ClinicalRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute roles={['admin', 'profissional', 'therapist']} showUnauthorized={!!fallback}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;