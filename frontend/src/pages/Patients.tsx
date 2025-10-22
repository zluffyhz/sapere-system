import { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  diagnosis?: string;
  status: 'active' | 'inactive';
  nextAppointment?: string;
}

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Mock data - será substituído pela API
  const patients: Patient[] = [
    {
      id: '1',
      name: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-1234',
      birthDate: '2015-03-15',
      diagnosis: 'TDAH',
      status: 'active',
      nextAppointment: '2024-03-20 14:00'
    },
    {
      id: '2',
      name: 'Maria Oliveira Costa',
      email: 'maria.oliveira@email.com',
      phone: '(11) 88888-5678',
      birthDate: '2012-07-22',
      diagnosis: 'TEA',
      status: 'active',
      nextAppointment: '2024-03-18 15:30'
    },
    {
      id: '3',
      name: 'Pedro Henrique Souza',
      email: 'pedro.souza@email.com',
      phone: '(11) 77777-9012',
      birthDate: '2018-11-08',
      diagnosis: 'Dislexia',
      status: 'active'
    },
    {
      id: '4',
      name: 'Ana Beatriz Lima',
      email: 'ana.lima@email.com',
      phone: '(11) 66666-3456',
      birthDate: '2014-05-30',
      diagnosis: 'TDAH + TEA',
      status: 'active',
      nextAppointment: '2024-03-19 10:00'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os pacientes cadastrados na clínica
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Paciente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pacientes por nome, email ou diagnóstico..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Com Consultas Agendadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.nextAppointment).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Pacientes ({filteredPatients.length})
          </h3>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnóstico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próxima Consulta
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
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" />
                          {patient.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2" />
                          {patient.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateAge(patient.birthDate)} anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.diagnosis && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {patient.diagnosis}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.nextAppointment ? (
                        <div>
                          <div>{new Date(patient.nextAppointment).toLocaleDateString('pt-BR')}</div>
                          <div className="text-gray-500">
                            {new Date(patient.nextAppointment).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sem agendamento</span>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-orange-600 hover:text-orange-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum paciente encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece cadastrando um novo paciente.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="mr-2" size={16} />
                Novo Paciente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal (placeholder) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Paciente</h3>
            <p className="text-gray-600 mb-4">
              Formulário de cadastro de paciente será implementado aqui.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}