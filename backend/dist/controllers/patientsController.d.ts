import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getPatients: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deactivatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPatientsStats: (req: AuthRequest, res: Response) => Promise<void>;
declare const _default: {
    getPatients: (req: AuthRequest, res: Response) => Promise<void>;
    getPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createPatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deactivatePatient: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPatientsStats: (req: AuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=patientsController.d.ts.map