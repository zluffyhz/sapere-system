import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Diretório base para uploads
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, uploadDir);
  },
  
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Gerar nome único para o arquivo
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos permitidos para prontuários médicos
  const allowedMimeTypes = [
    // Imagens
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    
    // Vídeos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    
    // Áudios
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
    
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 10 // Máximo 10 arquivos por upload
  }
});

// Middleware para upload de arquivos de prontuário
export const uploadRecordAttachments = upload.array('attachments', 10);

// Middleware para upload de foto do paciente
export const uploadPatientPhoto = upload.single('photo');

// Middleware para upload de assinatura digital
export const uploadSignature = upload.single('signature');

// Função para validar e processar uploads
export const processUploads = (files: Express.Multer.File[]) => {
  return files.map(file => ({
    id: uuidv4(),
    filename: file.filename,
    original_filename: file.originalname,
    file_path: file.path,
    file_size: file.size,
    mime_type: file.mimetype,
    attachment_type: getAttachmentType(file.mimetype),
    uploaded_at: new Date()
  }));
};

// Função para determinar o tipo de anexo baseado no MIME type
function getAttachmentType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

// Middleware de erro para uploads
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo permitido: 10MB',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos. Máximo permitido: 10 arquivos',
        code: 'TOO_MANY_FILES'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de arquivo inesperado',
        code: 'UNEXPECTED_FILE'
      });
    }
  }

  if (error.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  // Erro genérico de upload
  return res.status(500).json({
    success: false,
    message: 'Erro no upload de arquivo',
    code: 'UPLOAD_ERROR',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};