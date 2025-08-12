import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const login: (req: Request, res: Response) => Promise<Response>;
export declare const register: (req: Request, res: Response) => Promise<Response>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const refreshToken: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (req: AuthRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map