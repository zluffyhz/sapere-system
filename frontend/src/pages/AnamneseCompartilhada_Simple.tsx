import React, { useState } from 'react';
import { BookOpen, Upload } from 'lucide-react';
import AnamneseUploadWithPatients from '@/components/anamnese/AnamneseUploadWithPatients';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

const AnamneseCompartilhada: React.FC = () => {
  const { user } = useAuth();
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('upload');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Anamneses Compartilhadas
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de anamneses com upload de arquivos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-sapere-orange text-sapere-brown'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Anamneses Cadastradas
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-sapere-orange text-sapere-brown'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📤 Upload de Arquivos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Lista de Anamneses
              </h3>
              <p className="text-gray-500">
                Funcionalidade em desenvolvimento
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✅ <strong>Usuário logado:</strong> {user?.name} ({user?.role})
                </p>
              </div>
            </div>
          ) : (
            <AnamneseUploadWithPatients
              onFileUploaded={(file) => {
                success(`Arquivo ${file.name} enviado com sucesso para ${file.patientName}`);
                console.log('Arquivo enviado:', file);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnamneseCompartilhada;