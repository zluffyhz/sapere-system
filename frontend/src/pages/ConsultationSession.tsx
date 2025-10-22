import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/common/Layout';
import {
  Play,
  Square,
  Save,
  CheckCircle,
  Clock,
  User,
  FileText,
  Activity,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Session {
  id: string;
  patient_id: string;
  start_time: string;
  duration?: number;
  evolution?: string;
  observations?: string;
  activities?: string;
  homework?: string;
}

const ConsultationSession: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Campos do formulário
  const [evolution, setEvolution] = useState('');
  const [observations, setObservations] = useState('');
  const [activities, setActivities] = useState('');
  const [homework, setHomework] = useState('');

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (isSessionActive && activeSession) {
      // Iniciar timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Parar timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isSessionActive, activeSession]);

  const loadPatients = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${apiUrl}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPatients(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setError('Erro ao carregar lista de pacientes');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    if (!selectedPatientId) {
      setError('Por favor, selecione um paciente');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${apiUrl}/api/sessions`,
        {
          patient_id: selectedPatientId,
          start_time: new Date().toISOString(),
          status: 'in_progress'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setActiveSession(response.data);
      setIsSessionActive(true);
      setElapsedTime(0);
      setSuccessMessage('Consulta iniciada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error);
      setError(error.response?.data?.message || 'Erro ao iniciar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!activeSession) return;

    setIsSaving(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      await axios.put(
        `${apiUrl}/api/sessions/${activeSession.id}`,
        {
          evolution,
          observations,
          activities,
          homework,
          duration: elapsedTime,
          status: 'in_progress'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage('Rascunho salvo com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error);
      setError(error.response?.data?.message || 'Erro ao salvar rascunho');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishSession = async () => {
    if (!activeSession) return;

    if (!evolution.trim()) {
      setError('Por favor, preencha a evolução do paciente antes de finalizar');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      await axios.put(
        `${apiUrl}/api/sessions/${activeSession.id}`,
        {
          evolution,
          observations,
          activities,
          homework,
          duration: elapsedTime,
          end_time: new Date().toISOString(),
          status: 'completed'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Resetar estado
      setIsSessionActive(false);
      setActiveSession(null);
      setElapsedTime(0);
      setEvolution('');
      setObservations('');
      setActivities('');
      setHomework('');
      setSelectedPatientId('');

      setSuccessMessage('Consulta finalizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Erro ao finalizar sessão:', error);
      setError(error.response?.data?.message || 'Erro ao finalizar consulta');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Sistema de Consulta
          </h1>
          <p className="text-orange-50 mt-2">
            Gerenciar consultas em tempo real com timer e registro de evolução
          </p>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-800">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Seleção de Paciente e Controles */}
        {!isSessionActive ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Selecionar Paciente
            </h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStartSession}
                disabled={!selectedPatientId || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Iniciar Consulta
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Timer e Informações da Sessão */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" />
                    Consulta em Andamento
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Paciente: <span className="font-medium">{selectedPatient?.name}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    Tempo decorrido
                  </div>
                  <div className="text-4xl font-bold text-orange-600 font-mono">
                    {formatTime(elapsedTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Evolução */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              {/* Evolução do Paciente - GRANDE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Evolução do Paciente *
                </label>
                <textarea
                  value={evolution}
                  onChange={(e) => setEvolution(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Descreva detalhadamente a evolução do paciente durante a sessão..."
                />
              </div>

              {/* Atividades Realizadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  Atividades Realizadas
                </label>
                <textarea
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Liste as atividades realizadas durante a sessão..."
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Observações
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Observações adicionais sobre a sessão..."
                />
              </div>

              {/* Tarefas / Lição de Casa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-orange-600" />
                  Tarefas / Lição de Casa
                </label>
                <textarea
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Tarefas para o paciente realizar até a próxima sessão..."
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Rascunho
                </button>
                <button
                  onClick={handleFinishSession}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Finalizar Consulta
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Informações Adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Dicas:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>O timer inicia automaticamente ao começar a consulta</li>
                <li>Use "Salvar Rascunho" para guardar informações durante a sessão</li>
                <li>Preencha a evolução antes de finalizar a consulta</li>
                <li>O tempo total será registrado automaticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsultationSession;
