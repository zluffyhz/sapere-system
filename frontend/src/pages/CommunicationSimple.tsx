import React from 'react';
import { MessageSquare, Mail, Phone, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const CommunicationSimple: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Comunicação</h1>
          <p className="text-gray-600">Mensagens e comunicação com pacientes</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-sapere-whatsapp text-white rounded-lg hover:bg-green-600 transition-colors">
          <Send className="h-4 w-4" />
          <span>Nova Mensagem</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sistema de Comunicação
          </h3>
          <p className="text-gray-600 mb-4">
            Página funcional para gerenciar comunicação com pacientes e responsáveis.
          </p>
          
          <div className="bg-sapere-gray p-4 rounded-lg text-left">
            <h4 className="font-semibold text-sapere-brown mb-2">Canais Disponíveis:</h4>
            <div className="space-y-1 text-sm">
              <p className="text-green-600">✅ WhatsApp: (92) 99230-5850</p>
              <p className="text-green-600">✅ Email: Sapere.recepcao@gmail.com</p>
              <p className="text-green-600">✅ Notificações do sistema</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800 font-medium">WhatsApp</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800 font-medium">Email</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Phone className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-800 font-medium">Telefone</p>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Usuário logado: <strong>{user?.name}</strong> ({user?.role})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationSimple;