import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAPERE_THERAPISTS, type Therapist } from '@/types/therapist';
import TherapistModal from '@/components/therapists/TherapistModal';

const Therapists: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data loading
  useEffect(() => {
    const loadTherapists = async () => {
      setLoading(true);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Converter dados mock para incluir IDs e timestamps
      const therapistsWithIds = SAPERE_THERAPISTS.map((therapist, index) => ({
        ...therapist,
        id: (index + 1).toString(),
        created_at: new Date(2023, index, 15).toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      setTherapists(therapistsWithIds);
      setLoading(false);
    };

    loadTherapists();
  }, []);

  // Filtros
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesSpecialty = !selectedSpecialty || 
                            therapist.specialties.includes(selectedSpecialty);
    const matchesStatus = !selectedStatus || therapist.status === selectedStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  // Obter todas as especialidades únicas
  const allSpecialties = Array.from(
    new Set(therapists.flatMap(t => t.specialties))
  ).sort();

  const handleEdit = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  const handleView = (therapist: Therapist) => {
    // Navegar para dashboard do terapeuta
    window.location.href = `/therapists/${therapist.id}`;
  };

  const handleStatusToggle = (therapistId: string) => {
    setTherapists(prev => prev.map(t => 
      t.id === therapistId 
        ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
        : t
    ));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      vacation: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      vacation: 'Férias'
    };
    return labels[status as keyof typeof labels] || 'Ativo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando terapeutas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sapere-brown">Terapeutas</h1>
          <p className="text-gray-600 mt-2">Gerencie a equipe de profissionais da Sapere</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 text-gray-600 hover:text-sapere-brown border border-gray-300 rounded-lg hover:border-sapere-orange transition-colors"
          >
            {viewMode === 'grid' ? '☰ Lista' : '⊞ Grade'}
          </button>
          <button
            onClick={() => {
              setSelectedTherapist(null);
              setIsModalOpen(true);
            }}
            className="bg-sapere-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Terapeuta</span>
          </button>
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border-2 border-sapere-orange p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Terapeutas</p>
              <p className="text-3xl font-bold text-sapere-brown mt-1">{therapists.length}</p>
            </div>
            <Users className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-green-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {therapists.filter(t => t.status === 'active').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-blue-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Especialidades</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{allSpecialties.length}</p>
            </div>
            <Award className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-purple-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {(therapists.reduce((acc, t) => acc + t.stats.rating, 0) / therapists.length).toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar terapeutas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            />
          </div>

          {/* Filtro por especialidade */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
          >
            <option value="">Todas as especialidades</option>
            {allSpecialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>

          {/* Filtro por status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="vacation">Férias</option>
          </select>

          {/* Limpar filtros */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('');
              setSelectedStatus('');
            }}
            className="px-4 py-2 text-gray-600 hover:text-sapere-brown border border-gray-300 rounded-lg hover:border-sapere-orange transition-colors"
          >
            <Filter className="h-4 w-4 mr-2 inline" />
            Limpar
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Exibindo {filteredTherapists.length} de {therapists.length} terapeutas
        </div>
      </div>

      {/* Lista/Grade de Terapeutas */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <div key={therapist.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
              {/* Header do card */}
              <div className="bg-gradient-to-r from-sapere-orange to-orange-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{therapist.name}</h3>
                      <p className="text-orange-100 text-sm">{therapist.registration_number}</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 hidden group-hover:block">
                      <button
                        onClick={() => handleView(therapist)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleEdit(therapist)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleStatusToggle(therapist.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        {therapist.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        <span>{therapist.status === 'active' ? 'Desativar' : 'Ativar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(therapist.status)}`}>
                    {getStatusLabel(therapist.status)}
                  </div>
                </div>
              </div>

              {/* Corpo do card */}
              <div className="p-6">
                {/* Especialidades */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="bg-sapere-gray text-sapere-brown text-xs px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                    {therapist.specialties.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        +{therapist.specialties.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-sapere-brown">{therapist.stats.patients_count}</div>
                    <div className="text-xs text-gray-500">Pacientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-sapere-brown">{therapist.stats.completion_rate}%</div>
                    <div className="text-xs text-gray-500">Taxa Conclusão</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(therapist.stats.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{therapist.stats.rating}</span>
                  </div>
                </div>

                {/* Contatos */}
                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-100">
                  <a
                    href={`tel:${therapist.phone}`}
                    className="p-2 text-sapere-orange hover:bg-sapere-orange hover:text-white rounded-lg transition-colors"
                    title="Ligar"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${therapist.email}`}
                    className="p-2 text-sapere-orange hover:bg-sapere-orange hover:text-white rounded-lg transition-colors"
                    title="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <Link
                    to={`/therapists/${therapist.id}/schedule`}
                    className="p-2 text-sapere-orange hover:bg-sapere-orange hover:text-white rounded-lg transition-colors"
                    title="Agenda"
                  >
                    <Calendar className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-sapere-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Terapeuta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Especialidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Pacientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Taxa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-sapere-brown uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTherapists.map((therapist) => (
                  <tr key={therapist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-sapere-orange text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {therapist.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{therapist.name}</div>
                          <div className="text-sm text-gray-500">{therapist.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties.slice(0, 2).map((specialty, index) => (
                          <span key={index} className="bg-sapere-gray text-sapere-brown text-xs px-2 py-1 rounded-full">
                            {specialty}
                          </span>
                        ))}
                        {therapist.specialties.length > 2 && (
                          <span className="text-xs text-gray-500">+{therapist.specialties.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(therapist.status)}`}>
                        {getStatusLabel(therapist.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {therapist.stats.patients_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {therapist.stats.completion_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(therapist.stats.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{therapist.stats.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(therapist)}
                          className="text-sapere-orange hover:text-orange-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(therapist)}
                          className="text-gray-600 hover:text-sapere-brown transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <a
                          href={`tel:${therapist.phone}`}
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredTherapists.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum terapeuta encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou adicionar um novo terapeuta.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <TherapistModal
          therapist={selectedTherapist}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(therapist) => {
            if (selectedTherapist) {
              // Update existing
              setTherapists(prev => prev.map(t => t.id === therapist.id ? therapist : t));
            } else {
              // Add new
              setTherapists(prev => [...prev, { ...therapist, id: Date.now().toString() }]);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Therapists;