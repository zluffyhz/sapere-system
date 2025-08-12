"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Aplicar autenticação em todas as rotas
router.use(auth_1.authenticateToken);
/**
 * @route   POST /api/upload/record-attachments
 * @desc    Upload de anexos para prontuários
 * @access  Private (Therapists, Admin)
 */
router.post('/record-attachments', (0, auth_1.requireRole)(['therapist', 'admin']), upload_1.uploadRecordAttachments, upload_1.handleUploadError, async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado',
                code: 'NO_FILES'
            });
        }
        // Processar os arquivos uploadados
        const processedFiles = (0, upload_1.processUploads)(files);
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
    }
    catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
/**
 * @route   GET /api/upload/file/:filename
 * @desc    Servir arquivos uploadados
 * @access  Private (Therapists, Admin, Responsáveis autorizados)
 */
router.get('/file/:filename', (0, auth_1.requireRole)(['therapist', 'admin', 'responsible']), (0, express_validator_1.param)('filename').matches(/^[a-f0-9-]+\.[a-zA-Z0-9]+$/).withMessage('Nome de arquivo inválido'), validate_1.validateRequest, async (req, res) => {
    try {
        const { filename } = req.params;
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const filePath = path_1.default.join(uploadDir, filename);
        // Verificar se o arquivo existe
        if (!fs_1.default.existsSync(filePath)) {
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
        res.sendFile(path_1.default.resolve(filePath));
    }
    catch (error) {
        console.error('Erro ao servir arquivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
/**
 * @route   DELETE /api/upload/file/:filename
 * @desc    Excluir arquivo uploadado
 * @access  Private (Admin, próprio autor)
 */
router.delete('/file/:filename', (0, auth_1.requireRole)(['admin', 'therapist']), (0, express_validator_1.param)('filename').matches(/^[a-f0-9-]+\.[a-zA-Z0-9]+$/).withMessage('Nome de arquivo inválido'), validate_1.validateRequest, async (req, res) => {
    try {
        const { filename } = req.params;
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const filePath = path_1.default.join(uploadDir, filename);
        // Verificar se o arquivo existe
        if (!fs_1.default.existsSync(filePath)) {
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
        fs_1.default.unlinkSync(filePath);
        // TODO: Também remover a referência do banco de dados
        // se este arquivo estiver vinculado a algum registro
        res.json({
            success: true,
            message: 'Arquivo excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir arquivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map