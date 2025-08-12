import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateRegister: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateChangePassword: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateCreatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateUpdatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateCreateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateUpdateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
export declare const validateResourceOwnership: (resourceType: "anamnese" | "patient" | "record") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const sanitizeData: (req: Request, res: Response, next: NextFunction) => void;
export declare const userRateLimit: (maxRequests: number, windowMs: number) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
declare const _default: {
    handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
    validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateRegister: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateChangePassword: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateCreatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateUpdatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateCreateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateUpdateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>))[];
    validateResourceOwnership: (resourceType: "anamnese" | "patient" | "record") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    sanitizeData: (req: Request, res: Response, next: NextFunction) => void;
    userRateLimit: (maxRequests: number, windowMs: number) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
};
export default _default;
//# sourceMappingURL=validation.d.ts.map