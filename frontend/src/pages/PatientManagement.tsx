import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  User
} from 'lucide-react';
import axios from 'axios';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birth_date?: string;
  cpf?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface PatientForm {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  address: string;
  notes: string;
}

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<PatientForm>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    cpf: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${apiUrl}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setError('Erro ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
    );

    setFilteredPatients(filtered);
  };

  const openModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birthDate || patient.birth_date || '',
        cpf: patient.cpf || '',
        address: patient.address || '',
        notes: patient.notes || ''
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        cpf: '',
        address: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        birth_date: formData.birthDate || undefined,
        cpf: formData.cpf || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined
      };

      if (editingPatient) {
        // Editar paciente existente
        await axios.put(`${apiUrl}/api/patients/${editingPatient.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Criar novo paciente
        await axios.post(`${apiUrl}/api/patients`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      await loadPatients();
      closeModal();
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      setError(error.response?.data?.message || 'Erro ao salvar paciente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      await axios.delete(`${apiUrl}/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await loadPatients();
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      alert('Erro ao deletar paciente');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-500" />
              Gestão de Pacientes
            </h1>
            <p className="text-gray-600 mt-1">
              Total de {patients.length} paciente(s) cadastrado(s)
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Paciente
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Tabela de Pacientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Data Nasc.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center text-white font-semibold">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {patient.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {patient.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(patient.birthDate || patient.birth_date)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Criação/Edição */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="Nome do paciente"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                      placeholder="Informações adicionais sobre o paciente..."
                    />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientManagement;
