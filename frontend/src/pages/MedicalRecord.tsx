import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  User,
  FileText,
  Calendar,
  Search,
  Filter,
  Plus,
  Download,
  Share2,
  Printer,
  Clock,
  Tag,
  Paperclip,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Archive,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Patient, MedicalRecord } from '@/types/medical-record';
import RecordEditor from '@/components/records/RecordEditor';
import RecordTimeline from '@/components/records/RecordTimeline';
import PatientSidebar from '@/components/records/PatientSidebar';
import ProgressCharts from '@/components/records/ProgressCharts';
import AttachmentGallery from '@/components/records/AttachmentGallery';

const MedicalRecord: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'timeline' | 'editor' | 'charts' | 'attachments'>('timeline');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - Em produção viria da API
  useEffect(() => {
    const loadPatientData = async () => {
      setLoading(true);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock patient data
      const mockPatient: Patient = {
        id: patientId!,
        name: 'Ana Clara Santos',
        birth_date: '2018-03-15',
        cpf: '123.456.789-00',
        gender: 'female',
        phone: '+5592999111111',
        email: 'responsavel@email.com',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apt 45',
          neighborhood: 'Centro',
          city: 'Manaus',
          state: 'AM',
          zip_code: '69000-000'
        },
        responsible: {
          name: 'Maria Santos',
          relationship: 'Mãe',
          phone: '+5592999111111',
          email: 'maria.santos@email.com',
          cpf: '987.654.321-00'
        },
        diagnosis: [
          {
            code: 'F84.0',
            description: 'Transtorno do Espectro Autista',
            date: '2021-08-15',
            doctor: 'Dr. João Silva',
            type: 'primary',
            notes: 'Diagnóstico confirmado após avaliação multidisciplinar'
          }
        ],
        current_therapists: ['1', '2', '3'],
        created_at: '2021-08-15T10:00:00Z',
        updated_at: new Date().toISOString(),
        emergency_contact: {
          name: 'José Santos',
          phone: '+5592988777777',
          relationship: 'Pai'
        },
        special_needs: ['TEA', 'Hipersensibilidade auditiva'],
        allergies: ['Corante alimentar'],
        medications: [
          {
            name: 'Risperidona',
            dosage: '0.5mg',
            frequency: '1x ao dia',
            prescribing_doctor: 'Dr. Carlos Mendes',
            start_date: '2023-01-15',
            notes: 'Para controle de irritabilidade'
          }
        ],
        status: 'active'
      };

      // Mock records
      const mockRecords: MedicalRecord[] = [
        {
          id: '1',
          patient_id: patientId!,
          session_date: '2024-01-20T14:00:00Z',
          therapist_id: '1',
          therapist_name: 'Dellany Veras',
          specialty: 'Neuropsicologia',
          session_type: 'Sessão Regular',
          template_id: 'tea-aba',
          duration_minutes: 60,
          content: {
            evolution: 'Paciente demonstrou boa colaboração durante a sessão. Trabalhamos habilidades de comunicação funcional utilizando PECS. Ana conseguiu fazer solicitações de itens preferidos de forma independente em 80% das oportunidades.',
            structured_data: {
              target_behaviors: 'Solicitação funcional, contato visual, seguimento de instruções',
              prompts_used: ['Visual', 'Gestual'],
              reinforcement: 'Acesso a brinquedos preferidos, elogios específicos',
              data_collection: 'Solicitação independente: 8/10 tentativas'
            },
            behavioral_observations: [
              {
                category: 'communication',
                description: 'Utilizou cartões PECS para solicitar "água" e "brincar"',
                intensity: 4,
                context: 'Durante atividade estruturada',
                intervention_used: 'Prompt visual',
                result: 'Sucesso em 80% das tentativas'
              }
            ],
            milestones_achieved: [
              {
                id: 'm1',
                category: 'Comunicação',
                description: 'Primeira solicitação espontânea usando PECS',
                date_achieved: '2024-01-20',
                age_at_achievement: '5 anos e 10 meses',
                notes: 'Marco significativo no desenvolvimento da comunicação funcional'
              }
            ],
            next_session_plan: 'Continuar trabalho com PECS, introduzir fase II (distância e persistência)',
            family_guidance: 'Utilizar PECS em casa para solicitações básicas (água, comida, brinquedos)'
          },
          attachments: [
            {
              id: 'a1',
              filename: 'video_sessao_pecs.mp4',
              file_type: 'video',
              file_size: 15728640, // 15MB em bytes
              file_url: '/attachments/video_sessao_pecs.mp4',
              description: 'Vídeo demonstrando uso do PECS',
              category: 'progress',
              uploaded_by: '1',
              uploaded_at: '2024-01-20T15:00:00Z',
              is_public: true
            }
          ],
          assessments: [],
          goals: [
            {
              id: 'g1',
              category: 'Comunicação',
              description: 'Utilizar PECS para fazer 5 solicitações diferentes de forma independente',
              target_date: '2024-03-01',
              priority: 'high',
              status: 'in_progress',
              progress_percentage: 60,
              strategies: ['PECS', 'Modelagem', 'Reforçamento positivo'],
              measurement_criteria: 'Solicitações independentes em 80% das oportunidades por 3 sessões consecutivas',
              family_involvement: 'Uso do PECS em casa para solicitações básicas',
              created_at: '2024-01-10T10:00:00Z',
              updated_at: '2024-01-20T15:00:00Z'
            }
          ],
          digital_signature: {
            therapist_id: '1',
            therapist_name: 'Dellany Veras',
            signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            timestamp: '2024-01-20T15:30:00Z',
            verification_hash: 'abc123def456'
          },
          shared_with: ['responsible_1'],
          created_at: '2024-01-20T15:30:00Z',
          updated_at: '2024-01-20T15:30:00Z',
          is_template: false,
          tags: ['PECS', 'Comunicação', 'Marco'],
          status: 'completed'
        },
        {
          id: '2',
          patient_id: patientId!,
          session_date: '2024-01-15T09:00:00Z',
          therapist_id: '2',
          therapist_name: 'Ana Paula Girard',
          specialty: 'Terapia Ocupacional',
          session_type: 'Avaliação Sensorial',
          template_id: 'tea-to',
          duration_minutes: 90,
          content: {
            evolution: 'Realizada avaliação completa do perfil sensorial. Ana apresenta hipersensibilidade auditiva e tátil, com busca por estímulos proprioceptivos. Demonstrou boa tolerância a atividades de integração sensorial.',
            structured_data: {
              sensory_profile: 'Hipersensibilidade auditiva e tátil, busca proprioceptiva',
              sensory_activities: 'Balanço, escova, massinha terapêutica',
              motor_skills: 'Coordenação motora fina dentro do esperado, dificuldades em motricidade global',
              daily_activities: 'Independência parcial para vestir roupas, dificuldade com botões'
            },
            behavioral_observations: [
              {
                category: 'sensory',
                description: 'Cobriu ouvidos quando alguém bateu palmas',
                intensity: 3,
                context: 'Durante atividade em grupo',
                intervention_used: 'Redução de estímulos auditivos',
                result: 'Regulou-se após 2 minutos'
              }
            ],
            milestones_achieved: [],
            next_session_plan: 'Iniciar programa de integração sensorial com ênfase em tolerância auditiva',
            family_guidance: 'Evitar ambientes muito ruidosos, usar fones de proteção se necessário'
          },
          attachments: [
            {
              id: 'a2',
              filename: 'perfil_sensorial.pdf',
              file_type: 'document',
              file_size: 2048000, // 2MB
              file_url: '/attachments/perfil_sensorial.pdf',
              description: 'Relatório completo do perfil sensorial',
              category: 'assessment',
              uploaded_by: '2',
              uploaded_at: '2024-01-15T11:00:00Z',
              is_public: true
            }
          ],
          assessments: [
            {
              id: 'spm2',
              name: 'SPM-2 - Sensory Processing Measure',
              type: 'scale',
              date: '2024-01-15',
              scores: {
                'Auditivo': {
                  raw_score: 25,
                  percentile: 85,
                  classification: 'Definite Dysfunction',
                  notes: 'Hipersensibilidade significativa'
                },
                'Tátil': {
                  raw_score: 22,
                  percentile: 78,
                  classification: 'Some Problems',
                  notes: 'Defensividade tátil moderada'
                }
              },
              total_score: 95,
              interpretation: 'Perfil de hipersensibilidade auditiva e tátil com busca proprioceptiva',
              recommendations: [
                'Programa de integração sensorial',
                'Modificações ambientais',
                'Uso de ferramentas de autorregulação'
              ],
              next_assessment_date: '2024-07-15'
            }
          ],
          goals: [
            {
              id: 'g2',
              category: 'Integração Sensorial',
              description: 'Tolerar sons cotidianos sem cobrir os ouvidos',
              target_date: '2024-04-01',
              priority: 'high',
              status: 'not_started',
              progress_percentage: 0,
              strategies: ['Dessensibilização gradual', 'Uso de fones', 'Técnicas de autorregulação'],
              measurement_criteria: 'Tolerar 5 sons diferentes por 1 minuto sem cobrir ouvidos',
              family_involvement: 'Prática de exercícios de tolerância auditiva em casa',
              created_at: '2024-01-15T11:00:00Z',
              updated_at: '2024-01-15T11:00:00Z'
            }
          ],
          digital_signature: {
            therapist_id: '2',
            therapist_name: 'Ana Paula Girard',
            signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            timestamp: '2024-01-15T12:00:00Z',
            verification_hash: 'xyz789abc123'
          },
          shared_with: ['responsible_1'],
          created_at: '2024-01-15T12:00:00Z',
          updated_at: '2024-01-15T12:00:00Z',
          is_template: false,
          tags: ['Avaliação', 'Sensorial', 'SPM-2'],
          status: 'completed'
        }
      ];

      setPatient(mockPatient);
      setRecords(mockRecords);
      setFilteredRecords(mockRecords);
      setLoading(false);
    };

    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // Filtros
  useEffect(() => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.content.evolution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.therapist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterSpecialty) {
      filtered = filtered.filter(record => record.specialty === filterSpecialty);
    }

    if (filterStatus) {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterPeriod) {
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '6m':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(record => 
        new Date(record.session_date) >= filterDate
      );
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, filterSpecialty, filterStatus, filterPeriod]);

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setIsEditorOpen(true);
    setActiveView('editor');
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsEditorOpen(true);
    setActiveView('editor');
  };

  const handleRecordSave = (record: MedicalRecord) => {
    if (selectedRecord) {
      setRecords(prev => prev.map(r => r.id === record.id ? record : r));
    } else {
      setRecords(prev => [...prev, { ...record, id: Date.now().toString() }]);
    }
    setIsEditorOpen(false);
    setSelectedRecord(null);
    setActiveView('timeline');
  };

  const getSpecialties = () => {
    return Array.from(new Set(records.map(r => r.specialty)));
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      return `${years - 1} anos e ${12 + months} meses`;
    }
    return `${years} anos e ${months} meses`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapere-orange mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando prontuário...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Paciente não encontrado</h2>
        <p className="text-gray-600">O paciente solicitado não existe ou você não tem permissão para acessá-lo.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar do Paciente */}
      <PatientSidebar 
        patient={patient}
        recordsCount={records.length}
        onClose={() => {}}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-sapere-orange text-white rounded-full flex items-center justify-center font-bold text-lg">
                {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sapere-brown">{patient.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{calculateAge(patient.birth_date)}</span>
                  <span>•</span>
                  <span>{patient.diagnosis[0]?.description}</span>
                  <span>•</span>
                  <span>{records.length} registros</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 hover:text-sapere-brown hover:bg-gray-100 rounded-lg transition-colors"
                title="Filtros"
              >
                <Filter className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-sapere-brown hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-sapere-brown hover:bg-gray-100 rounded-lg transition-colors">
                <Printer className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-sapere-brown hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-5 w-5" />
              </button>

              <button
                onClick={handleNewRecord}
                className="bg-sapere-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Evolução</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar registros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  />
                </div>

                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                >
                  <option value="">Todas especialidades</option>
                  {getSpecialties().map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>

                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                >
                  <option value="all">Todo período</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="6m">Últimos 6 meses</option>
                  <option value="1y">Último ano</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                >
                  <option value="">Todos status</option>
                  <option value="draft">Rascunho</option>
                  <option value="completed">Completo</option>
                  <option value="reviewed">Revisado</option>
                  <option value="archived">Arquivado</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterSpecialty('');
                    setFilterPeriod('all');
                    setFilterStatus('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-sapere-brown border border-gray-300 rounded-lg hover:border-sapere-orange transition-colors"
                >
                  Limpar
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Exibindo {filteredRecords.length} de {records.length} registros
              </div>
            </div>
          )}

          {/* Navegação por abas */}
          <div className="flex mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                activeView === 'timeline'
                  ? 'border-sapere-orange text-sapere-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Timeline</span>
              </div>
            </button>

            {isEditorOpen && (
              <button
                onClick={() => setActiveView('editor')}
                className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                  activeView === 'editor'
                    ? 'border-sapere-orange text-sapere-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Editor</span>
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveView('charts')}
              className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                activeView === 'charts'
                  ? 'border-sapere-orange text-sapere-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Progresso</span>
              </div>
            </button>

            <button
              onClick={() => setActiveView('attachments')}
              className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                activeView === 'attachments'
                  ? 'border-sapere-orange text-sapere-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4" />
                <span>Anexos</span>
              </div>
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="flex-1 overflow-auto">
          {activeView === 'timeline' && (
            <RecordTimeline
              records={filteredRecords}
              patient={patient}
              onEditRecord={handleEditRecord}
              onNewRecord={handleNewRecord}
            />
          )}

          {activeView === 'editor' && (
            <RecordEditor
              record={selectedRecord}
              patient={patient}
              onSave={handleRecordSave}
              onCancel={() => {
                setIsEditorOpen(false);
                setActiveView('timeline');
              }}
            />
          )}

          {activeView === 'charts' && (
            <ProgressCharts
              records={filteredRecords}
              patient={patient}
            />
          )}

          {activeView === 'attachments' && (
            <AttachmentGallery
              records={filteredRecords}
              patient={patient}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecord;