import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Eye, UserCheck, Phone, Mail, Star, Award, BarChart3 } from 'lucide-react';
import TherapistFormModal from '../components/therapists/TherapistFormModal';
import TherapistDashboard from '../components/therapists/TherapistDashboard';
import { api, adminAPI } from '../services/api';

interface Therapist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  status: 'active' | 'inactive';
  professional_id?: string;
  avatar_url?: string;
  bio?: string;
  experience_years?: number;
  languages: string[];
  total_sessions?: number;
  total_patients?: number;
  patient_satisfaction_score?: number;
  specialties_details: Array<{
    name: string;
    color: string;
    experience_level: number;
  }>;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function Therapists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/therapists');
      
      // Transformar os dados da API para o formato esperado
      const therapistData = response.data.therapists.map((therapist: any) => ({
        id: therapist.id,
        name: therapist.user?.name || therapist.name || 'Nome não informado',
        email: therapist.user?.email || therapist.email || '',
        phone: therapist.user?.phone || therapist.phone,
        specialties: therapist.specialties || [],
        status: therapist.active ? 'active' : 'inactive',
        professional_id: therapist.professional_id,
        avatar_url: therapist.avatar_url,
        bio: therapist.bio,
        experience_years: therapist.experience_years,
        languages: therapist.languages || [],
        total_sessions: therapist.total_sessions,
        total_patients: therapist.total_patients,
        patient_satisfaction_score: therapist.patient_satisfaction_score,
        specialties_details: therapist.specialties_details || [],
        user: therapist.user
      }));
      
      setTherapists(therapistData);
    } catch (error) {
      console.error('Erro ao buscar terapeutas:', error);
      setError('Erro ao carregar terapeutas. Tente novamente.');
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTherapist = () => {
    setSelectedTherapist(null);
    setShowFormModal(true);
  };

  const handleEditTherapist = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setShowFormModal(true);
  };

  const handleViewDashboard = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setShowDashboard(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDashboard(false);
    setSelectedTherapist(null);
    fetchTherapists(); // Recarregar dados após edição
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (therapist.professional_id && therapist.professional_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || therapist.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Ativo' : 'Inativo';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Terapeutas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie a equipe de profissionais da clínica
          </p>
        </div>
        <button 
          onClick={handleCreateTherapist}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Terapeuta
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar terapeutas por nome ou especialidade..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Terapeutas</p>
              <p className="text-2xl font-bold text-gray-900">{therapists.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Terapeutas Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {therapists.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Especialidades</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.from(new Set(therapists.flatMap(t => t.specialties))).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Star className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">
                {therapists.length > 0 ? 
                  (therapists.reduce((acc, t) => acc + (t.patient_satisfaction_score || 0), 0) / therapists.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Therapists List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Terapeutas ({filteredTherapists.length})
          </h3>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando terapeutas...</p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <div className="text-red-600 mb-4">
              <Users className="mx-auto h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button 
                onClick={fetchTherapists}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        ) : filteredTherapists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terapeuta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pacientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTherapists.map((therapist) => (
                  <tr key={therapist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          {therapist.avatar_url && (
                            <img
                              src={therapist.avatar_url}
                              alt={therapist.name}
                              className="w-8 h-8 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {therapist.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {therapist.professional_id || 'CRP não informado'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" />
                          {therapist.email || 'Email não informado'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2" />
                          {therapist.phone || 'Telefone não informado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties_details && therapist.specialties_details.length > 0 ? (
                          therapist.specialties_details.map((specialty, index) => (
                            <span 
                              key={index} 
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                              style={{ 
                                backgroundColor: specialty.color + '20',
                                color: specialty.color,
                                borderColor: specialty.color
                              }}
                            >
                              {specialty.name}
                            </span>
                          ))
                        ) : therapist.specialties && therapist.specialties.length > 0 ? (
                          therapist.specialties.map((specialty, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {specialty}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Nenhuma especialidade</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {therapist.total_patients || 0} pacientes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < Math.floor(therapist.patient_satisfaction_score || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          {therapist.patient_satisfaction_score?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(therapist.status)}`}>
                        {getStatusLabel(therapist.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDashboard(therapist)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Ver Dashboard"
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewDashboard(therapist)}
                          className="text-green-600 hover:text-green-900"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditTherapist(therapist)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar Terapeuta"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum terapeuta encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece cadastrando um novo terapeuta.
            </p>
            <div className="mt-6">
              <button 
                onClick={handleCreateTherapist}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2" size={16} />
                Novo Terapeuta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {showFormModal && (
        <TherapistFormModal
          isOpen={showFormModal}
          initialData={selectedTherapist as any}
          onClose={handleCloseModal}
          onSave={async (data) => {
            try {
              if (selectedTherapist?.id) {
                await adminAPI.therapists.update(selectedTherapist.id, data);
              } else {
                await adminAPI.therapists.create(data as any);
              }
              await fetchTherapists();
              handleCloseModal();
            } catch (error) {
              console.error('Erro ao salvar terapeuta:', error);
            }
          }}
          specialties={[]}
        />
      )}

      {showDashboard && selectedTherapist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Dashboard de Produtividade</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <TherapistDashboard 
                therapist={selectedTherapist}
                onRefresh={fetchTherapists}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}