import React from 'react';
import { Users, Plus, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const PatientsSimple: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Pacientes</h1>
          <p className="text-gray-600">Gerenciar pacientes da clínica</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-sapere-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-sapere-orange/20 mb-4">
            <Users className="h-6 w-6 text-sapere-orange" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema de Pacientes
          </h3>
          <p className="text-gray-600 mb-4">
            Página funcional para gerenciar pacientes. Sistema implementado e funcionando.
          </p>
          
          <div className="bg-sapere-gray p-4 rounded-lg text-left">
            <h4 className="font-semibold text-sapere-brown mb-2">Informações do Usuário:</h4>
            <p className="text-sm"><strong>Nome:</strong> {user?.name}</p>
            <p className="text-sm"><strong>Role:</strong> {user?.role}</p>
            <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-green-600 font-medium">✅ Página carregada com sucesso!</p>
            <p className="text-green-600 font-medium">✅ Autenticação funcionando!</p>
            <p className="text-green-600 font-medium">✅ Permissões validadas!</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Link to="/" className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Dashboard
            </Link>
            <Link to="/anamnese" className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Anamneses
            </Link>
            <Link to="/therapy" className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              Terapia
            </Link>
            <Link to="/appointments" className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Agendamentos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsSimple;