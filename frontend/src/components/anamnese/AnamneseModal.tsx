// Modal para criação e edição de anamneses compartilhadas

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  FileText,
  Tag as TagIcon,
  BookOpen,
  Save,
  Upload,
  File,
  Check,
  AlertCircle,
  Download
} from 'lucide-react';

// import { useAuth } from '@/context/AuthContext';
import type { 
  AnamneseTemplate, 
  AnamneseCompartilhada,
  AnamneseCategoria,
  AnamneseVisibilidade,
  CreateAnamneseRequest
} from '@/types/anamnese';
import { getActiveTemplates } from '@/services/anamneseTemplates';

// Tipos temporários
interface Professional {
  id: string;
  nome: string;
  especialidade: string;
}

interface Patient {
  id: string;
  nome: string;
}

interface AnamneseModalProps {
  anamnese: AnamneseCompartilhada | null;
  professionals: Professional[];
  patients: Patient[];
  onSave: (data: CreateAnamneseRequest) => Promise<void>;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  url?: string;
}

interface FormData {
  templateId: string;
  titulo: string;
  paciente: Patient | null;
  profissional: Professional | null;
  categoria: AnamneseCategoria;
  visibilidade: AnamneseVisibilidade;
  tags: string[];
  observacoes: string;
  uploadedFiles: UploadedFile[];
  creationType: 'form' | 'upload';
}

