import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface Anamnese {
  id: string;
  patientName: string;
  date: string;
  therapist: string;
  type: string;
  status: 'draft' | 'completed' | 'reviewed';
  
  // Dados pessoais
  age: number;
  responsible?: string;
  
  // Histórico
  mainComplaint: string;
  currentHistory: string;
  previousHistory: string;
  familyHistory: string;
  
  // Desenvolvimento
  motorDevelopment: string;
  languageDevelopment: string;
  socialDevelopment: string;
  
  // Observações
  observations: string;
  goals: string;
  recommendations: string;
  
  createdAt: string;
}

const AnamneseReal: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAnamnese, setEditingAnamnese] = useState<Anamnese | null>(null);
  const [viewingAnamnese, setViewingAnamnese] = useState<Anamnese | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    responsible: '',
    type: 'Inicial',
    mainComplaint: '',
    currentHistory: '',
    previousHistory: '',
    familyHistory: '',
    motorDevelopment: '',
    languageDevelopment: '',
    socialDevelopment: '',
    observations: '',
    goals: '',
    recommendations: ''
  });

  const anamneseTypes = [
    'Inicial',
    'Terapia Ocupacional',
    'Fonoaudiologia',
    'Psicologia',
    'Fisioterapia',
    'Psicopedagogia',
    'Neuropsicológica'
  ];

  useEffect(() => {
    loadAnamneses();
  }, []);

  const loadAnamneses = () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem('sapere_anamneses');
      if (saved) {
        setAnamneses(JSON.parse(saved));
      }
    } catch (err) {
      error('Erro ao carregar anamneses');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnamneses = (updated: Anamnese[]) => {
    localStorage.setItem('sapere_anamneses', JSON.stringify(updated));
    setAnamneses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.mainComplaint) {
      error('Nome do paciente e queixa principal são obrigatórios');
      return;
    }

    const anamneseData: Anamnese = {
      id: editingAnamnese?.id || Date.now().toString(),
      patientName: formData.patientName,
      date: format(new Date(), 'yyyy-MM-dd'),
      therapist: user?.name || 'Terapeuta',
      type: formData.type,
      status: 'draft',
      age: parseInt(formData.age) || 0,
      responsible: formData.responsible,
      mainComplaint: formData.mainComplaint,
      currentHistory: formData.currentHistory,
      previousHistory: formData.previousHistory,
      familyHistory: formData.familyHistory,
      motorDevelopment: formData.motorDevelopment,
      languageDevelopment: formData.languageDevelopment,
      socialDevelopment: formData.socialDevelopment,
      observations: formData.observations,
      goals: formData.goals,
      recommendations: formData.recommendations,
      createdAt: editingAnamnese?.createdAt || new Date().toISOString()
    };

    let updated: Anamnese[];
    
    if (editingAnamnese) {
      updated = anamneses.map(a => a.id === editingAnamnese.id ? anamneseData : a);
      success('Anamnese atualizada com sucesso!');
    } else {
      updated = [...anamneses, anamneseData];
      success('Anamnese criada com sucesso!');
    }

    saveAnamneses(updated);
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (anamnese: Anamnese) => {
    setEditingAnamnese(anamnese);
    setFormData({
      patientName: anamnese.patientName,
      age: anamnese.age.toString(),
      responsible: anamnese.responsible || '',
      type: anamnese.type,
      mainComplaint: anamnese.mainComplaint,
      currentHistory: anamnese.currentHistory,
      previousHistory: anamnese.previousHistory,
      familyHistory: anamnese.familyHistory,
      motorDevelopment: anamnese.motorDevelopment,
      languageDevelopment: anamnese.languageDevelopment,
      socialDevelopment: anamnese.socialDevelopment,
      observations: anamnese.observations,
      goals: anamnese.goals,
      recommendations: anamnese.recommendations
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anamnese?')) {
      const updated = anamneses.filter(a => a.id !== id);
      saveAnamneses(updated);
      success('Anamnese excluída com sucesso!');
    }
  };

  const handleStatusChange = (id: string, status: Anamnese['status']) => {
    const updated = anamneses.map(a => 
      a.id === id ? { ...a, status } : a
    );
    saveAnamneses(updated);
    
    const statusLabels = {
      draft: 'rascunho',
      completed: 'concluída',
      reviewed: 'revisada'
    };
    
    success(`Anamnese marcada como ${statusLabels[status]}!`);
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      age: '',
      responsible: '',
      type: 'Inicial',
      mainComplaint: '',
      currentHistory: '',
      previousHistory: '',
      familyHistory: '',
      motorDevelopment: '',
      languageDevelopment: '',
      socialDevelopment: '',
      observations: '',
      goals: '',
      recommendations: ''
    });
    setEditingAnamnese(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'completed': return 'Concluída';
      case 'reviewed': return 'Revisada';
      default: return status;
    }
  };

  const filteredAnamneses = anamneses
    .filter(anamnese => 
      anamnese.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnese.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnese.therapist.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Anamneses</h1>
          <p className="text-gray-600">Gerencie anamneses e avaliações dos pacientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Anamnese</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-sapere-brown">{anamneses.length}</p>
            </div>
            <FileText className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rascunhos</p>
              <p className="text-2xl font-bold text-yellow-600">
                {anamneses.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">
                {anamneses.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                {anamneses.filter(a => {
                  const created = new Date(a.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && 
                         created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar anamneses..."
          className="pl-10 input-field"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Anamneses */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
          </div>
        ) : filteredAnamneses.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma anamnese encontrada' : 'Nenhuma anamnese cadastrada'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Crie uma nova anamnese'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnamneses.map((anamnese) => (
              <div key={anamnese.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {anamnese.patientName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{anamnese.type}</span>
                      <span>•</span>
                      <span>{format(new Date(anamnese.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span>•</span>
                      <span>{anamnese.therapist}</span>
                      {anamnese.age > 0 && (
                        <>
                          <span>•</span>
                          <span>{anamnese.age} anos</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(anamnese.status)}`}>
                      {getStatusLabel(anamnese.status)}
                    </span>
                  </div>
                </div>

                {anamnese.mainComplaint && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Queixa principal: </span>
                    <span className="text-sm text-gray-900">{anamnese.mainComplaint}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {anamnese.responsible && (
                      <span>Responsável: {anamnese.responsible}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewingAnamnese(anamnese)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {anamnese.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(anamnese.id, 'completed')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Marcar como concluída"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(anamnese)}
                      className="p-2 text-sapere-orange hover:bg-sapere-orange/10 rounded"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(anamnese.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sapere-brown">
                  {editingAnamnese ? 'Editar Anamnese' : 'Nova Anamnese'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Dados Básicos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idade
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Anamnese
                    </label>
                    <select
                      className="input-field"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {anamneseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  />
                </div>
              </div>

              {/* Histórico */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Histórico</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Queixa Principal *
                    </label>
                    <textarea
                      required
                      className="input-field"
                      rows={3}
                      value={formData.mainComplaint}
                      onChange={(e) => setFormData({ ...formData, mainComplaint: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        História Atual
                      </label>
                      <textarea
                        className="input-field"
                        rows={4}
                        value={formData.currentHistory}
                        onChange={(e) => setFormData({ ...formData, currentHistory: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        História Pregressa
                      </label>
                      <textarea
                        className="input-field"
                        rows={4}
                        value={formData.previousHistory}
                        onChange={(e) => setFormData({ ...formData, previousHistory: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      História Familiar
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.familyHistory}
                      onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Desenvolvimento */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Desenvolvimento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desenvolvimento Motor
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.motorDevelopment}
                      onChange={(e) => setFormData({ ...formData, motorDevelopment: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desenvolvimento da Linguagem
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.languageDevelopment}
                      onChange={(e) => setFormData({ ...formData, languageDevelopment: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desenvolvimento Social
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.socialDevelopment}
                      onChange={(e) => setFormData({ ...formData, socialDevelopment: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Observações e Planejamento */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações e Planejamento</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Gerais
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Objetivos Terapêuticos
                      </label>
                      <textarea
                        className="input-field"
                        rows={4}
                        value={formData.goals}
                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recomendações
                      </label>
                      <textarea
                        className="input-field"
                        rows={4}
                        value={formData.recommendations}
                        onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingAnamnese ? 'Atualizar' : 'Criar Anamnese'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {viewingAnamnese && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sapere-brown">
                  Anamnese - {viewingAnamnese.patientName}
                </h2>
                <button
                  onClick={() => setViewingAnamnese(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Dados Básicos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados Básicos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Paciente:</span>
                      <p>{viewingAnamnese.patientName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Idade:</span>
                      <p>{viewingAnamnese.age > 0 ? `${viewingAnamnese.age} anos` : '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <p>{viewingAnamnese.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data:</span>
                      <p>{format(new Date(viewingAnamnese.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                  </div>
                  {viewingAnamnese.responsible && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Responsável:</span>
                      <p>{viewingAnamnese.responsible}</p>
                    </div>
                  )}
                </div>

                {/* Queixa Principal */}
                {viewingAnamnese.mainComplaint && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Queixa Principal</h3>
                    <p className="text-gray-700">{viewingAnamnese.mainComplaint}</p>
                  </div>
                )}

                {/* Histórico */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {viewingAnamnese.currentHistory && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">História Atual</h3>
                      <p className="text-gray-700">{viewingAnamnese.currentHistory}</p>
                    </div>
                  )}
                  {viewingAnamnese.previousHistory && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">História Pregressa</h3>
                      <p className="text-gray-700">{viewingAnamnese.previousHistory}</p>
                    </div>
                  )}
                </div>

                {viewingAnamnese.familyHistory && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">História Familiar</h3>
                    <p className="text-gray-700">{viewingAnamnese.familyHistory}</p>
                  </div>
                )}

                {/* Desenvolvimento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {viewingAnamnese.motorDevelopment && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Desenvolvimento Motor</h3>
                      <p className="text-gray-700">{viewingAnamnese.motorDevelopment}</p>
                    </div>
                  )}
                  {viewingAnamnese.languageDevelopment && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Desenvolvimento da Linguagem</h3>
                      <p className="text-gray-700">{viewingAnamnese.languageDevelopment}</p>
                    </div>
                  )}
                  {viewingAnamnese.socialDevelopment && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Desenvolvimento Social</h3>
                      <p className="text-gray-700">{viewingAnamnese.socialDevelopment}</p>
                    </div>
                  )}
                </div>

                {/* Observações e Planejamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {viewingAnamnese.goals && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Objetivos Terapêuticos</h3>
                      <p className="text-gray-700">{viewingAnamnese.goals}</p>
                    </div>
                  )}
                  {viewingAnamnese.recommendations && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Recomendações</h3>
                      <p className="text-gray-700">{viewingAnamnese.recommendations}</p>
                    </div>
                  )}
                </div>

                {viewingAnamnese.observations && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Observações Gerais</h3>
                    <p className="text-gray-700">{viewingAnamnese.observations}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewingAnamnese(null)}
                  className="btn-primary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnamneseReal;