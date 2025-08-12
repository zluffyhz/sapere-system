"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.processUploads = exports.uploadSignature = exports.uploadPatientPhoto = exports.uploadRecordAttachments = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Configuração do storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Diretório base para uploads
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para o arquivo
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
};
// Configuração do multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por arquivo
        files: 10 // Máximo 10 arquivos por upload
    }
});
// Middleware para upload de arquivos de prontuário
exports.uploadRecordAttachments = exports.upload.array('attachments', 10);
// Middleware para upload de foto do paciente
exports.uploadPatientPhoto = exports.upload.single('photo');
// Middleware para upload de assinatura digital
exports.uploadSignature = exports.upload.single('signature');
// Função para validar e processar uploads
const processUploads = (files) => {
    return files.map(file => ({
        id: (0, uuid_1.v4)(),
        filename: file.filename,
        original_filename: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        attachment_type: getAttachmentType(file.mimetype),
        uploaded_at: new Date()
    }));
};
exports.processUploads = processUploads;
// Função para determinar o tipo de anexo baseado no MIME type
function getAttachmentType(mimeType) {
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('video/'))
        return 'video';
    if (mimeType.startsWith('audio/'))
        return 'audio';
    return 'document';
}
// Middleware de erro para uploads
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.js.map