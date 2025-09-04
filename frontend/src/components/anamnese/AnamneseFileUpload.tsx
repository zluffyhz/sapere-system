import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, Download } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  url?: string;
  patientName?: string;
}

interface AnamneseFileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void;
  maxFileSize?: number; // em MB
  allowedTypes?: string[];
}

const AnamneseFileUpload: React.FC<AnamneseFileUploadProps> = ({
  onFileUploaded,
  maxFileSize = 10,
  allowedTypes = ['.pdf', '.doc', '.docx']
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [patientName, setPatientName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!files || !patientName.trim()) {
      if (!patientName.trim()) {
        alert('Por favor, informe o nome do paciente antes de fazer o upload');
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
        patientName: patientName.trim()
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload de Anamnese
        </h3>
        
        {/* Input nome do paciente */}
        <div className="mb-4">
          <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Paciente *
          </label>
          <input
            id="patient-name"
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Digite o nome completo do paciente"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sapere-orange focus:border-transparent"
            required
          />
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
            disabled={!patientName.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selecionar Arquivos
          </button>
          
          {!patientName.trim() && (
            <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Informe o nome do paciente primeiro
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
                      <span>{file.uploadDate.toLocaleDateString()}</span>
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

export default AnamneseFileUpload;