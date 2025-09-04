// Sistema mock funcional para gerenciamento de pacientes
import { subDays, subYears } from 'date-fns';
import type { Patient } from '@/types/appointments';

export interface PatientDetails extends Patient {
  cpf?: string;
  rg?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  };
  dadosMedicos?: {
    alergias?: string[];
    medicamentos?: string[];
    condicoesMedicas?: string[];
    observacoes?: string;
  };
  historico?: {
    dataInicio: string;
    status: 'ativo' | 'inativo' | 'alta';
    profissionalResponsavel?: string;
    motivoInicio?: string;
  };
}

export interface PatientFilters {
  search?: string;
  status?: 'ativo' | 'inativo' | 'alta';
  profissionalId?: string;
  idadeMin?: number;
  idadeMax?: number;
  convenio?: string;
}

export interface PatientStats {
  total: number;
  ativos: number;
  inativos: number;
  alta: number;
  novosMes: number;
  porConvenio: Record<string, number>;
  porIdade: {
    '0-5': number;
    '6-12': number;
    '13-17': number;
    '18+': number;
  };
}

// Mock data
let MOCK_PATIENTS: PatientDetails[] = [
  {
    id: '1',
    nome: 'Ana Beatriz Santos',
    nascimento: subYears(new Date(), 7).toISOString(),
    cpf: '123.456.789-01',
    rg: '12.345.678-9',
    contatos: {
      email: 'mae.ana@email.com',
      telefone: '(11) 99999-1234'
    },
    responsavel: {
      nome: 'Maria Santos',
      cpf: '987.654.321-01',
      telefone: '(11) 99999-1234'
    },
    convenio: {
      nome: 'Particular',
      numero: undefined
    },
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    dadosMedicos: {
      alergias: ['Dipirona'],
      medicamentos: [],
      condicoesMedicas: ['TEA', 'TDAH'],
      observacoes: 'Diagnóstico recente de TEA. Família muito colaborativa.'
    },
    historico: {
      dataInicio: subDays(new Date(), 90).toISOString(),
      status: 'ativo',
      profissionalResponsavel: 'Dra. Maria Silva',
      motivoInicio: 'Avaliação para suspeita de TEA'
    },
    observacoes: 'Criança colaborativa, gosta de atividades lúdicas.',
    tags: ['TEA', 'primeira consulta', 'criança']
  },
  {
    id: '2',
    nome: 'Pedro Henrique Lima',
    nascimento: subYears(new Date(), 10).toISOString(),
    cpf: '234.567.890-12',
    rg: '23.456.789-0',
    contatos: {
      email: 'pai.pedro@email.com',
      telefone: '(11) 88888-5678'
    },
    responsavel: {
      nome: 'João Lima',
      cpf: '876.543.210-98',
      telefone: '(11) 88888-5678'
    },
    convenio: {
      nome: 'Unimed',
      numero: '123456789'
    },
    endereco: {
      cep: '04567-890',
      logradouro: 'Av. Paulista',
      numero: '456',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    dadosMedicos: {
      alergias: [],
      medicamentos: ['Ritalina 10mg'],
      condicoesMedicas: ['TDAH'],
      observacoes: 'TDAH diagnosticado. Boa resposta ao tratamento medicamentoso.'
    },
    historico: {
      dataInicio: subDays(new Date(), 180).toISOString(),
      status: 'ativo',
      profissionalResponsavel: 'Dra. Maria Silva',
      motivoInicio: 'Dificuldades de atenção na escola'
    },
    observacoes: 'Progresso significativo nas últimas sessões.',
    tags: ['TDAH', 'escolar', 'medicamento']
  },
  {
    id: '3',
    nome: 'Sofia Oliveira',
    nascimento: subYears(new Date(), 5).toISOString(),
    cpf: '345.678.901-23',
    rg: '34.567.890-1',
    contatos: {
      email: 'mae.sofia@email.com',
      telefone: '(11) 77777-9012'
    },
    responsavel: {
      nome: 'Carmen Oliveira',
      cpf: '765.432.109-87',
      telefone: '(11) 77777-9012'
    },
    convenio: {
      nome: 'Particular',
      numero: undefined
    },
    endereco: {
      cep: '08901-234',
      logradouro: 'Rua do Sol',
      numero: '789',
      bairro: 'Vila Nova',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    dadosMedicos: {
      alergias: ['Amendoim'],
      medicamentos: [],
      condicoesMedicas: ['Atraso de linguagem'],
      observacoes: 'Desenvolvimento de linguagem abaixo do esperado para a idade.'
    },
    historico: {
      dataInicio: subDays(new Date(), 60).toISOString(),
      status: 'ativo',
      profissionalResponsavel: 'Dr. João Santos',
      motivoInicio: 'Atraso no desenvolvimento da fala'
    },
    observacoes: 'Criança tímida, mas com evolução positiva.',
    tags: ['fonoaudiologia', 'linguagem', 'desenvolvimento']
  },
  {
    id: '4',
    nome: 'Lucas Fernandes',
    nascimento: subYears(new Date(), 15).toISOString(),
    cpf: '456.789.012-34',
    rg: '45.678.901-2',
    contatos: {
      email: 'lucas.fernandes@email.com',
      telefone: '(11) 66666-3456'
    },
    responsavel: {
      nome: 'Patricia Fernandes',
      cpf: '654.321.098-76',
      telefone: '(11) 66666-3456'
    },
    convenio: {
      nome: 'Bradesco Saúde',
      numero: '987654321'
    },
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua dos Adolescentes',
      numero: '321',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    dadosMedicos: {
      alergias: [],
      medicamentos: [],
      condicoesMedicas: ['Ansiedade', 'Depressão leve'],
      observacoes: 'Adolescente com questões emocionais relacionadas à escola.'
    },
    historico: {
      dataInicio: subDays(new Date(), 120).toISOString(),
      status: 'ativo',
      profissionalResponsavel: 'Dra. Maria Silva',
      motivoInicio: 'Questões emocionais e ansiedade escolar'
    },
    observacoes: 'Bom vínculo terapêutico estabelecido.',
    tags: ['adolescente', 'ansiedade', 'escola']
  },
  {
    id: '5',
    nome: 'Mariana Costa',
    nascimento: subYears(new Date(), 8).toISOString(),
    cpf: '567.890.123-45',
    rg: '56.789.012-3',
    contatos: {
      email: 'mae.mariana@email.com',
      telefone: '(11) 55555-7890'
    },
    responsavel: {
      nome: 'Ana Costa',
      cpf: '543.210.987-65',
      telefone: '(11) 55555-7890'
    },
    convenio: {
      nome: 'Particular',
      numero: undefined
    },
    endereco: {
      cep: '05678-901',
      logradouro: 'Rua da Paz',
      numero: '654',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    dadosMedicos: {
      alergias: [],
      medicamentos: [],
      condicoesMedicas: ['Dislexia'],
      observacoes: 'Dificuldades específicas de aprendizagem - leitura e escrita.'
    },
    historico: {
      dataInicio: subDays(new Date(), 200).toISOString(),
      status: 'alta',
      profissionalResponsavel: 'Dr. João Santos',
      motivoInicio: 'Dificuldades de aprendizagem'
    },
    observacoes: 'Alta terapêutica alcançada com sucesso.',
    tags: ['dislexia', 'aprendizagem', 'alta']
  }
];

// Simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockPatientsAPI = {
  // Listar pacientes com filtros
  list: async (filters: PatientFilters = {}): Promise<PatientDetails[]> => {
    await delay(500);
    
    let filtered = [...MOCK_PATIENTS];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(search) ||
        p.cpf?.includes(search) ||
        p.responsavel.nome?.toLowerCase().includes(search) ||
        p.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(p => p.historico?.status === filters.status);
    }
    
    if (filters.convenio) {
      filtered = filtered.filter(p => 
        p.convenio?.nome?.toLowerCase().includes(filters.convenio!.toLowerCase())
      );
    }
    
    return filtered;
  },

  // Buscar paciente por ID
  getById: async (id: string): Promise<PatientDetails> => {
    await delay(300);
    
    const patient = MOCK_PATIENTS.find(p => p.id === id);
    if (!patient) {
      throw new Error('Paciente não encontrado');
    }
    
    return patient;
  },

  // Criar novo paciente
  create: async (patientData: Partial<PatientDetails>): Promise<PatientDetails> => {
    await delay(800);
    
    const newPatient: PatientDetails = {
      id: Math.random().toString(36).substr(2, 9),
      nome: patientData.nome || '',
      nascimento: patientData.nascimento,
      cpf: patientData.cpf,
      rg: patientData.rg,
      contatos: patientData.contatos || { email: '', telefone: '' },
      responsavel: patientData.responsavel || { nome: '', cpf: '', telefone: '' },
      convenio: patientData.convenio,
      endereco: patientData.endereco,
      dadosMedicos: patientData.dadosMedicos,
      historico: {
        dataInicio: new Date().toISOString(),
        status: 'ativo',
        profissionalResponsavel: patientData.historico?.profissionalResponsavel,
        motivoInicio: patientData.historico?.motivoInicio
      },
      observacoes: patientData.observacoes,
      tags: patientData.tags || []
    };
    
    MOCK_PATIENTS.unshift(newPatient);
    return newPatient;
  },

  // Atualizar paciente
  update: async (id: string, patientData: Partial<PatientDetails>): Promise<PatientDetails> => {
    await delay(600);
    
    const index = MOCK_PATIENTS.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Paciente não encontrado');
    }
    
    MOCK_PATIENTS[index] = {
      ...MOCK_PATIENTS[index],
      ...patientData,
      id // Manter o ID original
    };
    
    return MOCK_PATIENTS[index];
  },

  // Excluir paciente
  delete: async (id: string): Promise<void> => {
    await delay(400);
    
    const index = MOCK_PATIENTS.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Paciente não encontrado');
    }
    
    MOCK_PATIENTS.splice(index, 1);
  },

  // Alterar status do paciente
  updateStatus: async (id: string, status: 'ativo' | 'inativo' | 'alta'): Promise<PatientDetails> => {
    await delay(300);
    
    const index = MOCK_PATIENTS.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Paciente não encontrado');
    }
    
    if (MOCK_PATIENTS[index].historico) {
      MOCK_PATIENTS[index].historico!.status = status;
    }
    
    return MOCK_PATIENTS[index];
  },

  // Obter estatísticas
  getStats: async (): Promise<PatientStats> => {
    await delay(400);
    
    const total = MOCK_PATIENTS.length;
    const ativos = MOCK_PATIENTS.filter(p => p.historico?.status === 'ativo').length;
    const inativos = MOCK_PATIENTS.filter(p => p.historico?.status === 'inativo').length;
    const alta = MOCK_PATIENTS.filter(p => p.historico?.status === 'alta').length;
    
    // Pacientes novos no mês
    const umMesAtras = subDays(new Date(), 30);
    const novosMes = MOCK_PATIENTS.filter(p => 
      p.historico?.dataInicio && new Date(p.historico.dataInicio) >= umMesAtras
    ).length;
    
    // Por convênio
    const porConvenio = MOCK_PATIENTS.reduce((acc, patient) => {
      const convenio = patient.convenio?.nome || 'Sem convênio';
      acc[convenio] = (acc[convenio] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Por idade
    const porIdade = MOCK_PATIENTS.reduce((acc, patient) => {
      if (patient.nascimento) {
        const idade = new Date().getFullYear() - new Date(patient.nascimento).getFullYear();
        if (idade <= 5) acc['0-5']++;
        else if (idade <= 12) acc['6-12']++;
        else if (idade <= 17) acc['13-17']++;
        else acc['18+']++;
      }
      return acc;
    }, { '0-5': 0, '6-12': 0, '13-17': 0, '18+': 0 });
    
    return {
      total,
      ativos,
      inativos,
      alta,
      novosMes,
      porConvenio,
      porIdade
    };
  }
};

// Utilitários
export const mockPatientUtils = {
  calculateAge: (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  formatCPF: (cpf: string): string => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  formatPhone: (phone: string): string => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  },

  getStatusColor: (status: string): string => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  getStatusLabel: (status: string): string => {
    const labels = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      alta: 'Alta'
    };
    return labels[status as keyof typeof labels] || status;
  }
};

export default mockPatientsAPI;