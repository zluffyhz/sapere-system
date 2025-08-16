import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HeaderSimple: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
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
    <header className="bg-yellow-400 border-b-2 border-orange-500 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/')}
              className="text-lg font-bold text-brown-800"
            >
              Sapere Sistema
            </button>
          </div>

          {/* Navegação Principal */}
          <nav className="flex space-x-4">
            <button
              onClick={() => handleNavigation('/')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Dashboard
            </button>
            
            <button
              onClick={() => handleNavigation('/patients')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Pacientes
            </button>
            
            <button
              onClick={() => handleNavigation('/appointments')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Agendamentos
            </button>
            
            <button
              onClick={() => handleNavigation('/therapy')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Terapia
            </button>
            
            <button
              onClick={() => handleNavigation('/communication')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Comunicação
            </button>
            
            <button
              onClick={() => handleNavigation('/anamnese')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Anamneses
            </button>
            
            <button
              onClick={() => handleNavigation('/administration')}
              className="px-3 py-2 text-sm font-medium text-brown-800 hover:bg-orange-200 rounded"
            >
              Admin
            </button>
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-brown-800">
              {user?.name || 'Usuário'}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSimple;