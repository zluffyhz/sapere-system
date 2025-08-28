import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Settings, 
  User, 
  Menu,
  X,
  MessageCircle,
  Mail,
  Shield
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      profissional: 'Profissional',
      therapist: 'Terapeuta',
      responsible: 'Responsável'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'text-red-600 bg-red-50',
      profissional: 'text-blue-600 bg-blue-50',
      therapist: 'text-green-600 bg-green-50',
      responsible: 'text-purple-600 bg-purple-50'
    };
    return colors[role as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
      window.location.href = '/login?reason=logout';
    }
  };

  return (
    <header className="bg-sapere-yellow border-b-2 border-sapere-orange shadow-lg relative z-50 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo e Navegação Principal */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                if (onToggleSidebar) {
                  onToggleSidebar();
                } else {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }
              }}
              className="lg:hidden p-2 rounded-md text-sapere-brown hover:bg-sapere-orange/20 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group hover-lift">
              <div className="relative">
                <img 
                  src="/logo-sapere-transparent.svg" 
                  alt="Sapere" 
                  className="h-10 w-10 object-contain rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-sapere-orange/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-sapere-brown group-hover:text-sapere-orange transition-colors duration-200">Sapere</h1>
                <p className="text-xs text-sapere-brown/70 group-hover:text-sapere-brown/90 transition-colors duration-200">Centro de Desenvolvimento</p>
              </div>
            </Link>

          </div>

          {/* Área Direita - Notificações e Usuário */}
          <div className="flex items-center space-x-4">
            
            {/* Contatos Rápidos */}
            <div className="hidden lg:flex items-center space-x-3">
              <a
                href="https://wa.me/5592992305850"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-1 px-3 py-1 bg-sapere-whatsapp text-white rounded-full text-xs font-medium hover:bg-green-600 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="WhatsApp Sapere"
              >
                <MessageCircle className="h-3 w-3 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden xl:inline">WhatsApp</span>
              </a>
              <a
                href="mailto:Sapere.recepcao@gmail.com"
                className="group flex items-center space-x-1 px-3 py-1 bg-sapere-brown text-white rounded-full text-xs font-medium hover:bg-amber-800 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="Email Sapere"
              >
                <Mail className="h-3 w-3 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden xl:inline">Email</span>
              </a>
            </div>

            {/* Notificações - Funciona sem WebSocket */}
            <NotificationsDropdown />

            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-sapere-orange/20 transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-sapere-orange rounded-full flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-sapere-brown group-hover:text-sapere-orange transition-colors duration-200">
                      {user?.name}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3 text-sapere-brown/60 group-hover:text-sapere-orange/60 transition-colors duration-200" />
                      <p className="text-xs text-sapere-brown/60 group-hover:text-sapere-orange/60 transition-colors duration-200">
                        {user?.role && getRoleLabel(user.role)}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-sapere-brown transition-all duration-200 ${
                    isUserMenuOpen ? 'rotate-180 text-sapere-orange' : 'group-hover:text-sapere-orange'
                  }`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.role && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {navigate('/profile'); setIsUserMenuOpen(false);}}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Meu Perfil
                      </button>
                      <button
                        onClick={() => {navigate('/administration'); setIsUserMenuOpen(false);}}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Administração
                      </button>
                    </div>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sair do Sistema
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;