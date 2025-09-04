// Sistema mock funcional para anamneses
import { subDays } from 'date-fns';
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

// Mock templates de anamnese
const MOCK_TEMPLATES: AnamneseTemplate[] = [
  {
    id: '1',
    nome: 'Anamnese Pediátrica Completa',
    descricao: 'Template completo para avaliação pediátrica inicial',
    categoria: 'pediatrica',
    especialidade: ['geral'],
    ativo: true,
    versao: 1,
    criadoPor: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    template: {
      sections: [
        {
          title: 'Dados Gerais',
          description: 'Informações básicas do paciente',
          fields: [
            {
              name: 'nome_completo',
              label: 'Nome Completo',
              type: 'text',
              required: true,
              placeholder: 'Nome completo da criança'
            },
            {
              name: 'data_nascimento',
              label: 'Data de Nascimento',
              type: 'date',
              required: true
            },
            {
              name: 'idade',
              label: 'Idade',
              type: 'text',
              required: true,
              placeholder: 'Ex: 5 anos e 3 meses'
            }
          ]
        },
        {
          title: 'Histórico Familiar',
          description: 'Informações sobre a família',
          fields: [
            {
              name: 'nome_mae',
              label: 'Nome da Mãe',
              type: 'text',
              required: true
            },
            {
              name: 'historico_familiar',
              label: 'Histórico Familiar Relevante',
              type: 'textarea',
              required: false,
              placeholder: 'Descreva histórico de condições neurológicas, psiquiátricas ou de desenvolvimento na família'
            }
          ]
        }
      ]
    }
  },
  {
    id: '2',
    nome: 'Avaliação Neuropsicológica',
    descricao: 'Template para avaliação neuropsicológica detalhada',
    categoria: 'neuropsicologica',
    especialidade: ['psicologia'],
    ativo: true,
    versao: 1,
    criadoPor: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    template: {
      sections: [
        {
          title: 'Queixa Principal',
          description: 'Motivo da consulta',
          fields: [
            {
              name: 'motivo_consulta',
              label: 'Motivo da Consulta',
              type: 'textarea',
              required: true,
              placeholder: 'Descreva o que levou à busca por avaliação neuropsicológica'
            }
          ]
        }
      ]
    }
  }
];

// Mock anamneses compartilhadas
const MOCK_ANAMNESES: AnamneseCompartilhada[] = [
  {
    id: '1',
    templateId: '1',
    titulo: 'Avaliação inicial - João Silva',
    pacienteNome: 'João Silva',
    pacienteIdade: 8,
    pacienteGenero: 'masculino',
    queixaPrincipal: 'Dificuldades de atenção e concentração em sala de aula. Professora relata que a criança se distrai facilmente.',
    dadosAnamnese: {
      nome_completo: 'João Silva',
      data_nascimento: '2015-03-15',
      idade: '8 anos',
      nome_mae: 'Maria Silva'
    },
    observacoes: 'Primeira consulta. Família muito colaborativa.',
    tags: ['tdah', 'atenção', 'escolar'],
    categoria: 'pediatrica',
    visibilidade: 'publica',
    patientId: '1',
    profissionalId: 'prof1',
    criadoPor: 'admin',
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    template: MOCK_TEMPLATES[0],
    criador: {
      id: 'admin',
      name: 'Dr. Admin'
    },
    profissional: {
      id: 'prof1',
      nome: 'Dra. Maria Santos',
      especialidade: 'Psicologia'
    },
    isFavorito: false,
    comentarios: []
  },
  {
    id: '2',
    templateId: '2',
    titulo: 'Avaliação neuropsicológica - Ana Costa',
    pacienteNome: 'Ana Costa',
    pacienteIdade: 12,
    pacienteGenero: 'feminino',
    queixaPrincipal: 'Dificuldades de aprendizagem, especialmente em matemática. Pais relatam que a criança tem boa memória mas demora para processar informações.',
    dadosAnamnese: {
      motivo_consulta: 'Dificuldades acadêmicas persistentes'
    },
    observacoes: 'Histórico de prematuridade.',
    tags: ['dificuldade-aprendizagem', 'matemática', 'processamento'],
    categoria: 'neuropsicologica',
    visibilidade: 'publica',
    patientId: '2',
    profissionalId: 'prof2',
    criadoPor: 'admin',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
    template: MOCK_TEMPLATES[1],
    criador: {
      id: 'admin',
      name: 'Dr. Admin'
    },
    profissional: {
      id: 'prof2',
      nome: 'Dr. João Mendes',
      especialidade: 'Neuropsicologia'
    },
    isFavorito: true,
    comentarios: []
  }
];

// Mock comentários
const MOCK_COMENTARIOS: AnamneseComentario[] = [
  {
    id: '1',
    anamneseId: '1',
    userId: 'prof1',
    comentario: 'Observação importante: criança apresentou sinais de ansiedade durante a entrevista.',
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    usuario: {
      id: 'prof1',
      name: 'Dra. Maria Santos'
    }
  }
];

