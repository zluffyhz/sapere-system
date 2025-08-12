"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = require("fs");
const zlib_1 = require("zlib");
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
        this.dbPath = path_1.default.join(__dirname, '../../../sapere_dev.db');
    }
    // Inicializar serviço de backup
    async initialize() {
        try {
            // Criar diretório de backup se não existir
            await promises_1.default.mkdir(this.config.backupDir, { recursive: true });
            // Agendar backups automáticos
            this.scheduleAutomaticBackups();
            console.log('✅ Serviço de backup inicializado');
            console.log(`📁 Diretório de backup: ${this.config.backupDir}`);
            console.log(`🔄 Retenção: ${this.config.retentionDays} dias`);
        }
        catch (error) {
            console.error('❌ Erro ao inicializar serviço de backup:', error);
        }
    }
    // Criar backup do banco de dados
    async createBackup(type = 'manual') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `sapere_backup_${type}_${timestamp}.db`;
        const backupPath = path_1.default.join(this.config.backupDir, backupName);
        const compressedPath = `${backupPath}.gz`;
        try {
            // Verificar se o arquivo de banco existe
            await promises_1.default.access(this.dbPath);
            // Criar backup usando SQLite dump ou cópia direta
            await this.createDatabaseBackup(backupPath);
            // Comprimir o backup
            await this.compressFile(backupPath, compressedPath);
            // Remover arquivo não comprimido
            await promises_1.default.unlink(backupPath);
            // Registrar backup no log
            await this.logBackup({
                filename: `${backupName}.gz`,
                path: compressedPath,
                size: (await promises_1.default.stat(compressedPath)).size,
                type,
                created_at: new Date().toISOString()
            });
            console.log(`✅ Backup criado: ${backupName}.gz`);
            return compressedPath;
        }
        catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            throw error;
        }
    }
    // Criar backup do banco usando SQLite dump
    async createDatabaseBackup(backupPath) {
        try {
            // Usar comando sqlite3 para dump
            const command = `sqlite3 "${this.dbPath}" ".backup '${backupPath}'"`;
            await execAsync(command);
        }
        catch (error) {
            // Fallback: cópia direta do arquivo
            console.warn('Fallback para cópia direta do banco');
            await promises_1.default.copyFile(this.dbPath, backupPath);
        }
    }
    // Comprimir arquivo
    async compressFile(sourcePath, targetPath) {
        const gzip = (0, zlib_1.createGzip)({ level: this.config.compressionLevel });
        const source = (0, fs_1.createReadStream)(sourcePath);
        const destination = (0, fs_1.createWriteStream)(targetPath);
        await pipelineAsync(source, gzip, destination);
    }
    // Restaurar backup
    async restoreBackup(backupFilename) {
        const backupPath = path_1.default.join(this.config.backupDir, backupFilename);
        const tempDbPath = `${this.dbPath}.temp`;
        try {
            // Verificar se backup existe
            await promises_1.default.access(backupPath);
            // Descomprimir backup se necessário
            let sourceFile = backupPath;
            if (backupFilename.endsWith('.gz')) {
                sourceFile = await this.decompressFile(backupPath);
            }
            // Criar backup do banco atual
            const currentBackupPath = await this.createBackup('manual');
            console.log(`📦 Backup atual criado em: ${currentBackupPath}`);
            // Substituir banco atual pelo backup
            await promises_1.default.copyFile(sourceFile, tempDbPath);
            await promises_1.default.rename(tempDbPath, this.dbPath);
            // Limpar arquivo temporário descomprimido
            if (sourceFile !== backupPath) {
                await promises_1.default.unlink(sourceFile);
            }
            console.log(`✅ Banco restaurado a partir de: ${backupFilename}`);
        }
        catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            throw error;
        }
    }
    // Descomprimir arquivo
    async decompressFile(compressedPath) {
        const decompressedPath = compressedPath.replace('.gz', '');
        const source = (0, fs_1.createReadStream)(compressedPath);
        const destination = (0, fs_1.createWriteStream)(decompressedPath);
        const gunzip = (0, fs_1.createReadStream)(compressedPath).pipe(require('zlib').createGunzip());
        await pipelineAsync(gunzip, destination);
        return decompressedPath;
    }
    // Listar backups disponíveis
    async listBackups() {
        try {
            const files = await promises_1.default.readdir(this.config.backupDir);
            const backupFiles = files.filter(f => f.startsWith('sapere_backup_') && f.endsWith('.gz'));
            const backups = await Promise.all(backupFiles.map(async (file) => {
                const filePath = path_1.default.join(this.config.backupDir, file);
                const stats = await promises_1.default.stat(filePath);
                // Extrair tipo do nome do arquivo
                const typeMatch = file.match(/sapere_backup_(\w+)_/);
                const type = typeMatch ? typeMatch[1] : 'unknown';
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    type
                };
            }));
            return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
        }
        catch (error) {
            console.error('❌ Erro ao listar backups:', error);
            return [];
        }
    }
    // Limpar backups antigos
    async cleanupOldBackups() {
        try {
            const backups = await this.listBackups();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
            let deletedCount = 0;
            for (const backup of backups) {
                if (backup.created < cutoffDate) {
                    const backupPath = path_1.default.join(this.config.backupDir, backup.name);
                    await promises_1.default.unlink(backupPath);
                    deletedCount++;
                    console.log(`🗑️ Backup antigo removido: ${backup.name}`);
                }
            }
            if (deletedCount > 0) {
                console.log(`✅ ${deletedCount} backup(s) antigo(s) removido(s)`);
            }
        }
        catch (error) {
            console.error('❌ Erro ao limpar backups antigos:', error);
        }
    }
    // Agendar backups automáticos
    scheduleAutomaticBackups() {
        // Backup a cada 6 horas
        setInterval(async () => {
            try {
                const backups = await this.listBackups();
                const todayBackups = backups.filter(b => {
                    const today = new Date().toDateString();
                    return b.created.toDateString() === today && b.type === 'automatic';
                });
                if (todayBackups.length < this.config.maxBackupsPerDay) {
                    await this.createBackup('automatic');
                }
                else {
                    console.log('📊 Limite de backups diários atingido');
                }
            }
            catch (error) {
                console.error('❌ Erro no backup automático:', error);
            }
        }, 6 * 60 * 60 * 1000); // 6 horas
        // Limpeza de backups antigos a cada 24 horas
        setInterval(async () => {
            await this.cleanupOldBackups();
        }, 24 * 60 * 60 * 1000); // 24 horas
        console.log('⏰ Backups automáticos agendados (a cada 6 horas)');
        console.log('⏰ Limpeza automática agendada (a cada 24 horas)');
    }
    // Registrar backup no log
    async logBackup(backupInfo) {
        const logPath = path_1.default.join(this.config.backupDir, 'backup.log');
        const logEntry = `${new Date().toISOString()} - ${JSON.stringify(backupInfo)}\n`;
        try {
            await promises_1.default.appendFile(logPath, logEntry);
        }
        catch (error) {
            console.error('❌ Erro ao registrar log de backup:', error);
        }
    }
    // Verificar integridade do banco
    async checkDatabaseIntegrity() {
        try {
            const command = `sqlite3 "${this.dbPath}" "PRAGMA integrity_check;"`;
            const { stdout } = await execAsync(command);
            return stdout.trim() === 'ok';
        }
        catch (error) {
            console.error('❌ Erro ao verificar integridade do banco:', error);
            return false;
        }
    }
    // Otimizar banco de dados
    async optimizeDatabase() {
        try {
            const command = `sqlite3 "${this.dbPath}" "VACUUM; ANALYZE;"`;
            await execAsync(command);
            console.log('✅ Banco de dados otimizado');
        }
        catch (error) {
            console.error('❌ Erro ao otimizar banco:', error);
            throw error;
        }
    }
    // Exportar dados para JSON (backup legível)
    async exportToJson() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportPath = path_1.default.join(this.config.backupDir, `sapere_export_${timestamp}.json`);
        try {
            // Aqui você implementaria a exportação das tabelas
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                tables: {
                    users: [], // Implementar query das tabelas
                    patients: [],
                    appointments: [],
                    records: []
                }
            };
            await promises_1.default.writeFile(exportPath, JSON.stringify(exportData, null, 2));
            console.log(`✅ Dados exportados para: ${exportPath}`);
            return exportPath;
        }
        catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            throw error;
        }
    }
}
exports.backupService = new BackupService();
exports.default = exports.backupService;
//# sourceMappingURL=backupService.js.map