import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMobileOptimizations } from '@/components/common/MobileOptimizations';

interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
}

const Login: React.FC = () => {
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
      
      // Redirecionar para a página solicitada ou dashboard
      const redirectPath = searchParams.get('redirect') || '/';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para determinar a mensagem de erro amigável
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
    <div className="min-h-screen login-gradient">
      {/* Container principal responsivo */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        
        {/* Logo Sapere Oficial */}
        <div className="mb-8 sm:mb-12">
          <img 
            src="/logo-sapere-transparent.svg" 
            alt="Sapere - Clínica de Neurodivergentes" 
            className="w-40 h-30 sm:w-48 sm:h-36 lg:w-56 lg:h-42 object-contain mx-auto login-logo animate-float drop-shadow-lg"
          />
        </div>

        {/* Card de Login */}
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="login-card rounded-2xl shadow-2xl p-6 sm:p-8 animate-pulse-glow">
            
            {/* Header do Card */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-sapere-brown mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Acesse sua conta no sistema Sapere
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Mensagens de Erro e Sucesso */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-3 animate-pulse">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{getErrorMessage(error)}</span>
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
                <label htmlFor="email" className="block text-sm font-semibold text-sapere-brown">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
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
                    className={`login-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                      errors.email ? 'border-red-300 bg-red-50/50' : ''
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center space-x-1 animate-pulse">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-sapere-brown">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
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
                    className={`login-input w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                      errors.password ? 'border-red-300 bg-red-50/50' : ''
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-sapere-orange transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center space-x-1 animate-pulse">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Remember Me e Esqueci Senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('remember_me')}
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sapere-orange focus:ring-sapere-orange border-gray-300 rounded transition-colors duration-200"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                    Lembrar-me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-sapere-brown hover:text-sapere-orange transition-colors duration-200"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="login-button w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <span>Entrar no Sistema</span>
                )}
              </button>
            </form>

            {/* Footer do Card */}
            <div className="mt-8 space-y-4">
              {/* Link para registro */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-sapere-orange hover:text-sapere-brown transition-colors duration-200"
                  >
                    Registre-se aqui
                  </Link>
                </span>
              </div>

              {/* Informações de contato */}
              <div className="text-center border-t border-gray-100 pt-6">
                <p className="text-xs font-medium text-sapere-brown mb-2">
                  Sistema desenvolvido para a clínica Sapere
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                  <span>📱 WhatsApp: (92) 99230-5850</span>
                  <span className="hidden sm:inline">•</span>
                  <span>✉️ Sapere.recepcao@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações de demo/teste para desenvolvimento */}
        {(import.meta as any).env.DEV && (
          <div className="w-full max-w-sm sm:max-w-md mt-6">
            <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-3 text-center">
                🧪 Contas de Teste - Ambiente de Desenvolvimento
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-blue-800">
                    <span className="font-semibold text-red-700">Admin:</span><br />
                    📧 admin@sapere.com<br />
                    🔑 admin123
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-blue-800">
                    <span className="font-semibold text-blue-700">Psicóloga:</span><br />
                    📧 psi@sapere.com<br />
                    🔑 psi123
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-blue-800">
                    <span className="font-semibold text-green-700">Fonoaudióloga:</span><br />
                    📧 fono@sapere.com<br />
                    🔑 fono123
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-blue-800">
                    <span className="font-semibold text-purple-700">T.O.:</span><br />
                    📧 to@sapere.com<br />
                    🔑 to123
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;