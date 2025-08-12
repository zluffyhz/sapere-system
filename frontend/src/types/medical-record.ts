export interface Patient {
  id: string;
  name: string;
  birth_date: string;
  cpf: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: PatientAddress;
  responsible: ResponsiblePerson;
  diagnosis: Diagnosis[];
  current_therapists: string[]; // IDs dos terapeutas
  created_at: string;
  updated_at: string;
  photo_url?: string;
  emergency_contact: EmergencyContact;
  insurance?: Insurance;
  special_needs: string[];
  allergies: string[];
  medications: Medication[];
  status: 'active' | 'inactive' | 'discharged';
}

export interface PatientAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface ResponsiblePerson {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  cpf: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Insurance {
  company: string;
  plan: string;
  number: string;
  validity: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  prescribing_doctor: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface Diagnosis {
  code: string; // CID-10
  description: string;
  date: string;
  doctor: string;
  type: 'primary' | 'secondary';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  session_date: string;
  therapist_id: string;
  therapist_name: string;
  specialty: string;
  session_type: string;
  template_id?: string;
  duration_minutes: number;
  
  // Conteúdo principal
  content: RecordContent;
  
  // Anexos
  attachments: RecordAttachment[];
  
  // Escalas e avaliações
  assessments: Assessment[];
  
  // Metas e objetivos
  goals: TherapeuticGoal[];
  
  // Assinatura digital
  digital_signature: DigitalSignature;
  
  // Compartilhamento
  shared_with: string[]; // IDs de pessoas autorizadas
  
  // Metadados
  created_at: string;
  updated_at: string;
  is_template: boolean;
  tags: string[];
  status: 'draft' | 'completed' | 'reviewed' | 'archived';
}

export interface RecordContent {
  // Texto livre formatado
  evolution: string;
  
  // Campos estruturados por especialidade
  structured_data: {
    [key: string]: any;
  };
  
  // Observações comportamentais (importante para neurodivergência)
  behavioral_observations: BehavioralObservation[];
  
  // Marcos terapêuticos alcançados
  milestones_achieved: Milestone[];
  
  // Plano para próxima sessão
  next_session_plan: string;
  
