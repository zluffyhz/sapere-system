// Página de gerenciamento de pacientes
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  UserX,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import mockPatientsAPI, { mockPatientUtils } from '@/services/mockPatients';
import { useDashboardIntegration } from '@/hooks/useDashboardIntegration';
import PatientModal from '@/components/patients/PatientModal';
import type { PatientDetails, PatientFilters, PatientStats } from '@/services/mockPatients';

const Patients: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const { notifyPatientCreated } = useDashboardIntegration();

  const [patients, setPatients] = useState<PatientDetails[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PatientFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientDetails | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadPatients();
    loadStats();
  }, [filters, searchTerm]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const result = await mockPatientsAPI.list({
        ...filters,
        search: searchTerm || undefined
      });
      setPatients(result);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await mockPatientsAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleSearch = () => {
    console.log('Botão Buscar clicado, termo:', searchTerm);
    loadPatients();
  };

  const handleCreatePatient = () => {
    console.log('Botão Criar Paciente clicado');
    setEditingPatient(null);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient: PatientDetails) => {
    console.log('Botão Editar Paciente clicado:', patient.nome);
    setEditingPatient(patient);
    setShowPatientModal(true);
  };

  const handleSavePatient = async (patientData: Partial<PatientDetails>) => {
    try {
      if (editingPatient) {
        await mockPatientsAPI.update(editingPatient.id, patientData);
        success('Paciente atualizado com sucesso');
        
        setShowPatientModal(false);
        setEditingPatient(null);
        loadPatients();
        loadStats();
      } else {
        const newPatient = await mockPatientsAPI.create(patientData);
        success('Paciente criado com sucesso');
        
        // Notificar o dashboard sobre o novo paciente
        notifyPatientCreated(newPatient);
        
        // Fechar modal do paciente
        setShowPatientModal(false);
        setEditingPatient(null);
        
        loadPatients();
        loadStats();
      }
    } catch (err) {
      error('Erro ao salvar paciente');
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    console.log('Botão Deletar Paciente clicado:', patientId);
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    
    try {
      await mockPatientsAPI.delete(patientId);
      success('Paciente excluído com sucesso');
      loadPatients();
      loadStats();
    } catch (err) {
      error('Erro ao excluir paciente');
    }
  };

  const handleUpdateStatus = async (patientId: string, newStatus: 'ativo' | 'inativo' | 'alta') => {
    try {
      await mockPatientsAPI.updateStatus(patientId, newStatus);
      success(`Status alterado para ${mockPatientUtils.getStatusLabel(newStatus)}`);
      loadPatients();
      loadStats();
    } catch (err) {
      error('Erro ao alterar status do paciente');
    }
  };

  const getAgeFromBirth = (birthDate?: string): string => {
    if (!birthDate) return 'N/A';
    const age = mockPatientUtils.calculateAge(birthDate);
    return `${age} anos`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciamento de Pacientes
          </h1>
          <p className="text-gray-600 mt-1">
            Cadastro e acompanhamento de todos os pacientes da clínica.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              console.log('Botão Filtros clicado, estado atual:', showFilters);
              setShowFilters(!showFilters);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          
          <button 
            onClick={handleCreatePatient}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-sapere-brown">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-sapere-orange" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta</p>
                <p className="text-2xl font-bold text-blue-600">{stats.alta}</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Novos (30 dias)</p>
                <p className="text-2xl font-bold text-purple-600">{stats.novosMes}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Busca e Filtros */}
      <div className="card">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF, responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary px-6"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as any || undefined 
                  }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                >
                  <option value="">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Convênio
                </label>
                <select
                  value={filters.convenio || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    convenio: e.target.value || undefined 
                  }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                >
                  <option value="">Todos os convênios</option>
                  <option value="particular">Particular</option>
                  <option value="unimed">Unimed</option>
                  <option value="bradesco">Bradesco Saúde</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({});
                    setSearchTerm('');
                  }}
                  className="btn-secondary w-full"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Pacientes */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum paciente encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou cadastre um novo paciente
            </p>
          </div>
        ) : (
          patients.map(patient => (
            <div key={patient.id} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {patient.nome}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mockPatientUtils.getStatusColor(patient.historico?.status || 'ativo')
                      }`}>
                        {mockPatientUtils.getStatusLabel(patient.historico?.status || 'ativo')}
                      </span>
                      {patient.convenio?.nome && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {patient.convenio.nome}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {getAgeFromBirth(patient.nascimento)}
                      </div>
                      {patient.contatos.telefone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {patient.contatos.telefone}
                        </div>
                      )}
                      {patient.contatos.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {patient.contatos.email}
                        </div>
                      )}
                      {patient.endereco?.cidade && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {patient.endereco.cidade}, {patient.endereco.uf}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-700">
                        <strong>Responsável:</strong> {patient.responsavel.nome}
                      </p>
                      {patient.historico?.profissionalResponsavel && (
                        <p className="text-gray-700">
                          <strong>Profissional:</strong> {patient.historico.profissionalResponsavel}
                        </p>
                      )}
                    </div>

                    {patient.tags && patient.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {patient.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {patient.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{patient.tags.length - 3} mais
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Cadastrado em {new Date(patient.historico?.dataInicio || '').toLocaleDateString('pt-BR')}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 text-sapere-brown hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    {patient.historico?.status === 'ativo' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(patient.id, 'inativo')}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Marcar como inativo"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(patient.id, 'alta')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Dar alta"
                        >
                          <Award className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {patient.historico?.status === 'inativo' && (
                      <button
                        onClick={() => handleUpdateStatus(patient.id, 'ativo')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reativar"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}

                    {(user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de visualização */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPatient(null)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedPatient.nome}</h2>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Informações Pessoais</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><strong>CPF:</strong> {selectedPatient.cpf}</p>
                      <p><strong>RG:</strong> {selectedPatient.rg}</p>
                      <p><strong>Idade:</strong> {getAgeFromBirth(selectedPatient.nascimento)}</p>
                      <p><strong>Telefone:</strong> {selectedPatient.contatos.telefone}</p>
                    </div>
                  </div>
                  
                  {selectedPatient.dadosMedicos && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Informações Médicas</h3>
                      <div className="text-sm space-y-2">
                        {selectedPatient.dadosMedicos.condicoesMedicas && (
                          <p><strong>Condições:</strong> {selectedPatient.dadosMedicos.condicoesMedicas.join(', ')}</p>
                        )}
                        {selectedPatient.dadosMedicos.alergias && selectedPatient.dadosMedicos.alergias.length > 0 && (
                          <p><strong>Alergias:</strong> {selectedPatient.dadosMedicos.alergias.join(', ')}</p>
                        )}
                        {selectedPatient.dadosMedicos.observacoes && (
                          <p><strong>Observações:</strong> {selectedPatient.dadosMedicos.observacoes}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Paciente */}
      {showPatientModal && (
        <PatientModal
          patient={editingPatient}
          onSave={handleSavePatient}
          onClose={() => {
            setShowPatientModal(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default Patients;