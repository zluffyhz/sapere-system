// Serviço para gerenciar templates de anamnese
import type { AnamneseTemplate } from '@/types/anamnese';
import { anamneseGeralTemplate } from '@/templates/anamnese-geral-template';

// Lista de templates disponíveis
export const availableTemplates: AnamneseTemplate[] = [
  anamneseGeralTemplate
];

// Buscar template por ID
export const getTemplateById = (templateId: string): AnamneseTemplate | undefined => {
  return availableTemplates.find(template => template.id === templateId);
};

// Buscar templates por categoria
export const getTemplatesByCategory = (categoria: string): AnamneseTemplate[] => {
  return availableTemplates.filter(template => 
    template.categoria === categoria || template.categoria === 'multiprofissional'
  );
};

// Buscar templates por especialidade
export const getTemplatesBySpecialty = (especialidade: string): AnamneseTemplate[] => {
  return availableTemplates.filter(template => 
    template.especialidade.includes(especialidade) || 
    template.categoria === 'multiprofissional'
  );
};

// Buscar todos os templates ativos
export const getActiveTemplates = (): AnamneseTemplate[] => {
  return availableTemplates.filter(template => template.ativo);
};

// Validar dados do template
export const validateTemplateData = (
  templateId: string, 
  formData: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const template = getTemplateById(templateId);
  if (!template) {
    return { valid: false, errors: ['Template não encontrado'] };
  }

  const errors: string[] = [];

  // Validar campos obrigatórios
  template.template.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors.push(`Campo obrigatório não preenchido: ${field.label}`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
};

export default {
  availableTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesBySpecialty,
  getActiveTemplates,
  validateTemplateData
};