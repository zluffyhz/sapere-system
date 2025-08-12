import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, X, Check, AlertCircle, Download, Users, Search } from 'lucide-react';
import mockPatientsAPI from '@/services/mockPatients';
import type { PatientDetails } from '@/services/mockPatients';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  url?: string;
  patientId: string;
  patientName: string;
}

interface AnamneseUploadWithPatientsProps {
  onFileUploaded?: (file: UploadedFile) => void;
  maxFileSize?: number; // em MB
  allowedTypes?: string[];
}

const AnamneseUploadWithPatients: React.FC<AnamneseUploadWithPatientsProps> = ({
  onFileUploaded,
  maxFileSize = 10,
  allowedTypes = ['.pdf', '.doc', '.docx']
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [patients, setPatients] = useState<PatientDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const patientsData = await mockPatientsAPI.list({ status: 'ativo' });
      setPatients(patientsData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm)
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Arquivo muito grande. Tamanho máximo: ${maxFileSize}MB`;
    }

    // Verificar tipo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `Tipo de arquivo não permitido. Aceitos: ${allowedTypes.join(', ')}`;
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
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', progress: 100, url: `/uploads/anamneses/${file.id}` }
              : f
          )
        );
        
        if (onFileUploaded) {
          onFileUploaded({
            ...file,
            status: 'completed',
            progress: 100,
            url: `/uploads/anamneses/${file.id}`
          });
        }
      } else {
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, progress } : f)
        );
      }
    }, 200);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !selectedPatient) {
      if (!selectedPatient) {
        alert('Por favor, selecione um paciente antes de fazer o upload');
      }
      return;
    }

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation) {
        alert(validation);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0,
        patientId: selectedPatient.id,
        patientName: selectedPatient.nome
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      simulateUpload(uploadedFile);
    });

    // Limpar input
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
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadFile = (file: UploadedFile) => {
    if (file.url) {
      // Em produção, isso faria o download real do arquivo
      window.open(file.url, '_blank');
    }
  };

  const selectPatient = (patient: PatientDetails) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.nome);
    setShowPatientDropdown(false);
  };

  const clearPatientSelection = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setShowPatientDropdown(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Anamnese
        </h3>
        
        {/* Seleção de Paciente */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Paciente *
          </label>
          <div className="relative">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowPatientDropdown(true);
                    if (!e.target.value) {
                      setSelectedPatient(null);
                    }
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  placeholder="Buscar paciente por nome ou CPF..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
                />
              </div>
              {selectedPatient && (
                <button
                  onClick={clearPatientSelection}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                  title="Limpar seleção"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown de Pacientes */}
            {showPatientDropdown && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{patient.nome}</p>
                          <p className="text-sm text-gray-600">CPF: {patient.cpf}</p>
                        </div>
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    Nenhum paciente encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paciente selecionado */}
          {selectedPatient && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="h-4 w-4" />
                <span className="font-medium">Paciente selecionado:</span>
                <span>{selectedPatient.nome}</span>
              </div>
            </div>
          )}
        </div>

        {/* Área de upload */}
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
            Tipos aceitos: {allowedTypes.join(', ')} | Tamanho máximo: {maxFileSize}MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedPatient}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selecionar Arquivos
          </button>
          
          {!selectedPatient && (
            <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Selecione um paciente primeiro
            </p>
          )}
        </div>
      </div>

      {/* Lista de arquivos */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Arquivos Enviados ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div 
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-8 w-8 text-sapere-orange flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>Paciente: {file.patientName}</span>
                      <span>•</span>
                      <span>{file.uploadDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {/* Barra de progresso */}
                    {file.status === 'uploading' && file.progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-sapere-orange h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(file.progress)}% enviado
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status */}
                  {file.status === 'completed' && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  
                  {/* Ações */}
                  {file.status === 'completed' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-1 text-gray-400 hover:text-sapere-orange"
                      title="Baixar arquivo"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
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
  );
};

export default AnamneseUploadWithPatients;