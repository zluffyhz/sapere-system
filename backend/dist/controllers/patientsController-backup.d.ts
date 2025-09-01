import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getPatients: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deactivatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPatientsStats: (req: AuthRequest, res: Response) => Promise<void>;
declare const _default: {
    getPatients: (req: AuthRequest, res: Response) => Promise<void>;
    getPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    createPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    updatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    deactivatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getPatientsStats: (req: AuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=patientsController-backup.d.ts.map