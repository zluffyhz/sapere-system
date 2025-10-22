import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const fillTestCredentials = () => {
    setEmail('admin@sapere.com.br');
    setPassword('admin123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tentando fazer login com:', { email, password });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        console.log('Login successful, redirecting...');
        navigate('/dashboard');
      } else {
        alert('Login inválido: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <Link to="/" className="text-orange-600 text-sm">← Voltar</Link>
        
        <div className="text-center mt-4 mb-6">
          <img 
            src="/sapere-logo.png" 
            alt="Sapere Logo" 
            className="w-20 h-20 mx-auto mb-3 object-contain drop-shadow-sm"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Login Sapere</h1>
          <p className="text-sm text-gray-600">Clínica de Neurodivergentes</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">
            Entrar
          </button>
        </form>
        
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <div className="flex justify-between items-start">
            <div>
              <strong>Teste:</strong><br />
              Email: admin@sapere.com.br<br />
              Senha: admin123
            </div>
            <button 
              type="button"
              onClick={fillTestCredentials}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Preencher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}