declare class BackupService {
    private config;
    private dbPath;
    constructor();
    initialize(): Promise<void>;
    createBackup(type?: 'manual' | 'automatic'): Promise<string>;
    private createDatabaseBackup;
    private compressFile;
    restoreBackup(backupFilename: string): Promise<void>;
    private decompressFile;
    listBackups(): Promise<Array<{
        name: string;
        size: number;
        created: Date;
        type: string;
    }>>;
    cleanupOldBackups(): Promise<void>;
    private scheduleAutomaticBackups;
    private logBackup;
    checkDatabaseIntegrity(): Promise<boolean>;
    optimizeDatabase(): Promise<void>;
    exportToJson(): Promise<string>;
}
export declare const backupService: BackupService;
export default backupService;
//# sourceMappingURL=backupService.d.ts.map