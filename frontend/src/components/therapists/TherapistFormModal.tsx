import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Award,
  Clock,
  Users,
  FileText,
  Globe,
  Linkedin,
  Instagram
} from 'lucide-react';

interface Specialty {
  id: string;
  name: string;
  category: string;
  color: string;
  experience_level?: number;
  certified?: boolean;
}

interface TherapistData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  professional_id: string;
  bio: string;
  bio_extended: string;
  experience_years: number;
  languages: string[];
  specialties: string[];
  specialties_details: Specialty[];
  consultation_duration: number;
  max_daily_appointments: number;
  hourly_rate: number;
  timezone: string;
  language_preference: string;
  available_hours: any;
  certifications: string[];
  social_links: {
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  avatar_url?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TherapistData) => void;
  initialData?: TherapistData | null;
  specialties: Specialty[];
}

const defaultAvailableHours = {
  monday: [{ start: '08:00', end: '17:00' }],
  tuesday: [{ start: '08:00', end: '17:00' }],
  wednesday: [{ start: '08:00', end: '17:00' }],
  thursday: [{ start: '08:00', end: '17:00' }],
  friday: [{ start: '08:00', end: '17:00' }],
  saturday: [],
  sunday: []
};

export default function TherapistFormModal({ isOpen, onClose, onSave, initialData, specialties }: Props) {
  const [formData, setFormData] = useState<TherapistData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    professional_id: '',
    bio: '',
    bio_extended: '',
    experience_years: 0,
    languages: ['Português'],
    specialties: [],
    specialties_details: [],
    consultation_duration: 50,
    max_daily_appointments: 8,
    hourly_rate: 0,
    timezone: 'America/Sao_Paulo',
    language_preference: 'pt-BR',
    available_hours: defaultAvailableHours,
    certifications: [],
    social_links: {}
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        professional_id: '',
        bio: '',
        bio_extended: '',
        experience_years: 0,
        languages: ['Português'],
        specialties: [],
        specialties_details: [],
        consultation_duration: 50,
        max_daily_appointments: 8,
        hourly_rate: 0,
        timezone: 'America/Sao_Paulo',
        language_preference: 'pt-BR',
        available_hours: defaultAvailableHours,
        certifications: [],
        social_links: {}
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof TherapistData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      updateField('certifications', [...formData.certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    updateField('certifications', formData.certifications.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      updateField('languages', [...formData.languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    if (formData.languages.length > 1) {
      updateField('languages', formData.languages.filter((_, i) => i !== index));
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    const isSelected = formData.specialties.includes(specialtyId);
    if (isSelected) {
      updateField('specialties', formData.specialties.filter(id => id !== specialtyId));
      updateField('specialties_details', formData.specialties_details.filter(s => s.id !== specialtyId));
    } else {
      updateField('specialties', [...formData.specialties, specialtyId]);
      const specialty = specialties.find(s => s.id === specialtyId);
      if (specialty) {
        updateField('specialties_details', [
          ...formData.specialties_details, 
          { ...specialty, experience_level: 3, certified: false }
        ]);
      }
    }
  };

  const updateSpecialtyLevel = (specialtyId: string, level: number) => {
    updateField('specialties_details', 
      formData.specialties_details.map(s => 
        s.id === specialtyId ? { ...s, experience_level: level } : s
      )
    );
  };

  const updateSpecialtyCertified = (specialtyId: string, certified: boolean) => {
    updateField('specialties_details', 
      formData.specialties_details.map(s => 
        s.id === specialtyId ? { ...s, certified } : s
      )
    );
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Dados Básicos', icon: User },
    { id: 'professional', label: 'Profissional', icon: Award },
    { id: 'specialties', label: 'Especialidades', icon: Star },
    { id: 'schedule', label: 'Horários', icon: Clock },
    { id: 'contact', label: 'Contato', icon: Globe }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? 'Editar Terapeuta' : 'Novo Terapeuta'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Ex: Dr. Maria Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="maria@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => updateField('cpf', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografia Resumida
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Breve descrição profissional..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografia Detalhada
                    </label>
                    <textarea
                      value={formData.bio_extended}
                      onChange={(e) => updateField('bio_extended', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Descrição detalhada da formação, experiência, áreas de atuação..."
                    />
                  </div>
                </div>
              )}

              {/* Professional Tab */}
              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registro Profissional
                      </label>
                      <input
                        type="text"
                        value={formData.professional_id}
                        onChange={(e) => updateField('professional_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="CRP 06/123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anos de Experiência
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience_years}
                        onChange={(e) => updateField('experience_years', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor por Hora (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={(e) => updateField('hourly_rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duração da Consulta (min)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={formData.consultation_duration}
                        onChange={(e) => updateField('consultation_duration', parseInt(e.target.value) || 50)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max. Atendimentos/Dia
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.max_daily_appointments}
                        onChange={(e) => updateField('max_daily_appointments', parseInt(e.target.value) || 8)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Certificações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificações
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Adicionar certificação..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      />
                      <button
                        type="button"
                        onClick={addCertification}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Idiomas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idiomas
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Adicionar idioma..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {lang}
                          {formData.languages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="ml-2 text-blue-500 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Specialties Tab */}
              {activeTab === 'specialties' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialties.map((specialty) => {
                      const isSelected = formData.specialties.includes(specialty.id);
                      const specialtyDetail = formData.specialties_details.find(s => s.id === specialty.id);
                      
                      return (
                        <div
                          key={specialty.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleSpecialty(specialty.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{specialty.name}</h4>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: specialty.color }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{specialty.category}</p>
                          
                          {isSelected && (
                            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Nível de Experiência
                                </label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => updateSpecialtyLevel(specialty.id, level)}
                                      className={`p-1 ${
                                        (specialtyDetail?.experience_level || 0) >= level
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      <Star size={16} fill="currentColor" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={specialtyDetail?.certified || false}
                                  onChange={(e) => updateSpecialtyCertified(specialty.id, e.target.checked)}
                                  className="mr-2 rounded"
                                />
                                Certificado
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Linkedin size={16} className="inline mr-2" />
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.linkedin || ''}
                        onChange={(e) => updateField('social_links', {
                          ...formData.social_links,
                          linkedin: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Instagram size={16} className="inline mr-2" />
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.instagram || ''}
                        onChange={(e) => updateField('social_links', {
                          ...formData.social_links,
                          instagram: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe size={16} className="inline mr-2" />
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.website || ''}
                        onChange={(e) => updateField('social_links', {
                          ...formData.social_links,
                          website: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://meusite.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuso Horário
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => updateField('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="America/Sao_Paulo">América/São Paulo</option>
                        <option value="America/Rio_Branco">América/Rio Branco</option>
                        <option value="America/Manaus">América/Manaus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idioma Preferido
                      </label>
                      <select
                        value={formData.language_preference}
                        onChange={(e) => updateField('language_preference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Save size={16} className="mr-2" />
                {initialData ? 'Atualizar' : 'Criar'} Terapeuta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}