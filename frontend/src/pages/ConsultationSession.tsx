import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppNavigation } from '@/components/Navigation';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { goToDashboard } = useAppNavigation();

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

      if (response.data) {
        setActiveSession(response.data);
        setIsSessionActive(true);
        setSelectedPatient(response.data.patient_id);

        // Carregar dados salvos
        if (response.data.evolution) setEvolution(response.data.evolution);
        if (response.data.observations) setObservations(response.data.observations);
        if (response.data.activities) setActivities(response.data.activities);
      }
    } catch (error) {
      console.log('Nenhuma sessão ativa');
    }
  };

  const startSession = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/sessions/start`,
        { patient_id: selectedPatient },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveSession(response.data);
      setIsSessionActive(true);
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
        {
          evolution,
          observations,
          activities,
          homework,
          nextSteps,
          patientMood,
          sessionQuality
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Rascunho salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar rascunho');
    } finally {
      setIsSaving(false);
    }
  };

  const endSession = async () => {
    if (!evolution.trim()) {
      alert('Por favor, preencha o campo "Evolução do Paciente" antes de finalizar.');
      return;
    }

    if (!confirm('Tem certeza que deseja finalizar esta consulta?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/sessions/${activeSession!.id}/end`,
        {
          evolution,
          observations,
          activities,
          homework,
          nextSteps,
          patientMood,
          sessionQuality
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

  const commonStyle = {
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box' as const
  };

  const buttonStyle = {
    ...commonStyle,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const
  };

  const inputStyle = {
    ...commonStyle,
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  };

  return (
    <div style={{ ...commonStyle, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={goToDashboard}
            style={{
              ...buttonStyle,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            ← Dashboard
          </button>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
              ⏰ Sistema de Consulta
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
              {isSessionActive ? `Paciente: ${activeSession?.patient.name}` : 'Iniciar nova consulta'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isSessionActive && (
            <div style={{
              backgroundColor: 'rgba(34,197,94,0.2)',
              border: '2px solid rgba(34,197,94,0.8)',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>⏱️</span>
              <span style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: '#22c55e' }}>
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}
          <span>{user?.name}</span>
          <button onClick={logout} style={{
            ...buttonStyle,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>

        {!isSessionActive ? (
          /* Seleção de Paciente */
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
              Iniciar Nova Consulta
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Selecione o Paciente
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  style={inputStyle}
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
                style={{
                  ...buttonStyle,
                  backgroundColor: !selectedPatient || isLoading ? '#d1d5db' : '#10b981',
                  color: 'white',
                  padding: '15px 25px',
                  fontSize: '16px',
                  cursor: !selectedPatient || isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                ▶️ {isLoading ? 'Iniciando...' : 'Iniciar Consulta'}
              </button>
            </div>
          </div>
        ) : (
          /* Consulta em Andamento */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Informações do Paciente */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                👤 Paciente em Atendimento
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Nome</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    {activeSession?.patient.name}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Email</p>
                  <p style={{ fontSize: '16px', color: '#1f2937' }}>
                    {activeSession?.patient.email || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de Evolução */}
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: '0' }}>
                  📋 Registro da Consulta
                </h3>
                <button
                  onClick={saveEvolution}
                  disabled={isSaving}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1
                  }}
                >
                  💾 {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                    Evolução do Paciente *
                  </label>
                  <textarea
                    value={evolution}
                    onChange={(e) => setEvolution(e.target.value)}
                    rows={8}
                    placeholder="Descreva a evolução do paciente nesta consulta..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    Este campo é obrigatório e será salvo no prontuário do paciente
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                    Atividades Realizadas
                  </label>
                  <textarea
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                    rows={4}
                    placeholder="Descreva as atividades realizadas durante a consulta..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                    Observações Gerais
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={4}
                    placeholder="Observações adicionais sobre a consulta..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                    Tarefas para Casa
                  </label>
                  <textarea
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    rows={3}
                    placeholder="Tarefas ou exercícios para o paciente realizar..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                    Próximos Passos
                  </label>
                  <textarea
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    rows={3}
                    placeholder="Planejamento para as próximas consultas..."
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      Humor do Paciente
                    </label>
                    <select
                      value={patientMood}
                      onChange={(e) => setPatientMood(e.target.value)}
                      style={inputStyle}
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
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                      Qualidade da Sessão (1-5)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSessionQuality(value)}
                          style={{
                            ...buttonStyle,
                            flex: 1,
                            padding: '12px',
                            backgroundColor: sessionQuality === value ? '#f59e0b' : '#f3f4f6',
                            color: sessionQuality === value ? 'white' : '#6b7280',
                            fontWeight: '600'
                          }}
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
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '15px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <p style={{ fontSize: '14px', color: '#374151', margin: '0' }}>
                  Ao finalizar a consulta, todos os dados serão salvos permanentemente no prontuário do paciente.
                  Certifique-se de que preencheu a <strong>Evolução do Paciente</strong>.
                </p>
              </div>

              <button
                onClick={endSession}
                disabled={!evolution.trim() || isLoading}
                style={{
                  ...buttonStyle,
                  backgroundColor: !evolution.trim() || isLoading ? '#d1d5db' : '#ef4444',
                  color: 'white',
                  padding: '15px 25px',
                  fontSize: '16px',
                  cursor: !evolution.trim() || isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                ⏹️ {isLoading ? 'Finalizando...' : 'Finalizar Consulta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationSession;