  // Orientações para família
  family_guidance: string;
}

export interface BehavioralObservation {
  category: 'communication' | 'social' | 'sensory' | 'motor' | 'cognitive' | 'emotional' | 'adaptive';
  description: string;
  intensity: 1 | 2 | 3 | 4 | 5; // Escala de intensidade
  context: string;
  duration?: string;
  intervention_used?: string;
  result?: string;
}

export interface Milestone {
  id: string;
  category: string;
  description: string;
  date_achieved: string;
  age_at_achievement: string;
  notes?: string;
  evidence_attachments?: string[]; // IDs de anexos que comprovam
}

export interface Assessment {
  id: string;
  name: string;
  type: 'scale' | 'questionnaire' | 'observation' | 'test';
  date: string;
  scores: {
    [domain: string]: {
      raw_score: number;
      percentile?: number;
      standard_score?: number;
      classification: string;
      notes?: string;
    };
  };
  total_score?: number;
  interpretation: string;
  recommendations: string[];
  next_assessment_date?: string;
}

export interface TherapeuticGoal {
  id: string;
  category: string;
  description: string;
  target_date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'achieved' | 'modified' | 'discontinued';
  progress_percentage: number;
  strategies: string[];
  measurement_criteria: string;
  family_involvement: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecordAttachment {
  id: string;
  filename: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  description?: string;
  category: 'assessment' | 'progress' | 'activity' | 'homework' | 'report' | 'communication';
  uploaded_by: string;
  uploaded_at: string;
  is_public: boolean; // Se pode ser compartilhado com responsáveis
}

export interface DigitalSignature {
  therapist_id: string;
  therapist_name: string;
  signature_data: string; // Base64 da assinatura
  timestamp: string;
  ip_address?: string;
  device_info?: string;
  verification_hash: string;
}

// Templates específicos para neurodivergência
export interface RecordTemplate {
  id: string;
  name: string;
  category: 'TEA' | 'TDAH' | 'DI' | 'TEL' | 'TA' | 'Geral'; // TEA=Autismo, TDAH, DI=Deficiência Intelectual, TEL=Transtorno Específico de Linguagem, TA=Transtorno de Aprendizagem
  specialty: string;
  fields: TemplateField[];
  behavioral_categories: string[];
  assessment_scales: string[];
  common_goals: string[];
  created_by: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'scale' | 'checkbox' | 'date' | 'time';
  required: boolean;
  options?: string[];
  min_value?: number;
  max_value?: number;
  placeholder?: string;
  help_text?: string;
  default_value?: any;
  order: number;
}

// Escalas de desenvolvimento específicas
export interface DevelopmentScale {
  id: string;
  name: string;
  category: 'TEA' | 'TDAH' | 'Development' | 'Communication' | 'Social' | 'Motor' | 'Cognitive';
  age_range: string;
  domains: ScaleDomain[];
  scoring_system: string;
  interpretation_guide: string;
  created_at: string;
}

export interface ScaleDomain {
  id: string;
  name: string;
  description: string;
  items: ScaleItem[];
  max_score: number;
  interpretation_ranges: {
    range: string;
    score_min: number;
    score_max: number;
    classification: string;
    description: string;
  }[];
}

export interface ScaleItem {
  id: string;
  description: string;
  score_options: {
    value: number;
    label: string;
    description?: string;
  }[];
  examples?: string[];
}

// Relatórios e compartilhamento
export interface MedicalReport {
  id: string;
  patient_id: string;
  type: 'evolution' | 'assessment' | 'discharge' | 'progress' | 'referral';
  title: string;
  period_start: string;
  period_end: string;
  records_included: string[];
  content: string;
  generated_by: string;
  generated_at: string;
  shared_with: SharePermission[];
  template_used?: string;
  attachments: string[];
}

export interface SharePermission {
  user_id: string;
  user_name: string;
  user_type: 'responsible' | 'therapist' | 'doctor' | 'school' | 'other';
  permissions: ('view' | 'download' | 'print' | 'comment')[];
  expires_at?: string;
  granted_by: string;
  granted_at: string;
}

// Dados específicos para neurodivergência - Templates pré-definidos
export const NEURODIVERGENCE_TEMPLATES: RecordTemplate[] = [
  {
    id: 'tea-aba',
    name: 'TEA - Análise do Comportamento (ABA)',
    category: 'TEA',
    specialty: 'ABA',
    fields: [
      { id: 'target_behaviors', name: 'target_behaviors', label: 'Comportamentos Alvo', type: 'textarea', required: true, order: 1, help_text: 'Comportamentos específicos trabalhados na sessão' },
      { id: 'prompts_used', name: 'prompts_used', label: 'Prompts Utilizados', type: 'multiselect', required: true, order: 2, options: ['Físico', 'Gestual', 'Verbal', 'Visual', 'Posicional'] },
      { id: 'reinforcement', name: 'reinforcement', label: 'Reforçadores', type: 'textarea', required: true, order: 3 },
      { id: 'data_collection', name: 'data_collection', label: 'Coleta de Dados', type: 'textarea', required: true, order: 4 },
      { id: 'generalization', name: 'generalization', label: 'Generalização', type: 'textarea', required: false, order: 5 },
      { id: 'social_skills', name: 'social_skills', label: 'Habilidades Sociais', type: 'textarea', required: false, order: 6 },
      { id: 'communication_goals', name: 'communication_goals', label: 'Metas de Comunicação', type: 'textarea', required: false, order: 7 }
    ],
    behavioral_categories: ['Comunicação', 'Interação Social', 'Comportamento Repetitivo', 'Adaptação', 'Autorregulação'],
    assessment_scales: ['CARS-2', 'ABC', 'VB-MAPP', 'ABLLS-R'],
    common_goals: [
      'Aumentar tempo de atenção compartilhada',
      'Desenvolver comunicação funcional',
      'Reduzir comportamentos disruptivos',
      'Melhorar flexibilidade cognitiva',
      'Desenvolver habilidades de brincar'
    ],
    created_by: 'system',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tea-to',
    name: 'TEA - Terapia Ocupacional',
    category: 'TEA',
    specialty: 'Terapia Ocupacional',
    fields: [
      { id: 'sensory_profile', name: 'sensory_profile', label: 'Perfil Sensorial', type: 'textarea', required: true, order: 1 },
      { id: 'sensory_activities', name: 'sensory_activities', label: 'Atividades Sensoriais', type: 'textarea', required: true, order: 2 },
      { id: 'motor_skills', name: 'motor_skills', label: 'Habilidades Motoras', type: 'textarea', required: true, order: 3 },
      { id: 'daily_activities', name: 'daily_activities', label: 'Atividades de Vida Diária', type: 'textarea', required: true, order: 4 },
      { id: 'environmental_adaptations', name: 'environmental_adaptations', label: 'Adaptações Ambientais', type: 'textarea', required: false, order: 5 },
      { id: 'assistive_technology', name: 'assistive_technology', label: 'Tecnologia Assistiva', type: 'textarea', required: false, order: 6 }
    ],
    behavioral_categories: ['Processamento Sensorial', 'Coordenação Motora', 'AVDs', 'Regulação Emocional'],
    assessment_scales: ['SPM-2', 'SIPT', 'BOT-2', 'WeeFIM'],
    common_goals: [
      'Melhorar processamento sensorial',
      'Desenvolver coordenação motora fina',
      'Aumentar independência em AVDs',
      'Reduzir comportamentos de autorregulação'
    ],
    created_by: 'system',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEVELOPMENT_SCALES: DevelopmentScale[] = [
  {
    id: 'cars-2',
    name: 'CARS-2 - Childhood Autism Rating Scale',
    category: 'TEA',
    age_range: '2 anos em diante',
    domains: [
      {
        id: 'social_interaction',
        name: 'Interação Social',
        description: 'Capacidade de interagir socialmente',
        max_score: 4,
        items: [
          {
            id: 'eye_contact',
            description: 'Contato visual',
            score_options: [
              { value: 1, label: 'Normal', description: 'Contato visual apropriado para a idade' },
              { value: 2, label: 'Leve', description: 'Contato visual reduzido ocasionalmente' },
              { value: 3, label: 'Moderado', description: 'Contato visual claramente anormal' },
              { value: 4, label: 'Severo', description: 'Evita contato visual completamente' }
            ]
          }
        ],
        interpretation_ranges: [
          { range: 'Normal', score_min: 15, score_max: 29.5, classification: 'Sem autismo', description: 'Comportamentos dentro do esperado' },
          { range: 'Leve-Moderado', score_min: 30, score_max: 36.5, classification: 'Autismo leve-moderado', description: 'Alguns comportamentos autísticos' },
          { range: 'Severo', score_min: 37, score_max: 60, classification: 'Autismo severo', description: 'Comportamentos autísticos significativos' }
        ]
      }
    ],
    scoring_system: 'Escala de 1 a 4 pontos por item',
    interpretation_guide: 'Escores mais altos indicam maior severidade dos sintomas autísticos',
    created_at: new Date().toISOString()
  }
];