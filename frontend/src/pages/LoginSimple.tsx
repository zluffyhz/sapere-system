import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Brain, Users, Calendar, FileText } from 'lucide-react';

const LoginSimple: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Login: ${email} / ${password}`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Branding Sapere */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(255, 215, 0, 0.85) 100%)'
      }}>
        {/* Elementos flutuantes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full"></div>
        
        {/* Conteúdo do Branding */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white w-full">
          {/* Header Sapere */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Sapere
                </h1>
                <p className="text-white/80 text-lg font-medium">Centro de Neurodivergência</p>
                <p className="text-white/60 text-sm">Especializada em TDAH, TEA e Altas Habilidades</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold leading-tight mb-2">
                Sistema Interno Sapere
              </h2>
              <p className="text-white/70 text-base">
                Gestão Clínica Especializada em Neurodivergência
              </p>
            </div>
          </div>
          
          {/* Preview Dashboard Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
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
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
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
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
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
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8" style={{
        background: 'linear-gradient(to bottom right, #ffffff, #fff7ed, #fef3c7)'
      }}>
        <div className="max-w-md w-full space-y-8">
          {/* Header Mobile */}
          <div className="text-center lg:hidden">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl shadow-lg" style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ffd700 100%)'
              }}>
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{color: '#f59e0b'}}>
              Sistema Sapere
            </h1>
            <p className="text-slate-600 text-sm">Centro de Neurodivergência</p>
          </div>

          {/* Header do Formulário */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{color: '#f59e0b'}}>
              Acesso Profissional
            </h2>
            <p className="text-slate-600">Entre com suas credenciais da Clínica Sapere</p>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 font-medium">🧠 Especialistas em Neurodivergência</p>
              <p className="text-xs text-orange-600">TDAH • TEA • Altas Habilidades</p>
            </div>
          </div>

          {/* Card de Login */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Profissional
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all duration-200 text-slate-800 placeholder-slate-400"
                    placeholder="seu.email@sapere.com"
                    required
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all duration-200 text-slate-800 placeholder-slate-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-orange-500 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-orange-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                className="w-full text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ffd700 100%)'
                }}
              >
                Entrar no Sistema
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
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSimple;