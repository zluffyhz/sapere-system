import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Play, 
  Pause, 
  Square, 
  Save,
  Timer,
  Users,
  Activity,
  MessageSquare,
  Star,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface TherapySessionData {
  id?: string;
  patientId?: string;
  patientName?: string;
  therapistId: string;
  therapistName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // em minutos
  sessionType: 'scheduled' | 'walk_in';
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string;
  mood: 'excellent' | 'good' | 'neutral' | 'difficult' | 'challenging';
  attentionLevel: number; // 1-10
  cooperationLevel: number; // 1-10
  objectives: string[];
  activities: string[];
  homework: string;
  nextSessionPlanning: string;
  observations: string;
}

const TherapySession: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, error } = useNotification();
  
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // em segundos
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Session states  
  const [sessionData, setSessionData] = useState<Partial<TherapySessionData>>({
    therapistId: user?.id || '',
    therapistName: user?.name || '',
    sessionType: appointmentId ? 'scheduled' : 'walk_in',
    status: 'in_progress',
    mood: 'neutral',
    attentionLevel: 5,
    cooperationLevel: 5,
    objectives: [],
    activities: [],
    notes: '',
    homework: '',
    nextSessionPlanning: '',
    observations: ''
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState<'timer' | 'notes' | 'assessment' | 'planning'>('timer');

  // Debug das abas - detectar mudanças
  useEffect(() => {
    console.log('=== DEBUG ABAS THERAPY SESSION ===');
    console.log('Aba ativa atual:', activeTab);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('===================================');
  }, [activeTab]);
  
  // URL parameters for quick start
  const patientIdParam = searchParams.get('patientId');
  const patientNameParam = searchParams.get('patientName');

  useEffect(() => {
    // Initialize session data from URL params
    if (patientIdParam) {
      setSessionData(prev => ({
        ...prev,
        patientId: patientIdParam,
        patientName: patientNameParam || 'Paciente'
      }));
    }
  }, [patientIdParam, patientNameParam]);

  // Timer effect
  useEffect(() => {
    let interval: number;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setIsRunning(true);
    setStartTime(new Date());
    setSessionData(prev => ({
      ...prev,
      startTime: new Date(),
      status: 'in_progress'
    }));
    success('Sessão iniciada com sucesso!');
  };

  const handlePauseSession = () => {
    setIsRunning(false);
    success('Sessão pausada');
  };

  const handleResumeSession = () => {
    setIsRunning(true);
    success('Sessão retomada');
  };

  const handleStopSession = () => {
    setIsRunning(false);
    setSessionData(prev => ({
      ...prev,
      endTime: new Date(),
      duration: Math.floor(timeElapsed / 60),
      status: 'completed'
    }));
    success('Sessão finalizada');
  };

  const handleSaveSession = async () => {
    try {
      const finalSessionData: TherapySessionData = {
        id: `session_${Date.now()}`,
        ...sessionData as TherapySessionData,
        duration: Math.floor(timeElapsed / 60),
        endTime: new Date()
      };

      // Salvar no localStorage (em produção seria uma API call)
      const existingSessions = JSON.parse(localStorage.getItem('therapy-sessions') || '[]');
      existingSessions.push(finalSessionData);
      localStorage.setItem('therapy-sessions', JSON.stringify(existingSessions));

      success('Sessão salva com sucesso!');
      navigate('/appointments');
    } catch (err) {
      error('Erro ao salvar sessão');
    }
  };

  const addObjective = () => {
    const objective = prompt('Adicionar objetivo da sessão:');
    if (objective?.trim()) {
      setSessionData(prev => ({
        ...prev,
        objectives: [...(prev.objectives || []), objective.trim()]
      }));
    }
  };

  const addActivity = () => {
    const activity = prompt('Adicionar atividade realizada:');
    if (activity?.trim()) {
      setSessionData(prev => ({
        ...prev,
        activities: [...(prev.activities || []), activity.trim()]
      }));
    }
  };

  const removeObjective = (index: number) => {
    setSessionData(prev => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index) || []
    }));
  };

  const removeActivity = (index: number) => {
    setSessionData(prev => ({
      ...prev,
      activities: prev.activities?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Sessão de Terapia
                </h1>
                <p className="text-sm text-gray-500">
                  {sessionData.patientName || 'Paciente'} • {user?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-sapere-brown font-mono">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-xs text-gray-500">
                  {isRunning ? '🟢 Em andamento' : '⏸️ Pausada'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center space-x-4">
            {!isRunning && timeElapsed === 0 && (
              <button
                onClick={handleStartSession}
                className="flex items-center space-x-2 px-8 py-3 bg-sapere-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Iniciar Sessão</span>
              </button>
            )}
            
            {isRunning && (
              <>
                <button
                  onClick={handlePauseSession}
                  className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  <Pause className="h-5 w-5" />
                  <span>Pausar</span>
                </button>
                <button
                  onClick={handleStopSession}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  <Square className="h-5 w-5" />
                  <span>Finalizar</span>
                </button>
              </>
            )}
            
            {!isRunning && timeElapsed > 0 && (
              <>
                <button
                  onClick={handleResumeSession}
                  className="flex items-center space-x-2 px-6 py-3 bg-sapere-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  <Play className="h-5 w-5" />
                  <span>Continuar</span>
                </button>
                <button
                  onClick={handleSaveSession}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Salvar Sessão</span>
                </button>
              </>
            )}
          </div>
          
          {timeElapsed > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Duração atual: <strong>{Math.floor(timeElapsed / 60)} minutos</strong>
                {startTime && (
                  <span className="ml-4">
                    Iniciada às: <strong>{startTime.toLocaleTimeString()}</strong>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'timer', label: 'Timer', icon: Timer },
                { key: 'notes', label: 'Anotações', icon: FileText },
                { key: 'assessment', label: 'Avaliação', icon: Star },
                { key: 'planning', label: 'Planejamento', icon: Calendar }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`📅 ANTES: aba atual = ${activeTab}`);
                    console.log(`📅 Clicando na aba ${label.toUpperCase()}`);
                    setActiveTab(key as any);
                    console.log(`📅 DEPOIS: mudando para = ${key}`);
                  }}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-sapere-orange text-sapere-brown'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    cursor: 'pointer'
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Timer Tab */}
            {activeTab === 'timer' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-sapere-brown font-mono mb-2">
                    {formatTime(timeElapsed)}
                  </div>
                  <p className="text-gray-600">
                    {isRunning ? 'Sessão em andamento' : timeElapsed > 0 ? 'Sessão pausada' : 'Pronto para iniciar'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Paciente</span>
                    </div>
                    <p className="text-blue-800">{sessionData.patientName || 'Não especificado'}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Terapeuta</span>
                    </div>
                    <p className="text-green-800">{sessionData.therapistName}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Tipo</span>
                    </div>
                    <p className="text-purple-800">
                      {sessionData.sessionType === 'scheduled' ? 'Agendada' : 'Avulsa'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anotações da Sessão
                  </label>
                  <textarea
                    value={sessionData.notes || ''}
                    onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                    placeholder="Descreva o que aconteceu durante a sessão, comportamentos observados, progressos, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações Gerais
                  </label>
                  <textarea
                    value={sessionData.observations || ''}
                    onChange={(e) => setSessionData(prev => ({ ...prev, observations: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                    placeholder="Observações adicionais, insights, pontos de atenção..."
                  />
                </div>
              </div>
            )}

            {/* Assessment Tab */}
            {activeTab === 'assessment' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Humor/Estado Emocional
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'excellent', label: '😊 Excelente', color: 'bg-green-100 text-green-800' },
                      { value: 'good', label: '🙂 Bom', color: 'bg-blue-100 text-blue-800' },
                      { value: 'neutral', label: '😐 Neutro', color: 'bg-gray-100 text-gray-800' },
                      { value: 'difficult', label: '😔 Difícil', color: 'bg-yellow-100 text-yellow-800' },
                      { value: 'challenging', label: '😟 Desafiador', color: 'bg-red-100 text-red-800' }
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => setSessionData(prev => ({ ...prev, mood: value as any }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sessionData.mood === value ? color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Atenção (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sessionData.attentionLevel || 5}
                      onChange={(e) => setSessionData(prev => ({ ...prev, attentionLevel: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Baixo</span>
                      <span className="font-medium">{sessionData.attentionLevel}</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Cooperação (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sessionData.cooperationLevel || 5}
                      onChange={(e) => setSessionData(prev => ({ ...prev, cooperationLevel: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Baixo</span>
                      <span className="font-medium">{sessionData.cooperationLevel}</span>
                      <span>Alto</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Objetivos da Sessão
                    </label>
                    <button
                      onClick={addObjective}
                      className="px-3 py-1 bg-sapere-orange text-white rounded text-sm hover:bg-orange-600 transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(sessionData.objectives || []).map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                        <span className="flex-1">{objective}</span>
                        <button
                          onClick={() => removeObjective(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(sessionData.objectives || []).length === 0 && (
                      <p className="text-gray-500 text-sm italic">Nenhum objetivo adicionado</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Atividades Realizadas
                    </label>
                    <button
                      onClick={addActivity}
                      className="px-3 py-1 bg-sapere-orange text-white rounded text-sm hover:bg-orange-600 transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(sessionData.activities || []).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                        <span className="flex-1">{activity}</span>
                        <button
                          onClick={() => removeActivity(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(sessionData.activities || []).length === 0 && (
                      <p className="text-gray-500 text-sm italic">Nenhuma atividade adicionada</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Planning Tab */}
            {activeTab === 'planning' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarefa de Casa
                  </label>
                  <textarea
                    value={sessionData.homework || ''}
                    onChange={(e) => setSessionData(prev => ({ ...prev, homework: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                    placeholder="Descreva as tarefas ou exercícios para casa..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planejamento da Próxima Sessão
                  </label>
                  <textarea
                    value={sessionData.nextSessionPlanning || ''}
                    onChange={(e) => setSessionData(prev => ({ ...prev, nextSessionPlanning: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                    placeholder="Objetivos, atividades e focos para a próxima sessão..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-800 font-medium">Lembretes</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        • Revisar tarefa de casa na próxima sessão<br/>
                        • Documentar evolução do paciente<br/>
                        • Comunicar mudanças significativas aos responsáveis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Actions */}
        {timeElapsed > 0 && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveSession}
              className="px-6 py-2 bg-sapere-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Salvar Sessão
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapySession;