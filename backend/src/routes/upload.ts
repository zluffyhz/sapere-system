import express from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { uploadRecordAttachments, handleUploadError, processUploads } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @route   POST /api/upload/record-attachments
 * @desc    Upload de anexos para prontuários
 * @access  Private (Therapists, Admin)
 */
router.post('/record-attachments',
  requireRole(['therapist', 'admin']),
  uploadRecordAttachments,
  handleUploadError,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado',
          code: 'NO_FILES'
        });
      }

      // Processar os arquivos uploadados
      const processedFiles = processUploads(files);

      res.json({
        success: true,
        message: `${files.length} arquivo(s) enviado(s) com sucesso`,
        data: processedFiles.map(file => ({
          id: file.id,
          filename: file.filename,
          original_filename: file.original_filename,
          file_size: file.file_size,
          mime_type: file.mime_type,
          attachment_type: file.attachment_type,
          file_url: `/uploads/${file.filename}`, // URL relativa para acesso
          uploaded_at: file.uploaded_at
        }))
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

/**
 * @route   GET /api/upload/file/:filename
 * @desc    Servir arquivos uploadados
 * @access  Private (Therapists, Admin, Responsáveis autorizados)
 */
router.get('/file/:filename',
  requireRole(['therapist', 'admin', 'responsible']),
  param('filename').matches(/^[a-f0-9-]+\.[a-zA-Z0-9]+$/).withMessage('Nome de arquivo inválido'),
  validateRequest,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { filename } = req.params;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, filename!);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado',
          code: 'FILE_NOT_FOUND'
        });
        return;
      }

      // TODO: Implementar verificação de permissão
      // Verificar se o usuário tem permissão para acessar este arquivo
      // Isso requer consulta ao banco para verificar se o arquivo pertence
      // a um paciente que o usuário tem permissão de acessar

      // Servir o arquivo
      res.sendFile(path.resolve(filePath));

    } catch (error) {
      console.error('Erro ao servir arquivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

/**
 * @route   DELETE /api/upload/file/:filename
 * @desc    Excluir arquivo uploadado
 * @access  Private (Admin, próprio autor)
 */
router.delete('/file/:filename',
  requireRole(['admin', 'therapist']),
  param('filename').matches(/^[a-f0-9-]+\.[a-zA-Z0-9]+$/).withMessage('Nome de arquivo inválido'),
  validateRequest,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { filename } = req.params;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, filename!);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado',
          code: 'FILE_NOT_FOUND'
        });
        return;
      }

      // TODO: Verificar se o usuário tem permissão para excluir este arquivo
      // Implementar verificação de propriedade/permissão

      // Excluir o arquivo do sistema de arquivos
      fs.unlinkSync(filePath);

      // TODO: Também remover a referência do banco de dados
      // se este arquivo estiver vinculado a algum registro

      res.json({
        success: true,
        message: 'Arquivo excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

export default router;