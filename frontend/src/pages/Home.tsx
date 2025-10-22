import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen login-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 login-gradient rounded-2xl shadow-lg hover-lift">
            <Brain className="w-16 h-16 text-white sapere-float" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sapere-orange to-sapere-yellow bg-clip-text text-transparent mb-4">
          Sistema Sapere
        </h1>
        <p className="text-white/80 text-lg">Centro de Neurodivergência</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white/60 mt-4">Carregando sistema...</p>
        </div>
      </div>
    </div>
  );
};

export default Home;