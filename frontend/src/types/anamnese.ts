// Tipos para o sistema de anamnese compartilhado

export type AnamneseCategoria = 'pediatrica' | 'adulto' | 'neuropsicologica' | 'fonoaudiologica' | 'psicologica' | 'geral' | 'multiprofissional';
export type AnamneseVisibilidade = 'publica';
export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'file';

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface AnamneseTemplate {
  id: string;
  nome: string;
  descricao?: string;
  categoria: AnamneseCategoria;
  especialidade: string[];
  template: {
    sections: FormSection[];
  };
  ativo: boolean;
  versao: number;
  criadoPor: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnamneseCompartilhada {
  id: string;
  templateId?: string;
  titulo: string;
  pacienteNome: string;
  pacienteIdade?: number;
  pacienteGenero?: string;
  queixaPrincipal: string;
  dadosAnamnese: Record<string, any>; // Dados preenchidos do formulário
  observacoes?: string;
  tags: string[];
  categoria: AnamneseCategoria;
  visibilidade: AnamneseVisibilidade;
  patientId?: string;
  profissionalId: string;
  criadoPor: string;
  createdAt: string;
  updatedAt: string;
  // Relacionamentos
  template?: AnamneseTemplate;
  criador?: {
    id: string;
    name: string;
  };
  profissional?: {
    id: string;
    nome: string;
    especialidade: string;
  };
  isFavorito?: boolean;
  comentarios?: AnamneseComentario[];
}

export interface AnamneseFavorito {
  id: string;
  userId: string;
  anamneseId: string;
  createdAt: string;
}

export interface AnamneseComentario {
  id: string;
  anamneseId: string;
  userId: string;
  comentario: string;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: string;
    name: string;
  };
}

export interface AnamneseFilters {
  categoria?: AnamneseCategoria;
  visibilidade?: AnamneseVisibilidade;
  tags?: string[];
  search?: string;
  profissionalId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AnamneseFormData {
  titulo: string;
  pacienteNome: string;
  pacienteIdade?: number;
  pacienteGenero?: string;
  queixaPrincipal: string;
  dadosAnamnese: Record<string, any>;
  observacoes?: string;
  tags: string[];
  categoria: AnamneseCategoria;
  visibilidade: AnamneseVisibilidade;
  patientId?: string;
}

export interface AnamneseStats {
  total: number;
  porCategoria: Record<AnamneseCategoria, number>;
  porVisibilidade: Record<AnamneseVisibilidade, number>;
  recentesCount: number;
  favoritosCount: number;
}

export interface CreateAnamneseRequest {
  templateId?: string;
  formData: AnamneseFormData;
}

export interface UpdateAnamneseRequest {
  id: string;
  formData: Partial<AnamneseFormData>;
}

export interface AnamneseSearchResult {
  anamneses: AnamneseCompartilhada[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages?: number; // Compatibilidade temporária
}