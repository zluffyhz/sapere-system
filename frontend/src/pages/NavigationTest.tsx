import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testRoutes = [
    { path: '/', name: 'Dashboard' },
    { path: '/patients', name: 'Pacientes' },
    { path: '/appointments', name: 'Agendamentos' },
    { path: '/therapy', name: 'Terapia' },
    { path: '/communication', name: 'Comunicação' },
    { path: '/anamnese', name: 'Anamneses' },
    { path: '/administration', name: 'Administração' },
  ];

  const handleNavigate = (path: string) => {
    console.log('Teste: Navegando para', path);
    try {
      navigate(path);
      console.log('Teste: Navegação realizada com sucesso');
    } catch (error) {
      console.error('Teste: Erro na navegação:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">TESTE DE NAVEGAÇÃO</h1>
      
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <p><strong>Localização atual:</strong> {location.pathname}</p>
        <p><strong>Hora:</strong> {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {testRoutes.map((route) => (
          <button
            key={route.path}
            onClick={() => handleNavigate(route.path)}
            className={`p-4 text-left border-2 rounded-lg font-medium ${
              location.pathname === route.path
                ? 'bg-green-200 border-green-500 text-green-800'
                : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <div className="text-lg">{route.name}</div>
            <div className="text-sm text-gray-600">{route.path}</div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold mb-2">Instruções:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Clique nos botões acima</li>
          <li>Abra o console do navegador (F12)</li>
          <li>Verifique se as mensagens de log aparecem</li>
          <li>Observe se a URL muda</li>
          <li>Verifique se o botão atual fica verde</li>
        </ol>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            console.log('Teste: Router state:', {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              state: location.state
            });
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Debug Router State
        </button>
      </div>
    </div>
  );
};

export default NavigationTest;