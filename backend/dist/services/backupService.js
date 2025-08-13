"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const stream_1 = require("stream");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
class BackupService {
    constructor() {
        this.config = {
            backupDir: process.env.BACKUP_DIR || './backups',
            retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
            compressionLevel: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
            maxBackupsPerDay: parseInt(process.env.MAX_BACKUPS_PER_DAY || '4')
        };
    }
    // Inicializar serviço de backup
    async initialize() {
        try {
            console.log('ℹ️ Serviço de backup desabilitado - PostgreSQL não suporta backup via arquivo');
            console.log('💡 Use pg_dump para fazer backup do PostgreSQL');
        }
        catch (error) {
            console.error('❌ Erro ao inicializar serviço de backup:', error);
        }
    }
    // Criar backup do banco de dados (desabilitado para PostgreSQL)
    async createBackup(type = 'manual') {
        throw new Error('Backup não disponível para PostgreSQL. Use pg_dump para fazer backup.');
    }
    // Restaurar backup (desabilitado para PostgreSQL)
    async restoreBackup(backupFilename) {
        throw new Error('Restore não disponível para PostgreSQL. Use pg_restore para restaurar backup.');
    }
    // Listar backups disponíveis (desabilitado para PostgreSQL)
    async listBackups() {
        return [];
    }
    // Limpar backups antigos (desabilitado para PostgreSQL)
    async cleanupOldBackups() {
        console.log('ℹ️ Limpeza de backups não aplicável para PostgreSQL');
    }
    // Verificar integridade do banco (desabilitado para PostgreSQL)
    async checkDatabaseIntegrity() {
        console.log('ℹ️ Verificação de integridade não aplicável para PostgreSQL via arquivo');
        return true;
    }
    // Otimizar banco de dados (desabilitado para PostgreSQL)
    async optimizeDatabase() {
        console.log('ℹ️ Otimização não aplicável para PostgreSQL via arquivo');
    }
    // Exportar dados para JSON (desabilitado)
    async exportToJson() {
        throw new Error('Exportação JSON não implementada para PostgreSQL');
    }
}
exports.backupService = new BackupService();
exports.default = exports.backupService;
//# sourceMappingURL=backupService.js.map