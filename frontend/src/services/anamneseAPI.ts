// API service para sistema de anamnese compartilhado

import api from './api';
import type {
  AnamneseTemplate,
  AnamneseCompartilhada,
  AnamneseComentario,
  AnamneseFilters,
  CreateAnamneseRequest,
  UpdateAnamneseRequest,
  AnamneseSearchResult,
  AnamneseStats,
  AnamneseCategoria
} from '@/types/anamnese';

export const anamneseAPI = {
  // Templates
  templates: {
    // Listar templates
    list: async (categoria?: AnamneseCategoria): Promise<AnamneseTemplate[]> => {
      const response = await api.get('/anamnese/templates', {
        params: { categoria }
      });
      return response.data;
    },

    // Buscar template por ID
    getById: async (id: string): Promise<AnamneseTemplate> => {
      const response = await api.get(`/anamnese/templates/${id}`);
      return response.data;
    },

    // Criar template (admin apenas)
    create: async (template: Omit<AnamneseTemplate, 'id' | 'criadoPor' | 'createdAt' | 'updatedAt'>): Promise<AnamneseTemplate> => {
      const response = await api.post('/anamnese/templates', template);
      return response.data;
    },

    // Atualizar template (admin apenas)
    update: async (id: string, template: Partial<AnamneseTemplate>): Promise<AnamneseTemplate> => {
      const response = await api.put(`/anamnese/templates/${id}`, template);
      return response.data;
    },

    // Excluir template (admin apenas)
    delete: async (id: string): Promise<void> => {
      await api.delete(`/anamnese/templates/${id}`);
    }
  },

  // Anamneses Compartilhadas
  anamneses: {
    // Buscar anamneses com filtros
    search: async (
      filters: AnamneseFilters & { page?: number; pageSize?: number }
    ): Promise<AnamneseSearchResult> => {
      const response = await api.get('/anamnese/shared', {
        params: {
          ...filters,
          page: filters.page || 1,
          pageSize: filters.pageSize || 20
        }
      });
      return response.data;
    },

    // Buscar por ID
    getById: async (id: string): Promise<AnamneseCompartilhada> => {
      const response = await api.get(`/anamnese/shared/${id}`);
      return response.data;
    },

    // Criar nova anamnese
    create: async (request: CreateAnamneseRequest): Promise<AnamneseCompartilhada> => {
      const response = await api.post('/anamnese/shared', request);
      return response.data;
    },

    // Atualizar anamnese
    update: async (request: UpdateAnamneseRequest): Promise<AnamneseCompartilhada> => {
      const response = await api.put(`/anamnese/shared/${request.id}`, request.formData);
      return response.data;
    },

    // Excluir anamnese
    delete: async (id: string): Promise<void> => {
      await api.delete(`/anamnese/shared/${id}`);
    },

    // Duplicar anamnese
    duplicate: async (id: string): Promise<AnamneseCompartilhada> => {
      const response = await api.post(`/anamnese/shared/${id}/duplicate`);
      return response.data;
    },

    // Estatísticas
    getStats: async (): Promise<AnamneseStats> => {
      const response = await api.get('/anamnese/shared/stats');
      return response.data;
    }
  },

  // Favoritos
  favoritos: {
    // Listar favoritos do usuário
    list: async (): Promise<AnamneseCompartilhada[]> => {
      const response = await api.get('/anamnese/favoritos');
      return response.data;
    },

    // Adicionar aos favoritos
    add: async (anamneseId: string): Promise<void> => {
      await api.post(`/anamnese/favoritos/${anamneseId}`);
    },

    // Remover dos favoritos
    remove: async (anamneseId: string): Promise<void> => {
      await api.delete(`/anamnese/favoritos/${anamneseId}`);
    },

    // Verificar se é favorito
    check: async (anamneseId: string): Promise<boolean> => {
      const response = await api.get(`/anamnese/favoritos/${anamneseId}/check`);
      return response.data.isFavorito;
    }
  },

  // Comentários
  comentarios: {
    // Listar comentários de uma anamnese
    list: async (anamneseId: string): Promise<AnamneseComentario[]> => {
      const response = await api.get(`/anamnese/shared/${anamneseId}/comentarios`);
      return response.data;
    },

    // Adicionar comentário
    create: async (anamneseId: string, comentario: string): Promise<AnamneseComentario> => {
      const response = await api.post(`/anamnese/shared/${anamneseId}/comentarios`, {
        comentario
      });
      return response.data;
    },

    // Atualizar comentário
    update: async (comentarioId: string, comentario: string): Promise<AnamneseComentario> => {
      const response = await api.put(`/anamnese/comentarios/${comentarioId}`, {
        comentario
      });
      return response.data;
    },

    // Excluir comentário
    delete: async (comentarioId: string): Promise<void> => {
      await api.delete(`/anamnese/comentarios/${comentarioId}`);
    }
  },

  // Utilitários
  utils: {
    // Buscar tags disponíveis
    getTags: async (): Promise<string[]> => {
      const response = await api.get('/anamnese/tags');
      return response.data;
    },

    // Exportar anamnese para PDF
    exportPDF: async (id: string): Promise<Blob> => {
      const response = await api.get(`/anamnese/shared/${id}/export/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    },

    // Exportar múltiplas anamneses
    exportMultiple: async (ids: string[], format: 'pdf' | 'excel'): Promise<Blob> => {
      const response = await api.post('/anamnese/export/multiple', {
        ids,
        format
      }, {
        responseType: 'blob'
      });
      return response.data;
    },

    // Validar dados da anamnese
    validate: async (dadosAnamnese: Record<string, any>, templateId?: string): Promise<{
      valid: boolean;
      errors: Record<string, string[]>;
    }> => {
      const response = await api.post('/anamnese/validate', {
        dadosAnamnese,
        templateId
      });
      return response.data;
    }
  }
};

export default anamneseAPI;