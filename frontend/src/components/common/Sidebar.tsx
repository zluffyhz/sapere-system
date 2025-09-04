import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings, 
  LogOut,
  Heart,
  Shield,
  Baby,
  TestTube,
  MessageSquare,
  UserCog
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ConditionalRender } from '@/components/common/ProtectedRoute';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  // Mapear role do BD para exibição
  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      therapist: 'Terapeuta', 
      responsible: 'Responsável'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      therapist: 'bg-blue-100 text-blue-800',
      responsible: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Navegação baseada em roles
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
  ];

  const adminNavigation = [
    { name: 'Pacientes', href: '/patients', icon: Users, roles: ['admin', 'profissional'] },
    { name: 'Agendamentos', href: '/appointments', icon: Calendar, roles: ['admin', 'profissional'] },
    { name: 'Anamnese', href: '/anamnese', icon: Heart, roles: ['admin', 'profissional'] },
    { name: 'Comunicação', href: '/communication', icon: MessageSquare, roles: ['admin', 'profissional'] },
    { name: 'Terapeutas', href: '/therapists', icon: UserCheck, roles: ['admin'] },
    { name: 'Administração', href: '/administration', icon: UserCog, roles: ['admin'] },
    { name: 'Configurações', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const guardianNavigation = [
    { name: 'Meus Filhos', href: '/my-children', icon: Baby, roles: ['responsible'] },
  ];

  const testNavigation = [
  ];

  const allNavigation = [
    ...baseNavigation,
    ...adminNavigation,
    ...guardianNavigation,
    ...testNavigation
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
      // Força logout mesmo se houver erro na API
      window.location.href = '/login?reason=logout';
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-sapere-orange" />
          <span className="text-xl font-bold text-sapere-brown">Sapere</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {allNavigation.map((item) => {
          const Icon = item.icon;
          
          // Se o item tem roles específicos, verificar permissões
          if ('roles' in item && item.roles) {
            return (
              <ConditionalRender 
                key={item.name}
                roles={item.roles as any}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </ConditionalRender>
            );
          }

          // Items sem restrição de role
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <NavLink to="/profile" className="h-10 w-10 bg-sapere-orange rounded-full flex items-center justify-center hover:bg-sapere-brown transition-colors">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </NavLink>
          <div className="flex-1 min-w-0">
            <NavLink to="/profile" className="block hover:text-sapere-orange transition-colors">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
            </NavLink>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
            {user?.role && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                <Shield className="h-3 w-3 mr-1" />
                {getRoleLabel(user.role)}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;