const AnamneseModal: React.FC<AnamneseModalProps> = ({
  anamnese,
  professionals,
  patients,
  onSave,
  onClose
}) => {
  const templates = getActiveTemplates();
  const [formData, setFormData] = useState<FormData>({
    templateId: '',
    titulo: '',
    paciente: null,
    profissional: null,
    categoria: 'geral',
    visibilidade: 'publica',
    tags: [],
    observacoes: '',
    uploadedFiles: [],
    creationType: 'form'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Initialize form when editing
  useEffect(() => {
    if (anamnese) {
      setFormData({
        templateId: anamnese.templateId || '',
        titulo: anamnese.titulo,
        paciente: anamnese.patientId ? { id: anamnese.patientId, nome: anamnese.pacienteNome } : null,
        profissional: anamnese.profissionalId ? { id: anamnese.profissionalId, nome: anamnese.criadoPor, especialidade: '' } : null,
        categoria: anamnese.categoria,
        visibilidade: 'publica',
        tags: anamnese.tags || [],
        observacoes: anamnese.observacoes || ''
      });
    }
  }, [anamnese]);

  // File upload functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB';
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return 'Tipo de arquivo não permitido. Aceitos: PDF, DOC, DOCX';
    }

    return null;
  };

  const simulateUpload = (file: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFormData(prev => ({
          ...prev,
          uploadedFiles: prev.uploadedFiles.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', progress: 100, url: `/uploads/anamneses/${file.id}` }
              : f
          )
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          uploadedFiles: prev.uploadedFiles.map(f => 
            f.id === file.id ? { ...f, progress } : f
          )
        }));
      }
    }, 200);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !formData.paciente) {
      if (!formData.paciente) {
        setErrors(prev => ({ ...prev, paciente: 'Selecione um paciente primeiro' }));
      }
      return;
    }

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation) {
        setErrors(prev => ({ ...prev, file: validation }));
        return;
      }

      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0
      };

      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, uploadedFile],
        creationType: 'upload'
      }));
      
      simulateUpload(uploadedFile);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.id !== fileId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar paciente sempre
    if (!formData.paciente) {
      newErrors.paciente = 'Selecione um paciente';
    }

    // Validar título sempre
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    // Validações específicas por tipo de criação
    if (formData.creationType === 'form') {
      if (!formData.templateId) {
        newErrors.templateId = 'Selecione um template';
      }
    } else if (formData.creationType === 'upload') {
      if (formData.uploadedFiles.length === 0) {
        newErrors.file = 'Envie pelo menos um arquivo';
      }
    }

    if (!formData.profissional) {
      newErrors.profissional = 'Selecione um profissional';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const anamneseData: import('@/types/anamnese').AnamneseFormData = {
        titulo: formData.titulo,
        pacienteNome: formData.paciente?.nome || '',
        queixaPrincipal: '', // Será preenchido posteriormente
        dadosAnamnese: {},
        observacoes: formData.observacoes,
        tags: formData.tags,
        categoria: formData.categoria,
        visibilidade: formData.visibilidade
      };

      const requestData: CreateAnamneseRequest = {
        templateId: formData.templateId,
        formData: anamneseData
      };

      await onSave(requestData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setFormData(prev => ({
      ...prev,
      templateId,
      categoria: template?.categoria || 'geral'
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sapere-orange" />
              {anamnese ? 'Editar Anamnese' : 'Nova Anamnese'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Creation Type Tabs */}
          {!anamnese && (
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, creationType: 'form' }))}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    formData.creationType === 'form'
                      ? 'border-sapere-orange text-sapere-orange bg-sapere-orange/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Preencher Formulário
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, creationType: 'upload' }))}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    formData.creationType === 'upload'
                      ? 'border-sapere-orange text-sapere-orange bg-sapere-orange/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload de Arquivo
                  </div>
                </button>
              </nav>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Template Selection - Only for form type */}
            {formData.creationType === 'form' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  Template *
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                    errors.templateId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={!!anamnese}
                >
                  <option value="">Selecione um template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.nome} ({template.categoria})
                    </option>
                  ))}
                </select>
                {errors.templateId && (
                  <p className="mt-1 text-sm text-red-600">{errors.templateId}</p>
                )}
              </div>
            )}

            {/* File Upload Section - Only for upload type */}
            {formData.creationType === 'upload' && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-sapere-orange bg-sapere-orange/5' 
                      : 'border-gray-300 hover:border-sapere-orange/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Tipos aceitos: PDF, DOC, DOCX | Tamanho máximo: 10MB
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!formData.paciente}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selecionar Arquivos
                  </button>
                  
                  {!formData.paciente && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Selecione um paciente primeiro
                    </p>
                  )}
                </div>

                {errors.file && (
                  <p className="text-sm text-red-600">{errors.file}</p>
                )}

                {/* Lista de arquivos */}
                {formData.uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Arquivos Enviados ({formData.uploadedFiles.length})
                    </h4>
                    
                    <div className="space-y-2">
                      {formData.uploadedFiles.map(file => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-white rounded border"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <File className="h-6 w-6 text-sapere-orange flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                              </p>
                              
                              {/* Barra de progresso */}
                              {file.status === 'uploading' && file.progress !== undefined && (
                                <div className="mt-1">
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                      className="bg-sapere-orange h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${file.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {file.status === 'completed' && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            {file.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="Remover arquivo"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: João Silva - Avaliação Inicial"
                required
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
              )}
            </div>

            {/* Patient and Professional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Paciente *
                </label>
                <select
                  value={formData.paciente?.id || ''}
                  onChange={(e) => {
                    const patient = patients.find(p => p.id === e.target.value);
                    setFormData(prev => ({ ...prev, paciente: patient || null }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                    errors.paciente ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nome}
                    </option>
                  ))}
                </select>
                {errors.paciente && (
                  <p className="mt-1 text-sm text-red-600">{errors.paciente}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Profissional *
                </label>
                <select
                  value={formData.profissional?.id || ''}
                  onChange={(e) => {
                    const professional = professionals.find(p => p.id === e.target.value);
                    setFormData(prev => ({ ...prev, profissional: professional || null }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange ${
                    errors.profissional ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome} - {prof.especialidade}
                    </option>
                  ))}
                </select>
                {errors.profissional && (
                  <p className="mt-1 text-sm text-red-600">{errors.profissional}</p>
                )}
              </div>
            </div>


            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TagIcon className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                  placeholder="Adicionar tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary px-4"
                >
                  Adicionar
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Iniciais
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-sapere-orange"
                rows={3}
                placeholder="Observações gerais sobre o caso ou contexto da anamnese"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {anamnese ? 'Atualizar' : 'Criar'} Anamnese
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnamneseModal;