import { query } from '../database/config/database';
import { fileStorageService } from './fileStorageService';
import { AnamneseDocument } from '../controllers/documentController';

export interface VersionInfo {
  version: number;
  isLatest: boolean;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  description?: string;
  fileSize: number;
  changes?: string[];
}

export interface VersionComparisonResult {
  oldVersion: VersionInfo;
  newVersion: VersionInfo;
  differences: {
    metadata: any;
    fileSize: { old: number; new: number; change: number };
    timestamp: { old: Date; new: Date };
  };
}

export class VersioningService {
  
  /**
   * Cria uma nova versão de um documento existente
   */
  async createNewVersion(
    parentDocumentId: string,
    newFile: Express.Multer.File,
    userId: string,
    options?: {
      description?: string;
      changes?: string[];
      preservePrevious?: boolean;
    }
  ): Promise<{ success: boolean; version?: AnamneseDocument; error?: string }> {
    try {
      // Buscar documento pai
      const parentResult = await query(
        'SELECT * FROM anamnese_documents WHERE id = $1 AND status = $2',
        [parentDocumentId, 'active']
      );

      if (!parentResult.rows || parentResult.rows.length === 0) {
        return { success: false, error: 'Documento pai não encontrado' };
      }

      const parentDocument = parentResult.rows[0];
      
      // Determinar próximo número de versão
      const nextVersion = await this.getNextVersionNumber(
        parentDocument.patient_id, 
        parentDocument.document_type
      );

      // Armazenar arquivo usando FileStorageService
      const storageResult = await fileStorageService.createFileVersion(
        parentDocument.file_path,
        newFile,
        parentDocument.patient_id,
        nextVersion
      );

      if (!storageResult.success) {
        return { success: false, error: storageResult.error };
      }

      const fileInfo = storageResult.file!;

      // Inserir nova versão no banco
      const insertResult = await query(`
        INSERT INTO anamnese_documents (
          id, patient_id, original_filename, stored_filename, file_path,
          file_size, mime_type, document_type, title, description,
          tags, status, visibility, version, parent_document_id,
          is_latest_version, uploaded_by, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        fileInfo.id,
        parentDocument.patient_id,
        fileInfo.originalName,
        fileInfo.storedName,
        fileInfo.path,
        fileInfo.size,
        fileInfo.mimeType,
        parentDocument.document_type,
        parentDocument.title,
        options?.description || `Versão ${nextVersion}`,
        parentDocument.tags,
        'active',
        parentDocument.visibility,
        nextVersion,
        parentDocumentId,
        true, // Nova versão é sempre a mais recente
        userId,
        fileInfo.metadata || {}
      ]);

      const newVersion = insertResult.rows[0];

      // Registrar mudanças se fornecidas
      if (options?.changes && options.changes.length > 0) {
        await this.logVersionChanges(newVersion.id, options.changes, userId);
      }

      console.log('✅ Nova versão criada:', nextVersion, 'para documento:', parentDocumentId);

      return { success: true, version: newVersion };

    } catch (error) {
      console.error('Erro ao criar nova versão:', error);
      return { 
        success: false, 
        error: 'Erro interno ao criar versão do documento' 
      };
    }
  }

  /**
   * Lista todas as versões de um documento
   */
  async getVersionHistory(documentId: string): Promise<VersionInfo[]> {
    try {
      // Buscar documento base para determinar família de versões
      const baseResult = await query(
        'SELECT id, parent_document_id FROM anamnese_documents WHERE id = $1',
        [documentId]
      );

      if (!baseResult.rows || baseResult.rows.length === 0) {
        return [];
      }

      const baseDoc = baseResult.rows[0];
      const rootId = baseDoc.parent_document_id || documentId;

      // Buscar todas as versões da família
      const result = await query(`
        SELECT 
          d.*,
          u.name as created_by_name,
          COALESCE(
            (SELECT string_agg(change_description, '; ') 
             FROM anamnese_document_history 
             WHERE document_id = d.id AND action_type = 'version_create'), 
            ''
          ) as changes
        FROM anamnese_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE (d.id = $1 OR d.parent_document_id = $1 OR 
               (d.parent_document_id = $2 OR d.id = $2))
        AND d.status != 'deleted'
        ORDER BY d.version ASC
      `, [rootId, baseDoc.parent_document_id]);

      return result.rows.map(row => ({
        version: row.version,
        isLatest: row.is_latest_version,
        createdAt: row.uploaded_at,
        createdBy: row.uploaded_by,
        createdByName: row.created_by_name,
        description: row.description,
        fileSize: row.file_size,
        changes: row.changes ? row.changes.split('; ').filter(c => c.trim()) : []
      }));

    } catch (error) {
      console.error('Erro ao buscar histórico de versões:', error);
      return [];
    }
  }

  /**
   * Compara duas versões de um documento
   */
  async compareVersions(
    documentId1: string, 
    documentId2: string
  ): Promise<VersionComparisonResult | null> {
    try {
      const result = await query(`
        SELECT 
          d.*,
          u.name as created_by_name
        FROM anamnese_documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.id IN ($1, $2)
        ORDER BY d.version ASC
      `, [documentId1, documentId2]);

      if (!result.rows || result.rows.length !== 2) {
        return null;
      }

      const [oldDoc, newDoc] = result.rows;

      return {
        oldVersion: {
          version: oldDoc.version,
          isLatest: oldDoc.is_latest_version,
          createdAt: oldDoc.uploaded_at,
          createdBy: oldDoc.uploaded_by,
          createdByName: oldDoc.created_by_name,
          description: oldDoc.description,
          fileSize: oldDoc.file_size
        },
        newVersion: {
          version: newDoc.version,
          isLatest: newDoc.is_latest_version,
          createdAt: newDoc.uploaded_at,
          createdBy: newDoc.uploaded_by,
          createdByName: newDoc.created_by_name,
          description: newDoc.description,
          fileSize: newDoc.file_size
        },
        differences: {
          metadata: this.compareMetadata(oldDoc.metadata, newDoc.metadata),
          fileSize: {
            old: oldDoc.file_size,
            new: newDoc.file_size,
            change: newDoc.file_size - oldDoc.file_size
          },
          timestamp: {
            old: oldDoc.uploaded_at,
            new: newDoc.uploaded_at
          }
        }
      };

    } catch (error) {
      console.error('Erro ao comparar versões:', error);
      return null;
    }
  }

  /**
   * Reverte para uma versão anterior (marca como versão mais recente)
   */
  async revertToVersion(
    documentId: string, 
    targetVersion: number, 
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Buscar documento da versão alvo
      const targetResult = await query(
        'SELECT * FROM anamnese_documents WHERE id = $1 OR (parent_document_id = $1 AND version = $2)',
        [documentId, targetVersion]
      );

      if (!targetResult.rows || targetResult.rows.length === 0) {
        return { success: false, error: 'Versão alvo não encontrada' };
      }

      const targetDoc = targetResult.rows.find(doc => doc.version === targetVersion);
      if (!targetDoc) {
        return { success: false, error: 'Versão específica não encontrada' };
      }

      // Desmarcar versão atual como latest
      await query(
        'UPDATE anamnese_documents SET is_latest_version = FALSE WHERE parent_document_id = $1 OR id = $1',
        [documentId]
      );

      // Marcar versão alvo como latest
      await query(
        'UPDATE anamnese_documents SET is_latest_version = TRUE WHERE id = $1',
        [targetDoc.id]
      );

      // Registrar ação
      await query(`
        INSERT INTO anamnese_document_history (
          document_id, action_type, action_description, performed_by
        ) VALUES ($1, $2, $3, $4)
      `, [
        targetDoc.id, 
        'version_revert', 
        `Revertido para versão ${targetVersion}`, 
        userId
      ]);

      console.log('✅ Revertido para versão:', targetVersion, 'do documento:', documentId);

      return { success: true };

    } catch (error) {
      console.error('Erro ao reverter versão:', error);
      return { success: false, error: 'Erro interno ao reverter versão' };
    }
  }

  /**
   * Remove versões antigas baseado em política de retenção
   */
  async cleanupOldVersions(
    maxVersionsPerDocument = 10,
    maxAgeInDays = 365,
    dryRun = false
  ): Promise<{ removed: number; errors: string[] }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

      // Buscar documentos com muitas versões ou versões antigas
      const candidatesResult = await query(`
        WITH version_counts AS (
          SELECT 
            COALESCE(parent_document_id, id) as root_id,
            COUNT(*) as version_count,
            array_agg(id ORDER BY version DESC) as version_ids,
            array_agg(version ORDER BY version DESC) as version_numbers
          FROM anamnese_documents 
          WHERE status = 'active'
          GROUP BY COALESCE(parent_document_id, id)
        )
        SELECT 
          root_id,
          version_count,
          version_ids,
          version_numbers
        FROM version_counts
        WHERE version_count > $1
        
        UNION
        
        SELECT DISTINCT
          COALESCE(d.parent_document_id, d.id) as root_id,
          1 as version_count,
          ARRAY[d.id] as version_ids,
          ARRAY[d.version] as version_numbers
        FROM anamnese_documents d
        WHERE d.uploaded_at < $2 
        AND d.is_latest_version = FALSE
        AND d.status = 'active'
      `, [maxVersionsPerDocument, cutoffDate]);

      let removed = 0;
      const errors: string[] = [];

      for (const candidate of candidatesResult.rows) {
        try {
          const { version_ids, version_numbers, version_count } = candidate;
          
          // Se tem muitas versões, remover as mais antigas (exceto as últimas N)
          if (version_count > maxVersionsPerDocument) {
            const toRemove = version_ids.slice(maxVersionsPerDocument);
            
            for (const versionId of toRemove) {
              if (!dryRun) {
                await this.safeDeleteVersion(versionId);
              }
              removed++;
            }
          }
          
        } catch (error) {
          errors.push(`Erro ao processar documento ${candidate.root_id}: ${error}`);
        }
      }

      if (!dryRun) {
        console.log(`✅ Limpeza de versões concluída: ${removed} versões removidas`);
      } else {
        console.log(`🧪 Simulação: ${removed} versões seriam removidas`);
      }

      return { removed, errors };

    } catch (error) {
      console.error('Erro na limpeza de versões:', error);
      return { removed: 0, errors: [error.message] };
    }
  }

  /**
   * Obter próximo número de versão para um documento
   */
  private async getNextVersionNumber(patientId: string, documentType: string): Promise<number> {
    const result = await query(`
      SELECT COALESCE(MAX(version), 0) + 1 as next_version
      FROM anamnese_documents
      WHERE patient_id = $1 AND document_type = $2
    `, [patientId, documentType]);

    return result.rows[0].next_version;
  }

  /**
   * Registra mudanças específicas de uma versão
   */
  private async logVersionChanges(
    documentId: string, 
    changes: string[], 
    userId: string
  ): Promise<void> {
    for (const change of changes) {
      await query(`
        INSERT INTO anamnese_document_history (
          document_id, action_type, action_description, performed_by
        ) VALUES ($1, $2, $3, $4)
      `, [documentId, 'version_create', change, userId]);
    }
  }

  /**
   * Compara metadados entre duas versões
   */
  private compareMetadata(oldMeta: any, newMeta: any): any {
    const differences = {};
    
    // Implementação simples de comparação de metadados
    const allKeys = new Set([
      ...Object.keys(oldMeta || {}),
      ...Object.keys(newMeta || {})
    ]);

    for (const key of allKeys) {
      const oldValue = oldMeta?.[key];
      const newValue = newMeta?.[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        differences[key] = { old: oldValue, new: newValue };
      }
    }

    return differences;
  }

  /**
   * Remove versão de forma segura (com backup)
   */
  private async safeDeleteVersion(versionId: string): Promise<void> {
    // Buscar caminho do arquivo
    const result = await query(
      'SELECT file_path FROM anamnese_documents WHERE id = $1',
      [versionId]
    );

    if (result.rows && result.rows.length > 0) {
      const filePath = result.rows[0].file_path;
      
      // Remover arquivo físico (com backup)
      await fileStorageService.deleteFile(filePath, true);
    }

    // Marcar como deletado no banco (soft delete)
    await query(
      "UPDATE anamnese_documents SET status = 'deleted', updated_at = NOW() WHERE id = $1",
      [versionId]
    );
  }

  /**
   * Obter estatísticas de versionamento
   */
  async getVersioningStats(): Promise<{
    totalDocuments: number;
    documentsWithVersions: number;
    totalVersions: number;
    avgVersionsPerDocument: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
  }> {
    try {
      const result = await query(`
        SELECT 
          COUNT(DISTINCT COALESCE(parent_document_id, id)) as total_documents,
          COUNT(*) as total_versions,
          COUNT(*) FILTER (WHERE version > 1) as documents_with_versions,
          AVG(version) as avg_versions,
          MIN(uploaded_at) as oldest_version,
          MAX(uploaded_at) as newest_version
        FROM anamnese_documents 
        WHERE status = 'active'
      `);

      const stats = result.rows[0];

      return {
        totalDocuments: parseInt(stats.total_documents),
        documentsWithVersions: parseInt(stats.documents_with_versions),
        totalVersions: parseInt(stats.total_versions),
        avgVersionsPerDocument: parseFloat(stats.avg_versions) || 0,
        oldestVersion: stats.oldest_version,
        newestVersion: stats.newest_version
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de versionamento:', error);
      return {
        totalDocuments: 0,
        documentsWithVersions: 0,
        totalVersions: 0,
        avgVersionsPerDocument: 0,
        oldestVersion: null,
        newestVersion: null
      };
    }
  }
}

// Instância singleton do serviço
export const versioningService = new VersioningService();