import React from 'react';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const AppointmentsSimple: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Agendamentos</h1>
          <p className="text-gray-600">Gerenciar consultas e horários</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-sapere-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nova Consulta</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema de Agendamentos
          </h3>
          <p className="text-gray-600 mb-4">
            Página funcional para gerenciar consultas e agendamentos.
          </p>
          
          <div className="bg-sapere-gray p-4 rounded-lg text-left">
            <h4 className="font-semibold text-sapere-brown mb-2">Status do Sistema:</h4>
            <p className="text-sm text-green-600">✅ Rota funcionando</p>
            <p className="text-sm text-green-600">✅ Usuário: {user?.name}</p>
            <p className="text-sm text-green-600">✅ Role: {user?.role}</p>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800 font-medium">Horários</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-800 font-medium">Pacientes</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/therapy" className="inline-flex items-center space-x-2 px-4 py-2 bg-sapere-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
              <span>🎯</span>
              <span>Iniciar Terapia</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsSimple;