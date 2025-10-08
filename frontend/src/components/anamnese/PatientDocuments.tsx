import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Tag,
  User,
  Download,
  Eye,
  Archive,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { DocumentViewer, usePDFViewer } from './DocumentViewer';
import { AnamneseUploadManager } from './AnamneseUploadManager';
import { toast } from '../ui/use-toast';

interface Document {
  id: string;
  patient_id: string;
  patient_name: string;
  original_filename: string;
  file_size: number;
  version: number;
  uploaded_at: string;
  uploaded_by_name: string;
  status: 'processing' | 'ready' | 'error';
  document_type: string;
  tags: string[];
  metadata?: Record<string, any>;
}

interface PatientGroup {
  patient_id: string;
  patient_name: string;
  documents: Document[];
  total_documents: number;
  latest_upload: string;
}

interface PatientDocumentsProps {
  patientId?: string; // If provided, show only documents for this patient
  showUploadManager?: boolean;
}

export function PatientDocuments({ patientId, showUploadManager = true }: PatientDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [patientGroups, setPatientGroups] = useState<PatientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientId || null);
  
  const { isOpen: isViewerOpen, documentId: viewerDocumentId, filename: viewerFilename, openViewer, closeViewer } = usePDFViewer();

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = patientId 
        ? `/api/documents/patient/${patientId}`
        : '/api/documents/search';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const docs = data.documents || [];
        setDocuments(docs);
        
        if (!patientId) {
          // Group documents by patient
          const grouped = groupDocumentsByPatient(docs);
          setPatientGroups(grouped);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

  // Group documents by patient
  const groupDocumentsByPatient = (docs: Document[]): PatientGroup[] => {
    const groups = docs.reduce((acc, doc) => {
      const patientId = doc.patient_id;
      if (!acc[patientId]) {
        acc[patientId] = {
          patient_id: patientId,
          patient_name: doc.patient_name,
          documents: [],
          total_documents: 0,
          latest_upload: doc.uploaded_at,
        };
      }
      
      acc[patientId].documents.push(doc);
      acc[patientId].total_documents++;
      
      // Update latest upload if this document is newer
      if (new Date(doc.uploaded_at) > new Date(acc[patientId].latest_upload)) {
        acc[patientId].latest_upload = doc.uploaded_at;
      }
      
      return acc;
    }, {} as Record<string, PatientGroup>);

    return Object.values(groups).sort((a, b) => 
      new Date(b.latest_upload).getTime() - new Date(a.latest_upload).getTime()
    );
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter patient groups
  const filteredPatientGroups = patientGroups.map(group => ({
    ...group,
    documents: group.documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
  })).filter(group => group.documents.length > 0);

  const togglePatientExpanded = (patientId: string) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedPatients(newExpanded);
  };

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
        
        toast({
          title: "Download concluído",
          description: `${filename} foi baixado com sucesso.`,
        });
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="mx-auto h-8 w-8 animate-pulse text-gray-400 mb-2" />
            <p className="text-gray-600">Carregando documentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {patientId ? 'Documentos do Paciente' : 'Todos os Documentos'}
            </CardTitle>
            
            {showUploadManager && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Enviar Documento
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome do arquivo, paciente ou tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ready">Pronto</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="anamnese">Anamnese</SelectItem>
                <SelectItem value="exame">Exame</SelectItem>
                <SelectItem value="relatorio">Relatório</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Manager */}
          {showUpload && showUploadManager && (
            <AnamneseUploadManager
              patientId={selectedPatientId || ''}
              onDocumentUploaded={() => {
                fetchDocuments();
                setShowUpload(false);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Documents Display */}
      {patientId ? (
        // Single patient view
        <Card>
          <CardContent className="p-0">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhum documento encontrado.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(doc.status)}
                        <div>
                          <p className="font-medium text-sm">{doc.original_filename}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>Versão {doc.version}</span>
                            <span>{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                            <span>por {doc.uploaded_by_name}</span>
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {doc.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openViewer(doc.id, doc.original_filename)}
                          disabled={doc.status !== 'ready'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc.id, doc.original_filename)}
                          disabled={doc.status !== 'ready'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Multiple patients view
        <div className="space-y-4">
          {filteredPatientGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhum documento encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPatientGroups.map((group) => (
              <Card key={group.patient_id}>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => togglePatientExpanded(group.patient_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedPatients.has(group.patient_id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{group.patient_name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {group.documents.length} documento(s) • 
                          Último envio: {new Date(group.latest_upload).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="outline">
                      {group.documents.length} documento(s)
                    </Badge>
                  </div>
                </CardHeader>
                
                {expandedPatients.has(group.patient_id) && (
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {group.documents.map((doc) => (
                        <div key={doc.id} className="py-3 first:pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(doc.status)}
                              <div>
                                <p className="font-medium text-sm">{doc.original_filename}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{formatFileSize(doc.file_size)}</span>
                                  <span>Versão {doc.version}</span>
                                  <span>{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                                  <span>por {doc.uploaded_by_name}</span>
                                </div>
                                {doc.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {doc.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openViewer(doc.id, doc.original_filename)}
                                disabled={doc.status !== 'ready'}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(doc.id, doc.original_filename)}
                                disabled={doc.status !== 'ready'}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {isViewerOpen && viewerDocumentId && viewerFilename && (
        <DocumentViewer
          documentId={viewerDocumentId}
          filename={viewerFilename}
          onClose={closeViewer}
        />
      )}
    </div>
  );
}