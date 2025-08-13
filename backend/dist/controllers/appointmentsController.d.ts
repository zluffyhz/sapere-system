import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAppointments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const confirmAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const completeAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAppointmentsStats: (req: AuthRequest, res: Response) => Promise<void>;
declare const _default: {
    getAppointments: (req: AuthRequest, res: Response) => Promise<void>;
    getAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    confirmAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    cancelAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    completeAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAppointmentsStats: (req: AuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=appointmentsController.d.ts.map