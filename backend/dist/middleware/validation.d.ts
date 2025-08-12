import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateRegister: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateChangePassword: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateCreatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateUpdatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateCreateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateUpdateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const validateResourceOwnership: (resourceType: "anamnese" | "patient" | "record") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const sanitizeData: (req: Request, res: Response, next: NextFunction) => void;
export declare const userRateLimit: (maxRequests: number, windowMs: number) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
declare const _default: {
    handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateRegister: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateChangePassword: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateCreatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateUpdatePatient: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateCreateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateUpdateAnamnese: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
    validateResourceOwnership: (resourceType: "anamnese" | "patient" | "record") => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    sanitizeData: (req: Request, res: Response, next: NextFunction) => void;
    userRateLimit: (maxRequests: number, windowMs: number) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
};
export default _default;
//# sourceMappingURL=validation.d.ts.map