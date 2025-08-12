import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream';

const execAsync = promisify(exec);
const pipelineAsync = promisify(pipeline);

interface BackupConfig {
  backupDir: string;
  retentionDays: number;
  compressionLevel: number;
  maxBackupsPerDay: number;
}

class BackupService {
  private config: BackupConfig;
  private dbPath: string;

  constructor() {
    this.config = {
      backupDir: process.env.BACKUP_DIR || './backups',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      compressionLevel: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
      maxBackupsPerDay: parseInt(process.env.MAX_BACKUPS_PER_DAY || '4')
    };
    
    this.dbPath = path.join(__dirname, '../../../sapere_dev.db');
  }

  // Inicializar serviço de backup
  async initialize() {
    try {
      // Criar diretório de backup se não existir
      await fs.mkdir(this.config.backupDir, { recursive: true });
      
      // Agendar backups automáticos
      this.scheduleAutomaticBackups();
      
      console.log('✅ Serviço de backup inicializado');
      console.log(`📁 Diretório de backup: ${this.config.backupDir}`);
      console.log(`🔄 Retenção: ${this.config.retentionDays} dias`);
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de backup:', error);
    }
  }

  // Criar backup do banco de dados
  async createBackup(type: 'manual' | 'automatic' = 'manual'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `sapere_backup_${type}_${timestamp}.db`;
    const backupPath = path.join(this.config.backupDir, backupName);
    const compressedPath = `${backupPath}.gz`;

    try {
      // Verificar se o arquivo de banco existe
      await fs.access(this.dbPath);

      // Criar backup usando SQLite dump ou cópia direta
      await this.createDatabaseBackup(backupPath);

      // Comprimir o backup
      await this.compressFile(backupPath, compressedPath);

      // Remover arquivo não comprimido
      await fs.unlink(backupPath);

      // Registrar backup no log
      await this.logBackup({
        filename: `${backupName}.gz`,
        path: compressedPath,
        size: (await fs.stat(compressedPath)).size,
        type,
        created_at: new Date().toISOString()
      });

      console.log(`✅ Backup criado: ${backupName}.gz`);
      return compressedPath;
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Criar backup do banco usando SQLite dump
  private async createDatabaseBackup(backupPath: string) {
    try {
      // Usar comando sqlite3 para dump
      const command = `sqlite3 "${this.dbPath}" ".backup '${backupPath}'"`;
      await execAsync(command);
    } catch (error) {
      // Fallback: cópia direta do arquivo
      console.warn('Fallback para cópia direta do banco');
      await fs.copyFile(this.dbPath, backupPath);
    }
  }

  // Comprimir arquivo
  private async compressFile(sourcePath: string, targetPath: string) {
    const gzip = createGzip({ level: this.config.compressionLevel });
    const source = createReadStream(sourcePath);
    const destination = createWriteStream(targetPath);

    await pipelineAsync(source, gzip, destination);
  }

  // Restaurar backup
  async restoreBackup(backupFilename: string): Promise<void> {
    const backupPath = path.join(this.config.backupDir, backupFilename);
    const tempDbPath = `${this.dbPath}.temp`;

    try {
      // Verificar se backup existe
      await fs.access(backupPath);

      // Descomprimir backup se necessário
      let sourceFile = backupPath;
      if (backupFilename.endsWith('.gz')) {
        sourceFile = await this.decompressFile(backupPath);
      }

      // Criar backup do banco atual
      const currentBackupPath = await this.createBackup('manual');
      console.log(`📦 Backup atual criado em: ${currentBackupPath}`);

      // Substituir banco atual pelo backup
      await fs.copyFile(sourceFile, tempDbPath);
      await fs.rename(tempDbPath, this.dbPath);

      // Limpar arquivo temporário descomprimido
      if (sourceFile !== backupPath) {
        await fs.unlink(sourceFile);
      }

      console.log(`✅ Banco restaurado a partir de: ${backupFilename}`);
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  // Descomprimir arquivo
  private async decompressFile(compressedPath: string): Promise<string> {
    const decompressedPath = compressedPath.replace('.gz', '');
    const source = createReadStream(compressedPath);
    const destination = createWriteStream(decompressedPath);
    const gunzip = createReadStream(compressedPath).pipe(require('zlib').createGunzip());

    await pipelineAsync(gunzip, destination);
    return decompressedPath;
  }

  // Listar backups disponíveis
  async listBackups(): Promise<Array<{ name: string; size: number; created: Date; type: string }>> {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles = files.filter(f => f.startsWith('sapere_backup_') && f.endsWith('.gz'));

      const backups = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = path.join(this.config.backupDir, file);
          const stats = await fs.stat(filePath);
          
          // Extrair tipo do nome do arquivo
          const typeMatch = file.match(/sapere_backup_(\w+)_/);
          const type = typeMatch ? typeMatch[1] : 'unknown';
          
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            type
          };
        })
      );

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      return [];
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      let deletedCount = 0;
      for (const backup of backups) {
        if (backup.created < cutoffDate) {
          const backupPath = path.join(this.config.backupDir, backup.name);
          await fs.unlink(backupPath);
          deletedCount++;
          console.log(`🗑️ Backup antigo removido: ${backup.name}`);
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ ${deletedCount} backup(s) antigo(s) removido(s)`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar backups antigos:', error);
    }
  }

  // Agendar backups automáticos
  private scheduleAutomaticBackups() {
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
        } else {
          console.log('📊 Limite de backups diários atingido');
        }
      } catch (error) {
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
  private async logBackup(backupInfo: any) {
    const logPath = path.join(this.config.backupDir, 'backup.log');
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(backupInfo)}\n`;
    
    try {
      await fs.appendFile(logPath, logEntry);
    } catch (error) {
      console.error('❌ Erro ao registrar log de backup:', error);
    }
  }

  // Verificar integridade do banco
  async checkDatabaseIntegrity(): Promise<boolean> {
    try {
      const command = `sqlite3 "${this.dbPath}" "PRAGMA integrity_check;"`;
      const { stdout } = await execAsync(command);
      return stdout.trim() === 'ok';
    } catch (error) {
      console.error('❌ Erro ao verificar integridade do banco:', error);
      return false;
    }
  }

  // Otimizar banco de dados
  async optimizeDatabase(): Promise<void> {
    try {
      const command = `sqlite3 "${this.dbPath}" "VACUUM; ANALYZE;"`;
      await execAsync(command);
      console.log('✅ Banco de dados otimizado');
    } catch (error) {
      console.error('❌ Erro ao otimizar banco:', error);
      throw error;
    }
  }

  // Exportar dados para JSON (backup legível)
  async exportToJson(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(this.config.backupDir, `sapere_export_${timestamp}.json`);

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

      await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`✅ Dados exportados para: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      throw error;
    }
  }
}

export const backupService = new BackupService();
export default backupService;