// API Mock
export const mockAnamneseAPI = {
  templates: {
    async list(categoria?: AnamneseCategoria): Promise<AnamneseTemplate[]> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (categoria) {
        return MOCK_TEMPLATES.filter(t => t.categoria === categoria);
      }
      return MOCK_TEMPLATES;
    },

    async getById(id: string): Promise<AnamneseTemplate> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const template = MOCK_TEMPLATES.find(t => t.id === id);
      if (!template) throw new Error('Template não encontrado');
      
      return template;
    },

    async create(template: Omit<AnamneseTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnamneseTemplate> {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTemplate: AnamneseTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_TEMPLATES.push(newTemplate);
      return newTemplate;
    },

    async update(id: string, template: Partial<AnamneseTemplate>): Promise<AnamneseTemplate> {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = MOCK_TEMPLATES.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Template não encontrado');
      
      MOCK_TEMPLATES[index] = {
        ...MOCK_TEMPLATES[index],
        ...template,
        updatedAt: new Date().toISOString()
      };
      
      return MOCK_TEMPLATES[index];
    },

    async delete(id: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = MOCK_TEMPLATES.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Template não encontrado');
      
      MOCK_TEMPLATES.splice(index, 1);
    }
  },

  anamneses: {
    async search(filters: AnamneseFilters & { search?: string; page?: number; pageSize?: number } = {}): Promise<AnamneseSearchResult> {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let filtered = [...MOCK_ANAMNESES];
      
      // Filtrar por categoria
      if (filters.categoria) {
        filtered = filtered.filter(a => a.categoria === filters.categoria);
      }
      
      // Filtrar por visibilidade
      if (filters.visibilidade) {
        filtered = filtered.filter(a => a.visibilidade === filters.visibilidade);
      }
      
      // Filtrar por tags
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(a => 
          filters.tags!.some(tag => a.tags.includes(tag))
        );
      }
      
      // Busca por texto
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(a => 
          a.titulo.toLowerCase().includes(search) ||
          a.pacienteNome.toLowerCase().includes(search) ||
          a.queixaPrincipal.toLowerCase().includes(search) ||
          a.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }
      
      // Paginação
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        anamneses: filtered.slice(startIndex, endIndex),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
        hasMore: endIndex < filtered.length
      };
    },

    async getById(id: string): Promise<AnamneseCompartilhada> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const anamnese = MOCK_ANAMNESES.find(a => a.id === id);
      if (!anamnese) throw new Error('Anamnese não encontrada');
      
      return anamnese;
    },

    async create(data: CreateAnamneseRequest): Promise<AnamneseCompartilhada> {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const template = data.templateId ? MOCK_TEMPLATES.find(t => t.id === data.templateId) : undefined;
      
      const newAnamnese: AnamneseCompartilhada = {
        id: `anamnese-${Date.now()}`,
        templateId: data.templateId,
        titulo: data.formData.titulo,
        pacienteNome: data.formData.pacienteNome,
        pacienteIdade: data.formData.pacienteIdade,
        pacienteGenero: data.formData.pacienteGenero,
        queixaPrincipal: data.formData.queixaPrincipal,
        dadosAnamnese: data.formData.dadosAnamnese,
        observacoes: data.formData.observacoes,
        tags: data.formData.tags || [],
        categoria: data.formData.categoria,
        visibilidade: data.formData.visibilidade || 'publica',
        patientId: data.formData.patientId,
        profissionalId: 'default',
        criadoPor: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: template,
        criador: {
          id: 'admin',
          name: 'Usuário Atual'
        },
        isFavorito: false,
        comentarios: []
      };
      
      MOCK_ANAMNESES.push(newAnamnese);
      return newAnamnese;
    },

    async duplicate(id: string): Promise<AnamneseCompartilhada> {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const original = MOCK_ANAMNESES.find(a => a.id === id);
      if (!original) throw new Error('Anamnese não encontrada');
      
      const duplicated: AnamneseCompartilhada = {
        ...original,
        id: `anamnese-${Date.now()}`,
        titulo: `${original.titulo} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorito: false,
        comentarios: []
      };
      
      MOCK_ANAMNESES.push(duplicated);
      return duplicated;
    },

    async delete(id: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = MOCK_ANAMNESES.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Anamnese não encontrada');
      
      MOCK_ANAMNESES.splice(index, 1);
    },

    async getStats(): Promise<AnamneseStats> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        total: MOCK_ANAMNESES.length,
        porCategoria: MOCK_ANAMNESES.reduce((acc, anamnese) => {
          acc[anamnese.categoria] = (acc[anamnese.categoria] || 0) + 1;
          return acc;
        }, {} as Record<AnamneseCategoria, number>),
        porVisibilidade: MOCK_ANAMNESES.reduce((acc, anamnese) => {
          acc[anamnese.visibilidade] = (acc[anamnese.visibilidade] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        favoritosCount: MOCK_ANAMNESES.filter(a => a.isFavorito).length,
        recentesCount: MOCK_ANAMNESES.filter(a => {
          const created = new Date(a.createdAt);
          const weekAgo = subDays(new Date(), 7);
          return created >= weekAgo;
        }).length
      };
    }
  },

  favoritos: {
    async toggle(anamneseId: string, userId: string): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const anamnese = MOCK_ANAMNESES.find(a => a.id === anamneseId);
      if (!anamnese) throw new Error('Anamnese não encontrada');
      
      anamnese.isFavorito = !anamnese.isFavorito;
      return anamnese.isFavorito;
    }
  },

  comentarios: {
    async list(anamneseId: string): Promise<AnamneseComentario[]> {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return MOCK_COMENTARIOS.filter(c => c.anamneseId === anamneseId);
    },

    async create(anamneseId: string, userId: string, comentario: string): Promise<AnamneseComentario> {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newComentario: AnamneseComentario = {
        id: `comentario-${Date.now()}`,
        anamneseId,
        userId,
        comentario,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usuario: {
          id: userId,
          name: 'Usuário Atual'
        }
      };
      
      MOCK_COMENTARIOS.push(newComentario);
      return newComentario;
    }
  }
};

export default mockAnamneseAPI;