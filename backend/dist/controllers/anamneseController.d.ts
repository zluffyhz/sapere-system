import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createAnamnese: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listAnamneses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAnamnese: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAnamnese: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAnamnese: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=anamneseController.d.ts.map