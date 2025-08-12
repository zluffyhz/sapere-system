import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAppointments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const confirmAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const completeAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAppointmentsStats: (req: AuthRequest, res: Response) => Promise<void>;
declare const _default: {
    getAppointments: (req: AuthRequest, res: Response) => Promise<void>;
    getAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    confirmAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    cancelAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    completeAppointment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAppointmentsStats: (req: AuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=appointmentsController.d.ts.map