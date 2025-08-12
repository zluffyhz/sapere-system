import React from 'react';
import { 
  MessageSquare,
  Users
} from 'lucide-react';
import CommunicationCenter from '@/components/communications/CommunicationCenter';

const Communication: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sapere-brown flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Mural de Recados
        </h1>
        <p className="text-gray-600 mt-1">
          Central de comunicação interna do Centro de Desenvolvimento Sapere
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recados Ativos</p>
              <p className="text-2xl font-bold text-sapere-brown">12</p>
            </div>
            <MessageSquare className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recados Fixados</p>
              <p className="text-2xl font-bold text-sapere-brown">3</p>
            </div>
            <MessageSquare className="h-8 w-8 text-sapere-yellow" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Equipe Ativa</p>
              <p className="text-2xl font-bold text-sapere-brown">8</p>
            </div>
            <Users className="h-8 w-8 text-sapere-green" />
          </div>
        </div>
      </div>

      {/* Communication Center */}
      <CommunicationCenter />
    </div>
  );
};

export default Communication;