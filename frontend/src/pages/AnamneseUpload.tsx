import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Eye,
  Upload,
  User,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birthDate?: string;
  responsible?: string;
}

interface AnamneseFile {
  id: string;
  patientId: string;
  patientName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64
  uploadDate: string;
  therapist: string;
  description?: string;
  status: 'uploaded' | 'reviewed' | 'approved';
}

const AnamneseUpload: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [anamneses, setAnamneses] = useState<AnamneseFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewingFile, setViewingFile] = useState<AnamneseFile | null>(null);

  useEffect(() => {
    loadPatients();
    loadAnamneses();
  }, []);

  const loadPatients = () => {
    try {
      const savedPatients = localStorage.getItem('sapere_patients');
      if (savedPatients) {
        setPatients(JSON.parse(savedPatients));
      }
    } catch (err) {
      error('Erro ao carregar pacientes');
    }
  };

  const loadAnamneses = () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem('sapere_anamnese_files');
      if (saved) {
        setAnamneses(JSON.parse(saved));
      }
    } catch (err) {
      error('Erro ao carregar anamneses');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnamneses = (updated: AnamneseFile[]) => {
    localStorage.setItem('sapere_anamnese_files', JSON.stringify(updated));
    setAnamneses(updated);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      error('Tipo de arquivo não permitido. Use PDF, DOC, DOCX ou imagens.');
      return;
    }

    // Verificar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedPatient || !selectedFile) {
      error('Selecione um paciente e um arquivo');
      return;
    }

    setIsLoading(true);

    try {
      // Converter arquivo para base64
      const fileData = await fileToBase64(selectedFile);
      
      const patient = patients.find(p => p.id === selectedPatient);
      if (!patient) {
        error('Paciente não encontrado');
        return;
      }

      const newAnamnese: AnamneseFile = {
        id: Date.now().toString(),
        patientId: selectedPatient,
        patientName: patient.name,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileData,
        uploadDate: new Date().toISOString(),
        therapist: user?.name || 'Terapeuta',
        description,
        status: 'uploaded'
      };

      const updated = [newAnamnese, ...anamneses];
      saveAnamneses(updated);
      
      // Reset form
      setSelectedPatient('');
      setSelectedFile(null);
      setDescription('');
      setShowModal(false);
      
      success('Anamnese enviada com sucesso!');
    } catch (err) {
      error('Erro ao fazer upload do arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDownload = (anamnese: AnamneseFile) => {
    try {
      // Criar elemento de download
      const link = document.createElement('a');
      link.href = anamnese.fileData;
      link.download = anamnese.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success('Download iniciado!');
    } catch (err) {
      error('Erro ao baixar arquivo');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anamnese?')) {
      const updated = anamneses.filter(a => a.id !== id);
      saveAnamneses(updated);
      success('Anamnese excluída com sucesso!');
    }
  };

  const handleStatusChange = (id: string, status: AnamneseFile['status']) => {
    const updated = anamneses.map(a => 
      a.id === id ? { ...a, status } : a
    );
    saveAnamneses(updated);
    
    const statusLabels = {
      uploaded: 'carregada',
      reviewed: 'revisada',
      approved: 'aprovada'
    };
    
    success(`Anamnese marcada como ${statusLabels[status]}!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Carregada';
      case 'reviewed': return 'Revisada';
      case 'approved': return 'Aprovada';
      default: return status;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAnamneses = anamneses.filter(anamnese =>
    anamnese.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anamnese.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anamnese.therapist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-sapere-brown">Anamneses</h1>
          <p className="text-gray-600">Upload e gerenciamento de anamneses dos pacientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
          disabled={patients.length === 0}
        >
          <Plus className="h-4 w-4" />
          <span>Upload de Anamnese</span>
        </button>
      </div>

      {/* Aviso se não há pacientes */}
      {patients.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Nenhum paciente cadastrado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Você precisa cadastrar pacientes antes de fazer upload de anamneses.</p>
                <a href="/patients" className="font-medium underline hover:text-yellow-600">
                  Cadastrar pacientes agora →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-sapere-brown">{anamneses.length}</p>
            </div>
            <FileText className="h-8 w-8 text-sapere-orange" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Carregadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {anamneses.filter(a => a.status === 'uploaded').length}
              </p>
            </div>
            <Upload className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revisadas</p>
              <p className="text-2xl font-bold text-yellow-600">
                {anamneses.filter(a => a.status === 'reviewed').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">
                {anamneses.filter(a => a.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar anamneses..."
          className="pl-10 input-field"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Anamneses */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapere-orange"></div>
          </div>
        ) : filteredAnamneses.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma anamnese encontrada' : 'Nenhuma anamnese carregada'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Faça upload da primeira anamnese'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnamneses.map((anamnese) => (
              <div key={anamnese.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getFileIcon(anamnese.fileType)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {anamnese.patientName}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Arquivo:</strong> {anamnese.fileName}</p>
                        <p><strong>Tamanho:</strong> {formatFileSize(anamnese.fileSize)}</p>
                        <p><strong>Upload:</strong> {format(new Date(anamnese.uploadDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        <p><strong>Terapeuta:</strong> {anamnese.therapist}</p>
                        {anamnese.description && (
                          <p><strong>Descrição:</strong> {anamnese.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(anamnese.status)}`}>
                      {getStatusLabel(anamnese.status)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end items-center space-x-2">
                  <button
                    onClick={() => handleDownload(anamnese)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {anamnese.status === 'uploaded' && (
                    <button
                      onClick={() => handleStatusChange(anamnese.id, 'reviewed')}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                      title="Marcar como revisada"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  
                  {anamnese.status === 'reviewed' && (
                    <button
                      onClick={() => handleStatusChange(anamnese.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Aprovar"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(anamnese.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sapere-brown">Upload de Anamnese</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPatient('');
                    setSelectedFile(null);
                    setDescription('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Seleção de Paciente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecione o Paciente *
                  </label>
                  <select
                    className="input-field"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                  >
                    <option value="">Selecione um paciente...</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} {patient.responsible && `(Responsável: ${patient.responsible})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload de Arquivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo da Anamnese *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-sapere-orange transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-sapere-orange hover:text-sapere-brown focus-within:outline-none"
                        >
                          <span>Selecione um arquivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG até 10MB
                      </p>
                    </div>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(selectedFile.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                          <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione uma descrição sobre esta anamnese..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPatient('');
                    setSelectedFile(null);
                    setDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedPatient || !selectedFile || isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Fazer Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnamneseUpload;