import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getRecords: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRecordById: (req: Request, res: Response) => Promise<void>;
export declare const createRecord: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateRecord: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteRecord: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPatientRecords: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRecordTemplates: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=recordController.d.ts.map