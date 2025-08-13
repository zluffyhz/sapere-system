import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const changeAdminPassword: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const resetUserPassword: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const listAllUsers: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const updateUserStatus: (req: AuthRequest, res: Response) => Promise<Response>;
//# sourceMappingURL=adminController.d.ts.map