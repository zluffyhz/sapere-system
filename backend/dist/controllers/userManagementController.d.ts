import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createUser: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const listUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const resetUserPassword: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const deactivateUser: (req: AuthRequest, res: Response) => Promise<Response>;
//# sourceMappingURL=userManagementController.d.ts.map