import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/database';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: string;
        phone?: string;
        last_login_at?: Date;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (allowedRoles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireTherapist: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireGuardian: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireTherapistOrAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAnyRole: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const canAccessPatient: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const logActivity: (action: string, resourceType: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map