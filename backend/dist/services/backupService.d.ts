declare class BackupService {
    private config;
    constructor();
    initialize(): Promise<void>;
    createBackup(type?: 'manual' | 'automatic'): Promise<string>;
    restoreBackup(backupFilename: string): Promise<void>;
    listBackups(): Promise<Array<{
        name: string;
        size: number;
        created: Date;
        type: string;
    }>>;
    cleanupOldBackups(): Promise<void>;
    checkDatabaseIntegrity(): Promise<boolean>;
    optimizeDatabase(): Promise<void>;
    exportToJson(): Promise<string>;
}
export declare const backupService: BackupService;
export default backupService;
//# sourceMappingURL=backupService.d.ts.map