import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Save, Clock, FileText, AlertCircle } from 'lucide-react';
// Função local para formatar tempo
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

interface SessionNote {
  id: string;
  timestamp: number;
  content: string;
  type: 'observation' | 'intervention' | 'progress' | 'alert';
}

interface SessionTimerProps {
  patientName?: string;
  appointmentId?: string;
  onSaveSession?: (sessionData: {
    duration: number;
    notes: SessionNote[];
    startTime: Date;
    endTime?: Date;
  }) => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  patientName = 'Paciente',
  appointmentId,
  onSaveSession
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0); // em segundos
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [noteType, setNoteType] = useState<SessionNote['type']>('observation');
  const [isSessionSaved, setIsSessionSaved] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Atualizar o timer a cada segundo
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
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
  }, [isRunning]);

  // Auto-scroll para as notas mais recentes
  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes]);

  const handleStart = () => {
    if (!isRunning && !startTime) {
      setStartTime(new Date());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    // Adicionar nota automática de encerramento
    if (duration > 0) {
      const endNote: SessionNote = {
        id: `note-${Date.now()}`,
        timestamp: duration,
        content: `Sessão finalizada. Duração total: ${formatTime(duration)}`,
        type: 'alert'
      };
      setNotes(prev => [...prev, endNote]);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar o timer? Todas as anotações serão perdidas.')) {
      setIsRunning(false);
      setDuration(0);
      setStartTime(null);
      setNotes([]);
      setCurrentNote('');
      setIsSessionSaved(false);
    }
  };

  const addNote = () => {
    if (!currentNote.trim()) return;

    const newNote: SessionNote = {
      id: `note-${Date.now()}`,
      timestamp: duration,
      content: currentNote.trim(),
      type: noteType
    };

    setNotes(prev => [...prev, newNote]);
    setCurrentNote('');
  };

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNoteIcon = (type: SessionNote['type']) => {
    switch (type) {
      case 'observation': return '👁️';
      case 'intervention': return '🔧';
      case 'progress': return '📈';
      case 'alert': return '⚠️';
      default: return '📝';
    }
  };

  const getNoteColor = (type: SessionNote['type']) => {
    switch (type) {
      case 'observation': return 'border-l-blue-400 bg-blue-50';
      case 'intervention': return 'border-l-green-400 bg-green-50';
      case 'progress': return 'border-l-purple-400 bg-purple-50';
      case 'alert': return 'border-l-red-400 bg-red-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const handleSaveSession = () => {
    if (!startTime) return;

    const sessionData = {
      duration,
      notes,
      startTime,
      endTime: isRunning ? undefined : new Date()
    };

    if (onSaveSession) {
      onSaveSession(sessionData);
    }

    setIsSessionSaved(true);
    
    // Simular salvamento local
    localStorage.setItem(`session-${appointmentId || Date.now()}`, JSON.stringify(sessionData));
    
    alert('Sessão salva com sucesso!');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header da sessão */}
      <div className="bg-gradient-to-r from-sapere-orange to-sapere-yellow p-6 rounded-t-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">Sessão de Terapia</h2>
            <p className="text-sapere-orange-100">
              Paciente: <span className="font-semibold">{patientName}</span>
            </p>
            {startTime && (
              <p className="text-sm text-sapere-orange-100">
                Iniciada às {startTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          {/* Timer display */}
          <div className="text-right">
            <div className="text-4xl font-mono font-bold mb-2">
              {formatTimestamp(duration)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {isRunning ? 'Em andamento' : duration > 0 ? 'Pausada' : 'Pronta para iniciar'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Controles do timer */}
        <div className="flex items-center gap-3 mb-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-600 transition-colors"
            >
              <Play className="h-5 w-5" />
              {duration > 0 ? 'Continuar' : 'Iniciar Sessão'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-600 transition-colors"
            >
              <Pause className="h-5 w-5" />
              Pausar
            </button>
          )}

          <button
            onClick={handleStop}
            disabled={duration === 0}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="h-5 w-5" />
            Finalizar
          </button>

          <button
            onClick={handleReset}
            disabled={duration === 0}
            className="bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>

          <div className="flex-1" />

          <button
            onClick={handleSaveSession}
            disabled={duration === 0 || isSessionSaved}
            className="bg-sapere-orange text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-sapere-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {isSessionSaved ? 'Salva' : 'Salvar Sessão'}
          </button>
        </div>

        {/* Área de anotações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adicionar nova anotação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileText className="h-5 w-5" />
              Nova Anotação
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Anotação
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as SessionNote['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                >
                  <option value="observation">👁️ Observação</option>
                  <option value="intervention">🔧 Intervenção</option>
                  <option value="progress">📈 Progresso</option>
                  <option value="alert">⚠️ Alerta/Importante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anotação ({formatTimestamp(duration)})
                </label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      addNote();
                    }
                  }}
                  placeholder="Digite sua observação aqui... (Ctrl+Enter para adicionar rapidamente)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                  rows={4}
                />
              </div>

              <button
                onClick={addNote}
                disabled={!currentNote.trim()}
                className="w-full bg-sapere-orange text-white py-2 px-4 rounded-md font-medium hover:bg-sapere-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar Anotação
              </button>
            </div>
          </div>

          {/* Lista de anotações */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5" />
                Anotações da Sessão ({notes.length})
              </div>
              
              {notes.length > 0 && (
                <div className="text-sm text-gray-500">
                  Última: {formatTimestamp(notes[notes.length - 1]?.timestamp || 0)}
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-4">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma anotação ainda</p>
                  <p className="text-sm">Adicione observações durante a sessão</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className={`border-l-4 p-3 rounded-r-lg ${getNoteColor(note.type)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getNoteIcon(note.type)}</span>
                        <span className="text-sm font-medium text-gray-600">
                          {formatTimestamp(note.timestamp)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">
                        {note.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
              <div ref={notesEndRef} />
            </div>
          </div>
        </div>

        {/* Informações da sessão */}
        {duration > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">Resumo da Sessão</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Duração total:</span>
                <span className="ml-2 font-semibold">{formatTimestamp(duration)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total de anotações:</span>
                <span className="ml-2 font-semibold">{notes.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-semibold">
                  {isRunning ? (
                    <span className="text-green-600">Em andamento</span>
                  ) : (
                    <span className="text-yellow-600">Pausada</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTimer;