// Modal completo para criação e edição de pacientes
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  AlertCircle,
  UserCheck,
  Save,
  X,
  Plus
} from 'lucide-react';
import type { PatientDetails } from '@/services/mockPatients';

interface PatientModalProps {
  patient?: PatientDetails | null;
  onSave: (patientData: Partial<PatientDetails>) => Promise<void>;
  onClose: () => void;
}

interface PatientFormData {
  // Dados básicos
  nome: string;
  nascimento: string;
  cpf: string;
  rg: string;
  
  // Contatos
  contatos: {
    email: string;
    telefone: string;
  };
  
  // Responsável
  responsavel: {
    nome: string;
    cpf: string;
    telefone: string;
  };
  
  // Convênio
  convenio?: {
    nome: string;
    numero?: string;
  };
  
  // Endereço
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  
  // Dados médicos
  dadosMedicos: {
    alergias: string[];
    medicamentos: string[];
    condicoesMedicas: string[];
    observacoes: string;
  };
  
  // Histórico
  historico: {
    profissionalResponsavel?: string;
    motivoInicio?: string;
  };
  
  // Outras informações
  observacoes: string;
  tags: string[];
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basicos');

  // Debug das abas - detectar mudanças
  useEffect(() => {
    console.log('=== DEBUG ABAS PATIENT MODAL ===');
    console.log('Aba ativa atual:', activeTab);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('==================================');
  }, [activeTab]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PatientFormData>({
    nome: '',
    nascimento: '',
    cpf: '',
    rg: '',
    contatos: {
      email: '',
      telefone: ''
    },
    responsavel: {
      nome: '',
      cpf: '',
      telefone: ''
    },
    convenio: {
      nome: 'Particular',
      numero: ''
    },
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: 'SP'
    },
    dadosMedicos: {
      alergias: [],
      medicamentos: [],
      condicoesMedicas: [],
      observacoes: ''
    },
    historico: {
      profissionalResponsavel: '',
      motivoInicio: ''
    },
    observacoes: '',
    tags: []
  });

  // Carregar dados do paciente para edição
  useEffect(() => {
    if (patient) {
      setFormData({
        nome: patient.nome || '',
        nascimento: patient.nascimento ? patient.nascimento.split('T')[0] : '',
        cpf: patient.cpf || '',
        rg: patient.rg || '',
        contatos: {
          email: patient.contatos?.email || '',
          telefone: patient.contatos?.telefone || ''
        },
        responsavel: {
          nome: patient.responsavel?.nome || '',
          cpf: patient.responsavel?.cpf || '',
          telefone: patient.responsavel?.telefone || ''
        },
        convenio: {
          nome: patient.convenio?.nome || 'Particular',
          numero: patient.convenio?.numero || ''
        },
        endereco: {
          cep: patient.endereco?.cep || '',
          logradouro: patient.endereco?.logradouro || '',
          numero: patient.endereco?.numero || '',
          complemento: patient.endereco?.complemento || '',
          bairro: patient.endereco?.bairro || '',
          cidade: patient.endereco?.cidade || '',
          uf: patient.endereco?.uf || 'SP'
        },
        dadosMedicos: {
          alergias: patient.dadosMedicos?.alergias || [],
          medicamentos: patient.dadosMedicos?.medicamentos || [],
          condicoesMedicas: patient.dadosMedicos?.condicoesMedicas || [],
          observacoes: patient.dadosMedicos?.observacoes || ''
        },
        historico: {
          profissionalResponsavel: patient.historico?.profissionalResponsavel || '',
          motivoInicio: patient.historico?.motivoInicio || ''
        },
        observacoes: patient.observacoes || '',
        tags: patient.tags || []
      });
    }
  }, [patient]);

  // Funções utilitárias para máscaras
  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // const formatCEP = (value: string): string => {
  //   const numbers = value.replace(/\D/g, '');
  //   if (numbers.length <= 8) {
  //     return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  //   }
  //   return value;
  // };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    // Simplified CPF validation - could be improved
    return numbers !== '00000000000' && numbers !== '11111111111';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validações básicas obrigatórias
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.nascimento) {
      newErrors.nascimento = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.nascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 100 || age < 0) {
        newErrors.nascimento = 'Data de nascimento inválida';
      }
    }
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.responsavel.nome.trim()) {
      newErrors['responsavel.nome'] = 'Nome do responsável é obrigatório';
    } else if (formData.responsavel.nome.trim().length < 2) {
      newErrors['responsavel.nome'] = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.responsavel.telefone.trim()) {
      newErrors['responsavel.telefone'] = 'Telefone do responsável é obrigatório';
    } else {
      const phoneNumbers = formData.responsavel.telefone.replace(/\D/g, '');
      if (phoneNumbers.length < 10) {
        newErrors['responsavel.telefone'] = 'Telefone inválido';
      }
    }

    // Validação de email se preenchido
    if (formData.contatos.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contatos.email)) {
        newErrors['contatos.email'] = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const patientData = {
        ...formData,
        historico: {
          dataInicio: new Date().toISOString(),
          status: 'ativo' as const,
          profissionalResponsavel: formData.historico?.profissionalResponsavel,
          motivoInicio: formData.historico?.motivoInicio
        }
      };
      await onSave(patientData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInputChange = (field: keyof PatientFormData['dadosMedicos'], value: string) => {
    if (value.trim()) {
      const currentArray = formData.dadosMedicos[field] as string[];
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          dadosMedicos: {
            ...prev.dadosMedicos,
            [field]: [...currentArray, value.trim()]
          }
        }));
      }
    }
  };

  const removeArrayItem = (field: keyof PatientFormData['dadosMedicos'], index: number) => {
    setFormData(prev => ({
      ...prev,
      dadosMedicos: {
        ...prev.dadosMedicos,
        [field]: (prev.dadosMedicos[field] as string[]).filter((_, i) => i !== index)
      }
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'basicos', label: 'Dados Básicos', icon: User },
    { id: 'contatos', label: 'Contatos', icon: Phone },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'medicos', label: 'Dados Médicos', icon: FileText },
    { id: 'outros', label: 'Outros', icon: AlertCircle }
  ];

  const renderBasicosTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
              errors.nome ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nome completo do paciente"
          />
          {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento *
          </label>
          <input
            type="date"
            value={formData.nascimento}
            onChange={(e) => setFormData(prev => ({ ...prev, nascimento: e.target.value }))}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
              errors.nascimento ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nascimento && <p className="text-red-500 text-sm mt-1">{errors.nascimento}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
              errors.cpf ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RG
          </label>
          <input
            type="text"
            value={formData.rg}
            onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="00.000.000-0"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Dados do Responsável
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Responsável *
            </label>
            <input
              type="text"
              value={formData.responsavel.nome}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                responsavel: { ...prev.responsavel, nome: e.target.value }
              }))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                errors['responsavel.nome'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome completo do responsável"
            />
            {errors['responsavel.nome'] && <p className="text-red-500 text-sm mt-1">{errors['responsavel.nome']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF do Responsável
            </label>
            <input
              type="text"
              value={formData.responsavel.cpf}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                responsavel: { ...prev.responsavel, cpf: formatCPF(e.target.value) }
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone do Responsável *
            </label>
            <input
              type="text"
              value={formData.responsavel.telefone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                responsavel: { ...prev.responsavel, telefone: formatPhone(e.target.value) }
              }))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                errors['responsavel.telefone'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            {errors['responsavel.telefone'] && <p className="text-red-500 text-sm mt-1">{errors['responsavel.telefone']}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContatosTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={formData.contatos.email}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contatos: { ...prev.contatos, email: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="text"
            value={formData.contatos.telefone}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contatos: { ...prev.contatos, telefone: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-4">Convênio</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Convênio
            </label>
            <select
              value={formData.convenio?.nome}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                convenio: { ...prev.convenio, nome: e.target.value }
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            >
              <option value="Particular">Particular</option>
              <option value="Unimed">Unimed</option>
              <option value="Bradesco Saúde">Bradesco Saúde</option>
              <option value="SulAmérica">SulAmérica</option>
              <option value="Amil">Amil</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {formData.convenio?.nome !== 'Particular' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Carteirinha
              </label>
              <input
                type="text"
                value={formData.convenio?.numero || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  convenio: { ...prev.convenio!, numero: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                placeholder="Número da carteirinha"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEnderecoTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP
          </label>
          <input
            type="text"
            value={formData.endereco.cep}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, cep: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="00000-000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logradouro
          </label>
          <input
            type="text"
            value={formData.endereco.logradouro}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, logradouro: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Rua, Avenida, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número
          </label>
          <input
            type="text"
            value={formData.endereco.numero}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, numero: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complemento
          </label>
          <input
            type="text"
            value={formData.endereco.complemento}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, complemento: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Apto, Bloco, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro
          </label>
          <input
            type="text"
            value={formData.endereco.bairro}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, bairro: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Nome do bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={formData.endereco.cidade}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, cidade: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Nome da cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UF
          </label>
          <select
            value={formData.endereco.uf}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endereco: { ...prev.endereco, uf: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
          >
            <option value="AC">AC</option>
            <option value="AL">AL</option>
            <option value="AP">AP</option>
            <option value="AM">AM</option>
            <option value="BA">BA</option>
            <option value="CE">CE</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
            <option value="GO">GO</option>
            <option value="MA">MA</option>
            <option value="MT">MT</option>
            <option value="MS">MS</option>
            <option value="MG">MG</option>
            <option value="PA">PA</option>
            <option value="PB">PB</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="PI">PI</option>
            <option value="RJ">RJ</option>
            <option value="RN">RN</option>
            <option value="RS">RS</option>
            <option value="RO">RO</option>
            <option value="RR">RR</option>
            <option value="SC">SC</option>
            <option value="SP">SP</option>
            <option value="SE">SE</option>
            <option value="TO">TO</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMedicosTab = () => {
    const [newAllergy, setNewAllergy] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const [newCondition, setNewCondition] = useState('');

    return (
      <div className="space-y-6">
        {/* Alergias */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alergias
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayInputChange('alergias', newAllergy);
                  setNewAllergy('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="Digite uma alergia e pressione Enter"
            />
            <button
              type="button"
              onClick={() => {
                handleArrayInputChange('alergias', newAllergy);
                setNewAllergy('');
              }}
              className="btn-secondary px-3"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.dadosMedicos.alergias.map((alergia, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
              >
                {alergia}
                <button
                  type="button"
                  onClick={() => removeArrayItem('alergias', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Medicamentos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicamentos em Uso
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayInputChange('medicamentos', newMedication);
                  setNewMedication('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="Digite um medicamento e pressione Enter"
            />
            <button
              type="button"
              onClick={() => {
                handleArrayInputChange('medicamentos', newMedication);
                setNewMedication('');
              }}
              className="btn-secondary px-3"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.dadosMedicos.medicamentos.map((medicamento, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {medicamento}
                <button
                  type="button"
                  onClick={() => removeArrayItem('medicamentos', index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Condições Médicas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condições Médicas
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayInputChange('condicoesMedicas', newCondition);
                  setNewCondition('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="Digite uma condição médica e pressione Enter"
            />
            <button
              type="button"
              onClick={() => {
                handleArrayInputChange('condicoesMedicas', newCondition);
                setNewCondition('');
              }}
              className="btn-secondary px-3"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.dadosMedicos.condicoesMedicas.map((condicao, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
              >
                {condicao}
                <button
                  type="button"
                  onClick={() => removeArrayItem('condicoesMedicas', index)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Observações Médicas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações Médicas
          </label>
          <textarea
            value={formData.dadosMedicos.observacoes}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              dadosMedicos: { ...prev.dadosMedicos, observacoes: e.target.value }
            }))}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Observações importantes sobre os dados médicos do paciente..."
          />
        </div>
      </div>
    );
  };

  const renderOutrosTab = () => {
    const [newTag, setNewTag] = useState('');

    return (
      <div className="space-y-6">
        {/* Profissional Responsável */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profissional Responsável
          </label>
          <input
            type="text"
            value={formData.historico.profissionalResponsavel}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              historico: { ...prev.historico, profissionalResponsavel: e.target.value }
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Nome do profissional responsável pelo acompanhamento"
          />
        </div>

        {/* Motivo do Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo do Início do Tratamento
          </label>
          <textarea
            value={formData.historico.motivoInicio}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              historico: { ...prev.historico, motivoInicio: e.target.value }
            }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Descrição do motivo que levou ao início do tratamento..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagAdd(newTag);
                  setNewTag('');
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
              placeholder="Digite uma tag e pressione Enter"
            />
            <button
              type="button"
              onClick={() => {
                handleTagAdd(newTag);
                setNewTag('');
              }}
              className="btn-secondary px-3"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Observações Gerais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações Gerais
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
            placeholder="Observações gerais sobre o paciente..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              {patient ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(`📋 ANTES: aba atual = ${activeTab}`);
                      console.log(`📋 Clicando na aba ${tab.label.toUpperCase()}`);
                      setActiveTab(tab.id);
                      console.log(`📋 DEPOIS: mudando para = ${tab.id}`);
                    }}
                    className={`py-3 px-4 text-sm font-medium rounded-t-lg flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-sapere-brown border-b-2 border-sapere-orange bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      cursor: 'pointer'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'basicos' && renderBasicosTab()}
              {activeTab === 'contatos' && renderContatosTab()}
              {activeTab === 'endereco' && renderEnderecoTab()}
              {activeTab === 'medicos' && renderMedicosTab()}
              {activeTab === 'outros' && renderOutrosTab()}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
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
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {patient ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientModal;