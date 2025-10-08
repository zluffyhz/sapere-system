import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, User, Calendar } from 'lucide-react';

interface SessionData {
  id: string;
  appointment_id?: string;
  therapist_id: string;
  patient_id: string;
  patient_name?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  start_time: string;
  pause_time?: string;
  resume_time?: string;
  pause_duration?: number;
  notes?: string;
  created_at: string;
}

interface SessionTimerProps {
  therapistId: string;
  onSessionComplete?: (sessionData: SessionData) => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ therapistId, onSessionComplete }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // tempo em segundos
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar sessão ativa ao carregar o componente
  useEffect(() => {
    fetchActiveSession();
  }, [therapistId]);

  // Timer para atualizar o tempo
  useEffect(() => {
    if (session?.status === 'active') {
      intervalRef.current = setInterval(() => {
        updateCurrentTime();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session]);

  const fetchActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/sessions/active/${therapistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setSession(data.session);
          setNotes(data.session.notes || '');
          updateCurrentTime(data.session);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sessão ativa:', error);
    }
  };

  const updateCurrentTime = (sessionData?: SessionData) => {
    const currentSession = sessionData || session;
    if (!currentSession) return;

    const startTime = new Date(currentSession.start_time).getTime();
    const now = new Date().getTime();
    let elapsedTime = Math.floor((now - startTime) / 1000);

    // Subtrair tempo de pausa se houver
    if (currentSession.pause_duration) {
      elapsedTime -= currentSession.pause_duration;
    }

    // Se estiver pausado, calcular até o momento da pausa
    if (currentSession.status === 'paused' && currentSession.pause_time) {
      const pauseTime = new Date(currentSession.pause_time).getTime();
      elapsedTime = Math.floor((pauseTime - startTime) / 1000);
      if (currentSession.pause_duration) {
        elapsedTime -= currentSession.pause_duration;
      }
    }

    setCurrentTime(Math.max(0, elapsedTime));
  };

  const startSession = async (patientId: string, patientName: string, appointmentId?: string) => {
    if (session) {
      alert('Já existe uma sessão ativa. Finalize a sessão atual primeiro.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/sessions/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          therapist_id: therapistId,
          patient_id: patientId,
          appointment_id: appointmentId,
          notes: notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSession({
          ...data.session,
          patient_name: patientName
        });
        setCurrentTime(0);
      } else {
        const error = await response.json();
        alert(`Erro ao iniciar sessão: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      alert('Erro ao iniciar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSession = async () => {
    if (!session || session.status !== 'active') return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/sessions/${session.id}/pause`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSession(prev => prev ? {
          ...prev,
          status: 'paused',
          pause_time: data.session.pause_time
        } : null);
      }
    } catch (error) {
      console.error('Erro ao pausar sessão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resumeSession = async () => {
    if (!session || session.status !== 'paused') return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/sessions/${session.id}/resume`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSession(prev => prev ? {
          ...prev,
          status: 'active',
          resume_time: data.session.resume_time,
          pause_duration: data.session.pause_duration
        } : null);
      }
    } catch (error) {
      console.error('Erro ao retomar sessão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/sessions/${session.id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        const completedSession = {
          ...session,
          ...data.session,
          status: 'completed' as const
        };
        
        setSession(null);
        setCurrentTime(0);
        setNotes('');
        
        if (onSessionComplete) {
          onSessionComplete(completedSession);
        }
      }
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Se não há sessão ativa, mostrar apenas o componente básico
  if (!session) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600">Nenhuma sessão ativa</span>
          </div>
          <div className="text-lg font-mono text-gray-400">00:00</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
      {/* Header da sessão */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            session.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
          }`}>
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sessão Ativa</h3>
            <p className="text-sm text-gray-600">
              {session.status === 'active' ? 'Em andamento' : 'Pausada'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          session.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {session.status === 'active' ? 'ATIVA' : 'PAUSADA'}
        </div>
      </div>

      {/* Informações do paciente */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <User size={16} className="text-gray-400" />
          <span className="text-sm text-gray-700">{session.patient_name || 'Paciente'}</span>
        </div>
        {session.appointment_id && (
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-700">Consulta agendada</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(currentTime)}
        </div>
        <p className="text-sm text-gray-500">
          Iniciado às {new Date(session.start_time).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        {session.status === 'active' ? (
          <button
            onClick={pauseSession}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            <Pause size={16} />
            <span>Pausar</span>
          </button>
        ) : (
          <button
            onClick={resumeSession}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            <Play size={16} />
            <span>Retomar</span>
          </button>
        )}
        
        <button
          onClick={completeSession}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          <Square size={16} />
          <span>Finalizar</span>
        </button>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas da sessão
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione observações sobre a sessão..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          rows={3}
        />
      </div>
    </div>
  );
};

export default SessionTimer;