// Editor simples de anamnese para o fluxo de cadastro
import React, { useState } from 'react';
import { 
  User, 
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Patient {
  id: string;
  name: string;
}

interface SimpleAnamneseEditorProps {
  patient: Patient;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

const SimpleAnamneseEditor: React.FC<SimpleAnamneseEditorProps> = ({
  patient,
  onSave,
  onClose
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    queixaPrincipal: '',
    historicoFamiliar: '',
    historicoPessoal: '',
    desenvolvimentoNeuropsicomotor: '',
    condicoesGeraisSaude: '',
    medicamentosUso: '',
    observacoesGerais: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const anamneseData = {
        templateId: 'anamnese-geral',
        pacienteId: patient.id,
        pacienteNome: patient.name,
        profissionalId: user?.id || '',
        categoria: 'multiprofissional',
        visibilidade: 'profissional',
        respostas: formData,
        tags: ['multiprofissional', 'novo-paciente'],
        observacoes: `Anamnese criada automaticamente após cadastro do paciente em ${new Date().toLocaleDateString('pt-BR')}`
      };
      
      await onSave(anamneseData);
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-sapere-yellow">
            <div>
              <h2 className="text-xl font-bold text-sapere-brown flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Anamnese Geral Multiprofissional
              </h2>
              <p className="text-sm text-sapere-brown/80 flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                Paciente: {patient.name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-sapere-brown hover:text-sapere-orange text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              {/* Queixa Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Queixa Principal *
                </label>
                <textarea
                  value={formData.queixaPrincipal}
                  onChange={(e) => handleChange('queixaPrincipal', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Descreva o motivo principal da consulta..."
                  required
                />
              </div>

              {/* Histórico Familiar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Histórico Familiar
                </label>
                <textarea
                  value={formData.historicoFamiliar}
                  onChange={(e) => handleChange('historicoFamiliar', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Histórico médico familiar relevante..."
                />
              </div>

              {/* Histórico Pessoal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Histórico Pessoal
                </label>
                <textarea
                  value={formData.historicoPessoal}
                  onChange={(e) => handleChange('historicoPessoal', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Histórico médico pessoal..."
                />
              </div>

              {/* Desenvolvimento Neuropsicomotor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desenvolvimento Neuropsicomotor
                </label>
                <textarea
                  value={formData.desenvolvimentoNeuropsicomotor}
                  onChange={(e) => handleChange('desenvolvimentoNeuropsicomotor', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Marcos do desenvolvimento..."
                />
              </div>

              {/* Condições Gerais de Saúde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condições Gerais de Saúde
                </label>
                <textarea
                  value={formData.condicoesGeraisSaude}
                  onChange={(e) => handleChange('condicoesGeraisSaude', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Estado geral de saúde, alergias, etc..."
                />
              </div>

              {/* Medicamentos em Uso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos em Uso
                </label>
                <textarea
                  value={formData.medicamentosUso}
                  onChange={(e) => handleChange('medicamentosUso', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Lista de medicamentos atuais..."
                />
              </div>

              {/* Observações Gerais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Gerais
                </label>
                <textarea
                  value={formData.observacoesGerais}
                  onChange={(e) => handleChange('observacoesGerais', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Observações adicionais importantes..."
                />
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Preencha pelo menos a queixa principal para salvar
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={loading || !formData.queixaPrincipal.trim()}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar Anamnese
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnamneseEditor;