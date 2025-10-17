import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import {
  Play,
  Square,
  Clock,
  User,
  Save,
  FileText,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birth_date?: string;
}

interface Session {
  id: string;
  patient_id: string;
  start_time: string;
  duration?: number;
  evolution?: string;
  observations?: string;
  activities?: string;
  patient: Patient;
}

const ConsultationSession: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Campos do formulário
  const [evolution, setEvolution] = useState('');
  const [observations, setObservations] = useState('');
  const [activities, setActivities] = useState('');
  const [homework, setHomework] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [patientMood, setPatientMood] = useState('');
  const [sessionQuality, setSessionQuality] = useState<number>(3);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
    checkActiveSession();
  }, []);

  useEffect(() => {
    if (isSessionActive && activeSession) {
      const interval = setInterval(() => {
        const start = new Date(activeSession.start_time).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      setTimerInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [isSessionActive, activeSession]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/patients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/sessions/active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.session) {
        setActiveSession(response.data.session);
        setIsSessionActive(true);
        setEvolution(response.data.session.evolution || '');
        setObservations(response.data.session.observations || '');
        setActivities(response.data.session.activities || '');
      }
    } catch (error) {
      console.error('Erro ao verificar sessão ativa:', error);
    }
  };

  const startSession = async () => {
    if (!selectedPatient) {
      alert('Selecione um paciente');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/sessions/start`,
        { patient_id: selectedPatient },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveSession(response.data.session);
      setIsSessionActive(true);
      setElapsedTime(0);

      // Limpar campos
      setEvolution('');
      setObservations('');
      setActivities('');
      setHomework('');
      setNextSteps('');
      setPatientMood('');
      setSessionQuality(3);

      console.log('✅ Sessão iniciada:', response.data.session);
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error);
      alert(error.response?.data?.error || 'Erro ao iniciar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEvolution = async () => {
    if (!activeSession) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/sessions/${activeSession.id}/evolution`,
        { evolution, observations, activities },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Evolução salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar evolução:', error);
      alert('Erro ao salvar evolução');
    } finally {
      setIsSaving(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    if (!evolution || evolution.trim() === '') {
      alert('Por favor, preencha o campo "Evolução do Paciente" antes de finalizar a consulta.');
      return;
    }

    if (!confirm('Deseja finalizar a consulta?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/sessions/${activeSession.id}/end`,
        {
          evolution,
          observations,
          activities,
          homework,
          next_steps: nextSteps,
          patient_mood: patientMood,
          session_quality: sessionQuality,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSessionActive(false);
      setActiveSession(null);
      setElapsedTime(0);
      setSelectedPatient('');

      // Limpar campos
      setEvolution('');
      setObservations('');
      setActivities('');
      setHomework('');
      setNextSteps('');
      setPatientMood('');
      setSessionQuality(3);

      alert('Consulta finalizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao finalizar sessão:', error);
      alert(error.response?.data?.error || 'Erro ao finalizar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Consulta</h1>
          {isSessionActive && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 animate-pulse" />
                <span className="text-2xl font-mono font-bold text-green-600">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
          )}
        </div>

        {!isSessionActive ? (
          // Seleção de Paciente
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Iniciar Nova Consulta
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Paciente
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} {patient.email ? `(${patient.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={startSession}
                disabled={!selectedPatient || isLoading}
                className="flex items-center gap-2 bg-sapere-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                {isLoading ? 'Iniciando...' : 'Iniciar Consulta'}
              </button>
            </div>
          </div>
        ) : (
          // Consulta em Andamento
          <div className="space-y-6">
            {/* Informações do Paciente */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-sapere-orange" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Paciente em Atendimento
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {activeSession?.patient.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">
                    {activeSession?.patient.email || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de Evolução */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-sapere-orange" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Registro da Consulta
                  </h2>
                </div>
                <button
                  onClick={saveEvolution}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evolução do Paciente *
                  </label>
                  <textarea
                    value={evolution}
                    onChange={(e) => setEvolution(e.target.value)}
                    rows={8}
                    placeholder="Descreva a evolução do paciente nesta consulta..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este campo é obrigatório e será salvo no prontuário do paciente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atividades Realizadas
                  </label>
                  <textarea
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                    rows={4}
                    placeholder="Descreva as atividades realizadas durante a consulta..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações Gerais
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={4}
                    placeholder="Observações adicionais sobre a consulta..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarefas para Casa
                  </label>
                  <textarea
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    rows={3}
                    placeholder="Tarefas ou exercícios para o paciente realizar..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próximos Passos
                  </label>
                  <textarea
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    rows={3}
                    placeholder="Planejamento para as próximas consultas..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Humor do Paciente
                    </label>
                    <select
                      value={patientMood}
                      onChange={(e) => setPatientMood(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="Muito Positivo">😊 Muito Positivo</option>
                      <option value="Positivo">🙂 Positivo</option>
                      <option value="Neutro">😐 Neutro</option>
                      <option value="Negativo">🙁 Negativo</option>
                      <option value="Muito Negativo">😢 Muito Negativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualidade da Sessão (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSessionQuality(value)}
                          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                            sessionQuality === value
                              ? 'bg-sapere-orange text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Finalizar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Ao finalizar a consulta, todos os dados serão salvos permanentemente no prontuário do paciente.
                    Certifique-se de que preencheu a <strong>Evolução do Paciente</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={endSession}
                disabled={!evolution.trim() || isLoading}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Square className="w-5 h-5" />
                {isLoading ? 'Finalizando...' : 'Finalizar Consulta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsultationSession;
