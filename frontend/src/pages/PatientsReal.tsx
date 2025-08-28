import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  Calendar,
  Activity,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  responsible?: string;
  responsiblePhone?: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

const PatientsReal: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    responsible: '',
    responsiblePhone: '',
    diagnosis: '',
    notes: ''
  });

  // Carregar pacientes (implementar com API real depois)
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      // Por enquanto, usar dados locais
      const savedPatients = localStorage.getItem('sapere_patients');
      if (savedPatients) {
        setPatients(JSON.parse(savedPatients));
      } else {
        // Dados mock para demonstração (importante para que os botões apareçam)
        const mockPatients: Patient[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999',
            birthDate: '2010-05-15',
            responsible: 'Maria Silva',
            responsiblePhone: '(11) 88888-8888',
            diagnosis: 'Autismo Leve',
            notes: 'Paciente colaborativo',
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            id: '2', 
            name: 'Ana Costa',
            email: 'ana@email.com',
            phone: '(11) 77777-7777',
            birthDate: '2012-03-20',
            responsible: 'Carlos Costa',
            responsiblePhone: '(11) 66666-6666',
            diagnosis: 'TDAH',
            notes: 'Sessões semanais',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('sapere_patients', JSON.stringify(mockPatients));
        setPatients(mockPatients);
      }
    } catch (err) {
      error('Erro ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const savePatients = (updatedPatients: Patient[]) => {
    localStorage.setItem('sapere_patients', JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      error('Nome e telefone são obrigatórios');
      return;
    }

    const patientData: Patient = {
      id: editingPatient?.id || Date.now().toString(),
      ...formData,
      createdAt: editingPatient?.createdAt || new Date().toISOString(),
      status: 'active'
    };

    let updatedPatients: Patient[];
    
    if (editingPatient) {
      updatedPatients = patients.map(p => p.id === editingPatient.id ? patientData : p);
      success('Paciente atualizado com sucesso!');
    } else {
      updatedPatients = [...patients, patientData];
      success('Paciente cadastrado com sucesso!');
    }

    savePatients(updatedPatients);
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email || '',
      phone: patient.phone,
      birthDate: patient.birthDate || '',
      responsible: patient.responsible || '',
      responsiblePhone: patient.responsiblePhone || '',
      diagnosis: patient.diagnosis || '',
      notes: patient.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      const updatedPatients = patients.filter(p => p.id !== id);
      savePatients(updatedPatients);
      success('Paciente excluído com sucesso!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      responsible: '',
      responsiblePhone: '',
      diagnosis: '',
      notes: ''
    });
    setEditingPatient(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Directus-Inspired Patients Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sapere-orange to-orange-600 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pacientes</h1>
                <p className="text-gray-500 font-medium">Gestão completa de pacientes da clínica</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{patients.length}</div>
                  <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'active').length}</div>
                  <div className="text-gray-500">Ativos</div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-sapere-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center space-x-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Paciente</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directus-Style Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Professional Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone"
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="status-badge bg-sapere-orange text-white">
                  {filteredPatients.length}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="card-compact">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-sapere-orange" />
            <div>
              <p className="text-sm font-medium text-gray-900">{patients.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        
        <div className="card-compact">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{patients.filter(p => p.status === 'active').length}</p>
              <p className="text-xs text-gray-500">Ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Patient List */}
      <div className="card p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-sapere-orange border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Carregando pacientes...</span>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Comece cadastrando um novo paciente'}
            </p>
            {!searchTerm && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                Cadastrar Primeiro Paciente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="table-professional">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Contato</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        {patient.birthDate && (
                          <div className="text-sm text-gray-500">
                            {new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} anos
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.email && (
                        <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.responsible ? (
                        <div>
                          <div className="text-sm text-gray-900">{patient.responsible}</div>
                          {patient.responsiblePhone && (
                            <div className="text-sm text-gray-500">{patient.responsiblePhone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-sapere-orange hover:text-sapere-brown"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sapere-brown">
                  {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone do Responsável
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.responsiblePhone}
                    onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
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
                  {editingPatient ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PatientsReal;