import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../ui/use-toast';

interface DocumentViewerProps {
  documentId: string;
  filename: string;
  onClose?: () => void;
}

export function DocumentViewer({ documentId, filename, onClose }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load PDF document
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/documents/${documentId}/view`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erro ao carregar documento');
        }
      } catch (err) {
        setError('Erro de conexão ao carregar documento');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  const handleDownload = async () => {
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

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-gray-600">Carregando documento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-600 font-medium mb-2">Erro ao carregar documento</p>
            <p className="text-gray-600 text-sm">{error}</p>
            {onClose && (
              <Button variant="outline" onClick={onClose} className="mt-4">
                Fechar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white" 
    : "w-full";

  return (
    <div className={containerClass}>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {filename}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Navigation Controls */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="px-2 text-sm">
                  {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="px-2 text-sm">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Controls */}
              <Button variant="ghost" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={`p-0 ${isFullscreen ? 'h-full' : 'h-96'} overflow-auto bg-gray-100`}>
          {pdfUrl && (
            <div className="flex justify-center items-center h-full p-4">
              <div
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <iframe
                  src={`${pdfUrl}#page=${currentPage}`}
                  className="border border-gray-300 shadow-lg"
                  style={{
                    width: isFullscreen ? '80vw' : '100%',
                    height: isFullscreen ? '80vh' : '500px',
                    minHeight: '400px',
                  }}
                  title={filename}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for easier PDF viewing
export function usePDFViewer() {
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    documentId: string | null;
    filename: string | null;
  }>({
    isOpen: false,
    documentId: null,
    filename: null,
  });

  const openViewer = (documentId: string, filename: string) => {
    setViewerState({
      isOpen: true,
      documentId,
      filename,
    });
  };

  const closeViewer = () => {
    setViewerState({
      isOpen: false,
      documentId: null,
      filename: null,
    });
  };

  return {
    ...viewerState,
    openViewer,
    closeViewer,
  };
}