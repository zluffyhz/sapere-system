import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  User, 
  FileText, 
  Save, 
  Calendar,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface TherapySession {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  therapist: string;
  objectives: string;
  activities: string;
  observations: string;
  progress: string;
  nextSession: string;
  status: 'active' | 'completed';
  createdAt: string;
}

const TherapyReal: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [activeSession, setActiveSession] = useState<TherapySession | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    patientName: '',
    objectives: '',
    activities: '',
    observations: '',
    progress: '',
    nextSession: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const savedSessions = localStorage.getItem('sapere_therapy_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  };

  const saveSessions = (updatedSessions: TherapySession[]) => {
    localStorage.setItem('sapere_therapy_sessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  const startSession = () => {
    if (!formData.patientName) {
      error('Nome do paciente é obrigatório');
      return;
    }

    const now = new Date();
    const newSession: TherapySession = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      date: format(now, 'yyyy-MM-dd'),
      startTime: format(now, 'HH:mm'),
      therapist: user?.name || 'Terapeuta',
      objectives: formData.objectives,
      activities: '',
      observations: '',
      progress: '',
      nextSession: '',
      status: 'active',
      createdAt: now.toISOString()
    };

    setActiveSession(newSession);
    setShowForm(false);
    setFormData({
      patientName: '',
      objectives: '',
      activities: '',
      observations: '',
      progress: '',
      nextSession: ''
    });
    
    success('Sessão iniciada com sucesso!');
  };

  const finishSession = () => {
    if (!activeSession) return;

    const now = new Date();
    const startTime = new Date(`${activeSession.date}T${activeSession.startTime}`);
    const duration = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));

    const completedSession: TherapySession = {
      ...activeSession,
      endTime: format(now, 'HH:mm'),
      duration,
      activities: formData.activities,
      observations: formData.observations,
      progress: formData.progress,
      nextSession: formData.nextSession,
      status: 'completed'
    };

    const updatedSessions = [...sessions, completedSession];
    saveSessions(updatedSessions);
    setActiveSession(null);
    
    setFormData({
      patientName: '',
      objectives: '',
      activities: '',
      observations: '',
      progress: '',
      nextSession: ''
    });

    success('Sessão finalizada e salva com sucesso!');
  };

  const cancelSession = () => {
    if (window.confirm('Tem certeza que deseja cancelar esta sessão?')) {
      setActiveSession(null);
      setFormData({
        patientName: '',
        objectives: '',
        activities: '',
        observations: '',
        progress: '',
        nextSession: ''
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getSessionDuration = () => {
    if (!activeSession) return '0min';
    const now = new Date();
    const startTime = new Date(`${activeSession.date}T${activeSession.startTime}`);
    const duration = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));
    return formatDuration(duration);
  };

  const recentSessions = sessions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Sessões de Terapia</h1>
          <p className="text-gray-600">Gerencie e documente sessões terapêuticas</p>
        </div>
        
        {!activeSession && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Iniciar Nova Sessão</span>
          </button>
        )}
      </div>

      {/* Sessão Ativa */}
      {activeSession && (
        <div className="card border-l-4 border-l-green-500 bg-green-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-green-800 mb-2">
                Sessão em Andamento
              </h2>
              <div className="flex items-center space-x-4 text-sm text-green-700">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{activeSession.patientName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(activeSession.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Iniciada às {activeSession.startTime}</span>
                </div>
                <div className="flex items-center space-x-1 font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>{getSessionDuration()}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={finishSession}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Finalizar Sessão</span>
              </button>
              <button
                onClick={cancelSession}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>

          {activeSession.objectives && (
            <div className="mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Objetivos da Sessão:</h3>
              <p className="text-green-700">{activeSession.objectives}</p>
            </div>
          )}

          {/* Formulário de Documentação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Atividades Realizadas
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                placeholder="Descreva as atividades realizadas durante a sessão..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Observações Comportamentais
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Comportamentos observados, reações, participação..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Progresso Observado
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                placeholder="Progressos identificados, conquistas, desafios..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Planejamento Próxima Sessão
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.nextSession}
                onChange={(e) => setFormData({ ...formData, nextSession: e.target.value })}
                placeholder="Objetivos e atividades para a próxima sessão..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Formulário Nova Sessão */}
      {showForm && !activeSession && (
        <div className="card">
          <h2 className="text-xl font-bold text-sapere-brown mb-4">Nova Sessão de Terapia</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Paciente *
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Digite o nome do paciente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivos da Sessão
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="Defina os objetivos principais desta sessão..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={startSession}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Iniciar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
              <p className="text-2xl font-bold text-sapere-brown">{sessions.length}</p>
            </div>
            <FileText className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-blue-600">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.date);
                  const now = new Date();
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return sessionDate >= weekAgo;
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.duration).length > 0
                  ? formatDuration(Math.round(
                      sessions
                        .filter(s => s.duration)
                        .reduce((acc, s) => acc + (s.duration || 0), 0) /
                      sessions.filter(s => s.duration).length
                    ))
                  : '0min'
                }
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Sessões Recentes */}
      <div className="card">
        <h2 className="text-lg font-bold text-sapere-brown mb-4">Sessões Recentes</h2>
        
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão registrada</h3>
            <p className="text-gray-600">Inicie uma nova sessão para começar a documentar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{session.patientName}</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(session.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>Terapeuta: {session.therapist}</span>
                  <span>Horário: {session.startTime} - {session.endTime}</span>
                  {session.duration && <span>Duração: {formatDuration(session.duration)}</span>}
                </div>
                
                {session.objectives && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Objetivos:</strong> {session.objectives}
                  </div>
                )}
                
                {session.activities && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Atividades:</strong> {session.activities}
                  </div>
                )}
                
                {session.progress && (
                  <div className="text-sm text-gray-700">
                    <strong>Progresso:</strong> {session.progress}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapyReal;