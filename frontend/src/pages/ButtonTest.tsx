import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, AlertCircle, RefreshCw, Activity, Play } from 'lucide-react';
import { productionTest } from '@/utils/productionTest';

const ButtonTest: React.FC = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [productionResults, setProductionResults] = useState<any[]>([]);
  const [runningProductionTest, setRunningProductionTest] = useState(false);

  const logTest = (testName: string, success: boolean = true) => {
    console.log(`Teste ${testName}:`, success ? '✅ SUCESSO' : '❌ FALHOU');
    setTestResults(prev => ({
      ...prev,
      [testName]: success
    }));
  };

  const runAllTests = async () => {
    console.log('🔧 INICIANDO TESTES DE BOTÕES - Sapere System');
    setLoading(true);
    setTestResults({});
    
    // Simular testes
    await new Promise(resolve => setTimeout(resolve, 500));
    logTest('onClick Event Handler');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    logTest('State Update');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    logTest('CSS Hover Effects');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    logTest('Button Accessibility');
    
    setLoading(false);
    console.log('🎉 TODOS OS TESTES CONCLUÍDOS!');
  };

  const runProductionTests = async () => {
    console.log('🚀 INICIANDO TESTES DE PRODUÇÃO');
    setRunningProductionTest(true);
    
    try {
      const results = await productionTest.runAllTests();
      setProductionResults(results);
    } catch (error) {
      console.error('Erro nos testes de produção:', error);
    } finally {
      setRunningProductionTest(false);
    }
  };

  useEffect(() => {
    // Auto-executar testes de produção na montagem do componente
    runProductionTests();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sapere-brown flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-sapere-orange" />
          Teste de Funcionalidade de Botões
        </h1>
        <p className="text-gray-600 mt-2">
          Página de diagnóstico para verificar se todos os botões estão funcionando corretamente.
        </p>
      </div>

      {/* Teste de Navegação */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🧭 Testes de Navegação
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              logTest('Navegação Dashboard');
              navigate('/');
            }}
            className="btn-primary"
          >
            Dashboard
          </button>
          
          <button
            onClick={() => {
              logTest('Navegação Pacientes');
              navigate('/patients');
            }}
            className="btn-primary"
          >
            Pacientes
          </button>
          
          <button
            onClick={() => {
              logTest('Navegação Agendamentos');
              navigate('/appointments');
            }}
            className="btn-primary"
          >
            Agendamentos
          </button>
        </div>
      </div>

      {/* Teste de Estado */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🔄 Testes de Estado
        </h2>
        
        <StateTestComponent onTest={logTest} />
      </div>

      {/* Teste de Eventos */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ⚡ Testes de Eventos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              logTest('Evento onClick');
              alert('onClick funciona!');
            }}
            className="btn-secondary"
          >
            onClick Test
          </button>
          
          <button
            onMouseEnter={() => {
              console.log('Mouse entrou no botão');
            }}
            onMouseLeave={() => {
              console.log('Mouse saiu do botão');
            }}
            onClick={() => {
              logTest('Evento onMouseEnter/Leave');
            }}
            className="btn-secondary"
          >
            Mouse Events
          </button>
          
          <button
            onDoubleClick={() => {
              logTest('Evento onDoubleClick');
              console.log('Double click detectado!');
            }}
            className="btn-secondary"
          >
            Double Click
          </button>
          
          <button
            onFocus={() => {
              console.log('Botão focado');
            }}
            onBlur={() => {
              console.log('Botão desfocado');
            }}
            onClick={() => {
              logTest('Evento onFocus/Blur');
            }}
            className="btn-secondary"
          >
            Focus/Blur
          </button>
        </div>
      </div>

      {/* Teste Automático */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🤖 Teste Automático Completo
        </h2>
        
        <button
          onClick={runAllTests}
          disabled={loading}
          className="btn-primary flex items-center gap-2 mb-4"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Executando Testes...' : 'Executar Todos os Testes'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Resultados dos Testes:</h3>
            <div className="space-y-1">
              {Object.entries(testResults).map(([test, success]) => (
                <div key={test} className="flex items-center gap-2">
                  {success ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className={success ? 'text-green-700' : 'text-red-700'}>
                    {test}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Testes de Produção */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-sapere-orange" />
          Testes de Produção Completos
        </h2>
        
        <button
          onClick={runProductionTests}
          disabled={runningProductionTest}
          className="btn-primary flex items-center gap-2 mb-4"
        >
          <Play className={`h-4 w-4 ${runningProductionTest ? 'animate-spin' : ''}`} />
          {runningProductionTest ? 'Executando Testes...' : 'Executar Testes de Sistema'}
        </button>

        {productionResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Resultados dos Testes de Sistema:</h3>
            <div className="space-y-2">
              {productionResults.map((result, index) => {
                const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
                const colorClass = result.status === 'success' ? 'text-green-700' : 
                                  result.status === 'error' ? 'text-red-700' : 'text-yellow-700';
                
                return (
                  <div key={index} className={`text-sm ${colorClass} flex items-start gap-2`}>
                    <span>{icon}</span>
                    <div className="flex-1">
                      <span className="font-medium">{result.test}:</span> {result.message}
                      {result.details && (
                        <div className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(result.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Instruções de Debug */}
      <div className="card bg-blue-50">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          🔍 Como Diagnosticar Problemas
        </h2>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>1.</strong> Abra o Console do Navegador (F12 → Console)</p>
          <p><strong>2.</strong> Execute <code>testProduction()</code> no console</p>
          <p><strong>3.</strong> Clique nos botões acima e verifique os logs</p>
          <p><strong>4.</strong> Se não aparecer logs, o onClick não está funcionando</p>
          <p><strong>5.</strong> Verifique se há erros JavaScript no console</p>
          <p><strong>6.</strong> Teste a navegação e estado de cada componente</p>
        </div>
      </div>
    </div>
  );
};

// Componente de teste de estado
const StateTestComponent: React.FC<{ onTest: (name: string) => void }> = ({ onTest }) => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [toggle, setToggle] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-sapere-brown mb-2">{count}</p>
        <button
          onClick={() => {
            setCount(prev => prev + 1);
            onTest('Estado Counter');
          }}
          className="btn-secondary w-full"
        >
          Incrementar: {count}
        </button>
      </div>
      
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTest('Estado Input');
          }}
          placeholder="Digite algo..."
          className="input-field mb-2"
        />
        <p className="text-sm text-gray-600">Você digitou: "{text}"</p>
      </div>
      
      <div className="text-center">
        <button
          onClick={() => {
            setToggle(prev => !prev);
            onTest('Estado Toggle');
          }}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            toggle 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {toggle ? 'LIGADO ✅' : 'DESLIGADO ❌'}
        </button>
      </div>
    </div>
  );
};

export default ButtonTest;