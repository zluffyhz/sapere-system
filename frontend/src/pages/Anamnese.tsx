import React from 'react';
import { FileText, Plus, Search } from 'lucide-react';

export default function Anamnese() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sapere-orange mb-2">Anamnese</h1>
        <p className="text-gray-600">Gestão de documentos de anamnese dos pacientes</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Documentos de Anamnese</h2>
          <button className="bg-sapere-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2">
            <Plus size={16} />
            Nova Anamnese
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar anamneses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="text-center py-12">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500 mb-4">Comece criando sua primeira anamnese</p>
          <button className="text-sapere-orange hover:text-orange-600 font-medium">
            Criar Nova Anamnese
          </button>
        </div>
      </div>
    </div>
  );
}