import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createTherapist: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const listTherapists: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const updateTherapist: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const deactivateTherapist: (req: AuthRequest, res: Response) => Promise<Response>;
//# sourceMappingURL=therapistController.d.ts.map