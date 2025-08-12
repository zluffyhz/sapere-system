import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const recordController: {
    getPatientRecords(req: AuthRequest, res: Response): Promise<void>;
    getRecord(req: AuthRequest, res: Response): Promise<void>;
    createRecord(req: AuthRequest, res: Response): Promise<void>;
    updateRecord(req: AuthRequest, res: Response): Promise<void>;
    deleteRecord(req: AuthRequest, res: Response): Promise<void>;
    getRecordTemplates(req: AuthRequest, res: Response): Promise<void>;
};
export default recordController;
//# sourceMappingURL=recordController-backup.d.ts.map