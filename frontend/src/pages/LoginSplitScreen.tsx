import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock, Loader2, Brain, Users, Calendar, FileText, Clock, Activity, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMobileOptimizations } from '@/components/common/MobileOptimizations';
import { debugAPI } from '@/services/api';

interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
}

const LoginSplitScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Apply mobile optimizations
  useMobileOptimizations();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    defaultValues: {
      remember_me: false
    }
  });

  // Verificar se há mensagens de redirecionamento
  useEffect(() => {
    const reason = searchParams.get('reason');
    const redirect = searchParams.get('redirect');
    
    if (reason) {
      switch (reason) {
        case 'session_expired':
          setError('Sua sessão expirou. Por favor, faça login novamente.');
          break;
        case 'invalid_session':
          setError('Sessão inválida. Por favor, faça login novamente.');
          break;
        case 'unauthorized':
          setError('Acesso não autorizado. Por favor, faça login.');
          break;
        case 'logout':
          setSuccessMessage('Logout realizado com sucesso.');
          break;
      }
    }

    // Se já está autenticado, redirecionar
    if (isAuthenticated) {
      const redirectPath = redirect || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [searchParams, isAuthenticated, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await login(data.email, data.password, data.remember_me);
      setSuccessMessage('Login realizado com sucesso! Redirecionando...');
      
      const redirectPath = searchParams.get('redirect') || '/';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.message || 'Erro ao fazer login. Tente novamente.');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    if (error.includes('Email ou senha inválidos')) {
      return 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
    }
    if (error.includes('muito tentativas')) {
      return 'Muitas tentativas de login. Tente novamente em alguns minutos.';
    }
    if (error.includes('rede') || error.includes('timeout')) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    return error;
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Branding Sapere (3/5) */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden login-side">
        {/* Elementos flutuantes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full sapere-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full sapere-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full sapere-float" style={{animationDelay: '4s'}}></div>
        
        {/* Conteúdo do Branding */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white w-full">
          {/* Header Sapere */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 hover-lift">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  Sapere
                </h1>
                <p className="text-white/80 text-lg font-medium">Centro de Neurodivergência</p>
                <p className="text-white/60 text-sm">Especializada em TDAH, TEA e Altas Habilidades</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-6">
              <div className="px-3 py-1 bg-green-500 rounded-full flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-medium">WhatsApp</span>
              </div>
              <div className="px-3 py-1 bg-red-500 rounded-full flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span className="text-xs font-medium">Email</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold leading-tight mb-2">
                Sistema Interno Sapere
              </h2>
              <p className="text-white/70 text-base">
                Gestão Clínica Especializada em Neurodivergência
              </p>
              <p className="text-white/60 text-sm">
                Para profissionais da Clínica Sapere
              </p>
            </div>
          </div>
          
          {/* Preview Dashboard Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium">Pacientes TDAH</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-white/60 text-xs">Ver todos os pacientes →</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium">Sessões Hoje</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-white/60 text-xs">Ver agenda completa →</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium">Relatórios</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-white/60 text-xs">Gerenciar relatórios →</p>
            </div>
          </div>
          
          {/* Especialidades Sapere */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover-lift">
            <h3 className="text-white font-semibold mb-4">🧠 Especialidades Sapere</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                <p className="text-white font-medium text-sm">TDAH</p>
                <p className="text-white/70 text-xs">Terapia Cognitiva</p>
              </div>
              <div className="bg-green-500/20 rounded-lg p-3 text-center">
                <p className="text-white font-medium text-sm">TEA</p>
                <p className="text-white/70 text-xs">Intervenção ABA</p>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                <p className="text-white font-medium text-sm">Altas Habilidades</p>
                <p className="text-white/70 text-xs">Desenvolvimento</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login (2/5) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-white via-orange-50 to-yellow-50 relative">
        {/* Pattern de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50 to-yellow-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(245_158_11_/_0.1)_1px,_transparent_0)] bg-[length:30px_30px]"></div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Header Mobile */}
          <div className="text-center lg:hidden">
            <div className="flex justify-center mb-6">
              <div className="p-4 login-gradient rounded-2xl shadow-lg hover-lift">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sapere-orange to-sapere-yellow bg-clip-text text-transparent mb-2">
              Sistema Sapere
            </h1>
            <p className="text-slate-600 text-sm">Centro de Neurodivergência</p>
          </div>

          {/* Header do Formulário */}
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-sapere-orange via-amber-500 to-sapere-yellow bg-clip-text text-transparent mb-4">
                Acesso Profissional
              </h2>
              <p className="text-slate-600">Entre com suas credenciais da Clínica Sapere</p>
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">🧠 Especialistas em Neurodivergência</p>
                <p className="text-xs text-orange-600">TDAH • TEA • Altas Habilidades</p>
              </div>
            </div>
          </div>

          {/* Card de Login */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden hover-lift">
            {/* Gradientes decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sapere-orange/10 to-sapere-yellow/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sapere-orange/10 to-sapere-yellow/10 rounded-full blur-2xl"></div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              {/* Mensagens */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Profissional
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sapere-orange transition-colors" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Digite um email válido'
                      }
                    })}
                    type="email"
                    className={`block w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapere-orange/20 focus:border-sapere-orange transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                      errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 hover:border-orange-300'
                    }`}
                    placeholder="seu.email@sapere.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sapere-orange transition-colors" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 6,
                        message: 'Senha deve ter pelo menos 6 caracteres'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapere-orange/20 focus:border-sapere-orange transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                      errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 hover:border-orange-300'
                    }`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-sapere-orange transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-sapere-orange transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Lembrar-me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('remember_me')}
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sapere-orange focus:ring-sapere-orange border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Lembrar-me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-sapere-orange hover:text-amber-500 font-medium transition-colors"
                >
                  Esqueci a senha
                </Link>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full login-button text-white py-4 px-6 rounded-xl font-semibold hover-lift focus:outline-none focus:ring-4 focus:ring-sapere-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar no Sistema'
                )}
              </button>

              {/* Contas Demo */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-800 mb-3">🎯 Contas Demo</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-orange-700 font-medium">Admin:</span>
                    <span className="text-orange-600">admin@sapere.com / admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 font-medium">Psicóloga:</span>
                    <span className="text-orange-600">psi@sapere.com / psi123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 font-medium">Fonoaudióloga:</span>
                    <span className="text-orange-600">fono@sapere.com / fono123</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-xs text-orange-600 text-center">Credenciais para demonstração</p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Sistema Sapere © {new Date().getFullYear()} • Centro de Neurodivergência
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSplitScreen;