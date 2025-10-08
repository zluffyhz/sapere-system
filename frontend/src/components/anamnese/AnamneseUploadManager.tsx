import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../ui/use-toast';

interface Document {
  id: string;
  patient_id: string;
  original_filename: string;
  file_size: number;
  version: number;
  uploaded_at: string;
  uploaded_by_name: string;
  status: 'processing' | 'ready' | 'error';
  document_type: string;
  tags: string[];
}

interface AnamneseUploadManagerProps {
  patientId: string;
  onDocumentUploaded?: (document: Document) => void;
}

export function AnamneseUploadManager({ patientId, onDocumentUploaded }: AnamneseUploadManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing documents
  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  }, [patientId]);

  // Load documents on mount
  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas arquivos PDF são permitidos.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_id', patientId);
      formData.append('document_type', 'anamnese');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Upload realizado com sucesso",
          description: `${file.name} foi enviado com sucesso.`,
        });

        // Refresh documents list
        fetchDocuments();
        onDocumentUploaded?.(result.document);
      } else {
        const error = await response.json();
        toast({
          title: "Erro no upload",
          description: error.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Handle download
  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o arquivo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Documento excluído",
          description: "O documento foi excluído com sucesso.",
        });
        fetchDocuments();
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o documento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos de Anamnese
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Arraste arquivos PDF aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Máximo 10MB por arquivo
          </p>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mb-2"
          >
            {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
          </Button>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Documentos</h3>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">{doc.original_filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.file_size)} • Versão {doc.version} • 
                      Enviado em {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                    </p>
                    {doc.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {doc.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status indicator */}
                  {doc.status === 'processing' && (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  {doc.status === 'ready' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {doc.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}

                  {/* Action buttons */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(doc.id, doc.original_filename)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/api/documents/${doc.id}/view`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>Nenhum documento de anamnese enviado ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}