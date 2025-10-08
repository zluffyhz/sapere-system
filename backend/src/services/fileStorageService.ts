import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface StorageConfig {
  baseDir: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  createThumbnails: boolean;
}

export interface FileInfo {
  id: string;
  originalName: string;
  storedName: string;
  path: string;
  size: number;
  mimeType: string;
  hash: string;
  metadata?: any;
}

export interface StorageResult {
  success: boolean;
  file?: FileInfo;
  error?: string;
}

export class FileStorageService {
  private config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      baseDir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      createThumbnails: false,
      ...config
    };
  }

  /**
   * Armazena um arquivo de forma organizada
   */
  async storeFile(
    file: Express.Multer.File, 
    patientId: string,
    options?: {
      subdirectory?: string;
      preserveOriginalName?: boolean;
      customPrefix?: string;
    }
  ): Promise<StorageResult> {
    try {
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Gerar informações do arquivo
      const fileId = uuidv4();
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      
      let storedName: string;
      if (options?.preserveOriginalName) {
        const safeName = this.sanitizeFileName(file.originalname);
        storedName = `${timestamp}_${fileId}_${safeName}`;
      } else {
        const prefix = options?.customPrefix || 'doc';
        storedName = `${timestamp}_${prefix}_${fileId}${extension}`;
      }

      // Construir caminho do diretório
      const subdirectory = options?.subdirectory || 'anamnese';
      const targetDir = path.join(this.config.baseDir, subdirectory, patientId);
      const targetPath = path.join(targetDir, storedName);

      // Criar diretório se não existir
      await fs.ensureDir(targetDir);

      // Calcular hash do arquivo
      const fileHash = await this.calculateFileHash(file.path);

      // Verificar se já existe arquivo com mesmo hash
      const existingFile = await this.findFileByHash(fileHash, patientId);
      if (existingFile) {
        // Arquivo duplicado encontrado - remover arquivo temporário
        await fs.remove(file.path);
        return {
          success: true,
          file: existingFile
        };
      }

      // Mover arquivo para destino final
      await fs.move(file.path, targetPath);

      // Extrair metadados se for PDF
      let metadata = {};
      if (file.mimetype === 'application/pdf') {
        metadata = await this.extractPdfMetadata(targetPath);
      }

      const fileInfo: FileInfo = {
        id: fileId,
        originalName: file.originalname,
        storedName,
        path: targetPath,
        size: file.size,
        mimeType: file.mimetype,
        hash: fileHash,
        metadata
      };

      console.log('✅ Arquivo armazenado:', storedName, 'para paciente:', patientId);

      return { success: true, file: fileInfo };

    } catch (error) {
      console.error('Erro ao armazenar arquivo:', error);
      return { 
        success: false, 
        error: 'Erro interno no armazenamento de arquivo' 
      };
    }
  }

  /**
   * Recupera um arquivo do armazenamento
   */
  async getFile(filePath: string): Promise<{ exists: boolean; stream?: fs.ReadStream; stats?: fs.Stats }> {
    try {
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        return { exists: false };
      }

      const stats = await fs.stat(filePath);
      const stream = fs.createReadStream(filePath);

      return { exists: true, stream, stats };

    } catch (error) {
      console.error('Erro ao recuperar arquivo:', error);
      return { exists: false };
    }
  }

  /**
   * Remove um arquivo do armazenamento
   */
  async deleteFile(filePath: string, createBackup = true): Promise<boolean> {
    try {
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        return true;
      }

      if (createBackup) {
        const backupDir = path.join(this.config.baseDir, 'deleted');
        const backupPath = path.join(backupDir, `${Date.now()}_${path.basename(filePath)}`);
        await fs.ensureDir(backupDir);
        await fs.move(filePath, backupPath);
        console.log('📦 Arquivo movido para backup:', backupPath);
      } else {
        await fs.remove(filePath);
        console.log('🗑️  Arquivo removido permanentemente:', filePath);
      }

      return true;

    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      return false;
    }
  }

  /**
   * Cria uma cópia/versão de um arquivo existente
   */
  async createFileVersion(
    originalFilePath: string, 
    newFile: Express.Multer.File,
    patientId: string,
    version: number
  ): Promise<StorageResult> {
    try {
      const validation = this.validateFile(newFile);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const fileId = uuidv4();
      const timestamp = Date.now();
      const extension = path.extname(newFile.originalname);
      const versionedName = `${timestamp}_v${version}_${fileId}${extension}`;

      // Usar mesmo diretório do arquivo original
      const targetDir = path.dirname(originalFilePath);
      const targetPath = path.join(targetDir, versionedName);

      // Calcular hash
      const fileHash = await this.calculateFileHash(newFile.path);

      // Mover arquivo
      await fs.move(newFile.path, targetPath);

      // Extrair metadados se for PDF
      let metadata = {};
      if (newFile.mimetype === 'application/pdf') {
        metadata = await this.extractPdfMetadata(targetPath);
      }

      const fileInfo: FileInfo = {
        id: fileId,
        originalName: newFile.originalname,
        storedName: versionedName,
        path: targetPath,
        size: newFile.size,
        mimeType: newFile.mimetype,
        hash: fileHash,
        metadata
      };

      console.log('✅ Versão criada:', versionedName, 'v', version);

      return { success: true, file: fileInfo };

    } catch (error) {
      console.error('Erro ao criar versão:', error);
      return { success: false, error: 'Erro ao criar versão do arquivo' };
    }
  }

  /**
   * Valida um arquivo antes do armazenamento
   */
  private validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'Arquivo não fornecido' };
    }

    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      return { 
        valid: false, 
        error: `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB` 
      };
    }

    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      return { 
        valid: false, 
        error: `Tipo de arquivo não permitido: ${file.mimetype}` 
      };
    }

    return { valid: true };
  }

  /**
   * Sanitiza nome do arquivo removendo caracteres perigosos
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 200); // Limitar tamanho
  }

  /**
   * Calcula hash SHA-256 do arquivo
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Extrai metadados de PDF (simulado - seria implementado com pdf-parse)
   */
  private async extractPdfMetadata(filePath: string): Promise<any> {
    try {
      // TODO: Implementar com pdf-parse ou library similar
      const stats = await fs.stat(filePath);
      return {
        pages: null, // Será extraído do PDF
        title: null,
        author: null,
        subject: null,
        creator: null,
        created: null,
        modified: stats.mtime,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao extrair metadados PDF:', error);
      return {};
    }
  }

  /**
   * Procura arquivo por hash para detectar duplicatas
   */
  private async findFileByHash(hash: string, patientId: string): Promise<FileInfo | null> {
    try {
      // TODO: Implementar busca no banco de dados por hash
      // Esta é uma implementação básica - em produção seria feito no banco
      return null;
    } catch (error) {
      console.error('Erro ao buscar arquivo por hash:', error);
      return null;
    }
  }

  /**
   * Limpa arquivos temporários antigos
   */
  async cleanupTempFiles(olderThanHours = 24): Promise<void> {
    try {
      const tempDir = path.join(this.config.baseDir, 'temp');
      const exists = await fs.pathExists(tempDir);
      if (!exists) return;

      const files = await fs.readdir(tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.remove(filePath);
          console.log('🧹 Arquivo temporário removido:', file);
        }
      }

    } catch (error) {
      console.error('Erro na limpeza de arquivos temporários:', error);
    }
  }

  /**
   * Obter estatísticas de uso de armazenamento
   */
  async getStorageStats(patientId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    averageSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
  }> {
    try {
      const baseDir = patientId 
        ? path.join(this.config.baseDir, 'anamnese', patientId)
        : path.join(this.config.baseDir, 'anamnese');

      if (!await fs.pathExists(baseDir)) {
        return {
          totalFiles: 0,
          totalSize: 0,
          averageSize: 0,
          oldestFile: null,
          newestFile: null
        };
      }

      const files = await this.getAllFiles(baseDir);
      const stats = await Promise.all(
        files.map(async (file) => await fs.stat(file))
      );

      const totalFiles = files.length;
      const totalSize = stats.reduce((sum, stat) => sum + stat.size, 0);
      const averageSize = totalFiles > 0 ? totalSize / totalFiles : 0;

      const times = stats.map(stat => stat.mtime.getTime());
      const oldestFile = totalFiles > 0 ? new Date(Math.min(...times)) : null;
      const newestFile = totalFiles > 0 ? new Date(Math.max(...times)) : null;

      return {
        totalFiles,
        totalSize,
        averageSize: Math.round(averageSize),
        oldestFile,
        newestFile
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de armazenamento:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        averageSize: 0,
        oldestFile: null,
        newestFile: null
      };
    }
  }

  /**
   * Busca recursiva por arquivos em um diretório
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Instância singleton do serviço
export const fileStorageService = new FileStorageService();