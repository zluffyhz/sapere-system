// Página para criar/editar anamneses usando templates dinâmicos
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Edit3 } from 'lucide-react';
import DynamicForm from '@/components/anamnese/DynamicForm';
import { getTemplateById } from '@/services/anamneseTemplates';
import type { AnamneseTemplate, CreateAnamneseRequest } from '@/types/anamnese';

const AnamneseEditor: React.FC = () => {
  const { templateId, anamneseId } = useParams<{ templateId?: string; anamneseId?: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<AnamneseTemplate | null>(null);
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [pageTitle, setPageTitle] = useState('Nova Anamnese');

  useEffect(() => {
    if (templateId) {
      const foundTemplate = getTemplateById(templateId);
      if (foundTemplate) {
        setTemplate(foundTemplate);
        setPageTitle(`Nova Anamnese - ${foundTemplate.nome}`);
      } else {
        console.error('Template não encontrado');
        navigate('/anamnese');
      }
    }

    // Se há um ID de anamnese, carrega os dados existentes
    if (anamneseId) {
      loadAnamneseData(anamneseId);
    }
  }, [templateId, anamneseId, navigate]);

  const loadAnamneseData = async (id: string) => {
    try {
      setLoading(true);
      // TODO: Implementar carregamento de dados da API
      // const response = await anamneseAPI.getById(id);
      // setInitialData(response.dadosAnamnese);
      setPageTitle('Editar Anamnese');
    } catch (error) {
      console.error('Erro ao carregar anamnese:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!template) return;

    try {
      setLoading(true);
      
      // Preparar dados para envio
      const anamneseData = {
        titulo: formData.nome ? `Anamnese - ${formData.nome}` : 'Anamnese sem título',
        pacienteNome: formData.nome || '',
        pacienteIdade: formData.idade,
        pacienteGenero: formData.sexo === 'Masculino' ? 'M' : formData.sexo === 'Feminino' ? 'F' : '',
        queixaPrincipal: formData.queixa || '',
        dadosAnamnese: formData,
        observacoes: formData.observacoesComplementares || '',
        tags: [],
        categoria: template.categoria,
        visibilidade: 'publica' as const
      };

      const requestData: CreateAnamneseRequest = {
        templateId: template.id,
        formData: anamneseData
      };

      // TODO: Implementar salvamento na API
      // await anamneseAPI.create(requestData);
      
      console.log('Dados da anamnese salvos:', requestData);
      
      // Redirecionar para a lista de anamneses
      navigate('/anamnese', {
        state: { message: 'Anamnese salva com sucesso!' }
      });
      
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      // TODO: Mostrar notificação de erro
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/anamnese');
  };

  const toggleReadOnly = () => {
    setReadOnly(!readOnly);
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/anamnese')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Centro de Desenvolvimento Sapere - Template: {template.nome}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {anamneseId && (
                <button
                  onClick={toggleReadOnly}
                  className="btn-secondary flex items-center gap-2"
                >
                  {readOnly ? (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </>
                  )}
                </button>
              )}
              
              <div className="flex items-center gap-2 px-3 py-2 bg-sapere-yellow/10 text-sapere-brown rounded-lg text-sm">
                <Save className="h-4 w-4" />
                Salvamento automático ativo
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <DynamicForm
              template={template}
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnamneseEditor;