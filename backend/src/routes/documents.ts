import { Router } from 'express';
import { authenticateToken, requireTherapistOrAdmin, AuthRequest } from '../middleware/auth';
import { uploadRecordAttachments, uploadSingleDocument, handleUploadError } from '../middleware/upload';
import {
  uploadDocument,
  getPatientDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  createNewVersion,
  getDocumentVersions,
  deleteDocument,
  searchDocuments,
  getDocumentStats
} from '../controllers/documentController';

const router = Router();

// Rota de teste sem autenticação
router.get('/test', (req, res) => {
  res.json({
    message: 'Sistema de documentos funcionando!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    features: {
      'upload_real': 'Upload real de PDFs habilitado',
      'versioning': 'Sistema de versionamento ativo',
      'organization': 'Organização por paciente',
      'download': 'Download e visualização disponível'
    },
    endpoints: {
      'upload': 'POST /api/documents/upload',
      'list_by_patient': 'GET /api/documents/patient/:patientId',
      'get_document': 'GET /api/documents/:id',
      'download': 'GET /api/documents/:id/download',
      'update': 'PUT /api/documents/:id',
      'new_version': 'POST /api/documents/:parentId/version',
      'versions': 'GET /api/documents/:id/versions',
      'delete': 'DELETE /api/documents/:id',
      'search': 'GET /api/documents/search',
      'stats': 'GET /api/documents/stats'
    }
  });
});

// Aplicar autenticação para todas as outras rotas
router.use(authenticateToken);
router.use(requireTherapistOrAdmin);

// Upload de documento
router.post('/upload', 
  uploadSingleDocument,
  handleUploadError,
  uploadDocument
);

// Listar documentos por paciente
router.get('/patient/:patientId', getPatientDocuments);

// Buscar documento por ID
router.get('/:id', getDocumentById);

// Download de documento
router.get('/:id/download', downloadDocument);

// Atualizar metadados do documento
router.put('/:id', updateDocument);

// Criar nova versão
router.post('/:parentId/version', 
  uploadRecordAttachments,
  handleUploadError,
  createNewVersion
);

// Listar versões do documento
router.get('/:id/versions', getDocumentVersions);

// Excluir documento
router.delete('/:id', deleteDocument);

// Buscar documentos com filtros
router.get('/search', searchDocuments);

// Obter estatísticas
router.get('/stats', getDocumentStats);

// Rota para limpar arquivos temporários (admin apenas)
router.post('/cleanup', async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem executar limpeza' });
    }

    const { fileStorageService } = await import('../services/fileStorageService');
    await fileStorageService.cleanupTempFiles();

    res.json({ message: 'Limpeza de arquivos temporários executada' });
  } catch (error) {
    console.error('Erro na limpeza:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas de armazenamento (admin apenas)
router.get('/storage/stats', async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { patient_id } = req.query;
    const { fileStorageService } = await import('../services/fileStorageService');
    const stats = await fileStorageService.getStorageStats(patient_id as string);

    res.json({ storage: stats });
  } catch (error) {
    console.error('Erro ao obter estatísticas de armazenamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas de versionamento
router.get('/versioning/stats', async (req: AuthRequest, res) => {
  try {
    const { versioningService } = await import('../services/versioningService');
    const stats = await versioningService.getVersioningStats();

    res.json({ versioning: stats });
  } catch (error) {
    console.error('Erro ao obter estatísticas de versionamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para comparar versões
router.get('/:id1/compare/:id2', async (req: AuthRequest, res) => {
  try {
    const { id1, id2 } = req.params;
    const { versioningService } = await import('../services/versioningService');
    const comparison = await versioningService.compareVersions(id1, id2);

    if (!comparison) {
      return res.status(404).json({ error: 'Não foi possível comparar as versões' });
    }

    res.json({ comparison });
  } catch (error) {
    console.error('Erro ao comparar versões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para reverter para versão anterior
router.post('/:id/revert/:version', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { id, version } = req.params;
    const { versioningService } = await import('../services/versioningService');
    
    const result = await versioningService.revertToVersion(
      id, 
      parseInt(version), 
      req.user.id
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: `Revertido para versão ${version} com sucesso` });
  } catch (error) {
    console.error('Erro ao reverter versão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para limpeza de versões antigas (admin apenas)
router.post('/versioning/cleanup', async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem executar limpeza' });
    }

    const { 
      maxVersions = 10, 
      maxAgeInDays = 365, 
      dryRun = false 
    } = req.body;

    const { versioningService } = await import('../services/versioningService');
    const result = await versioningService.cleanupOldVersions(
      maxVersions,
      maxAgeInDays,
      dryRun
    );

    res.json({
      message: dryRun ? 'Simulação de limpeza executada' : 'Limpeza de versões executada',
      result
    });
  } catch (error) {
    console.error('Erro na limpeza de versões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros específico para uploads
router.use((error: any, req: any, res: any, next: any) => {
  if (error) {
    console.error('Erro nas rotas de documentos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no processamento de documentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  next();
});

export default router;