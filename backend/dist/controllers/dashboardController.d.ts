import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCalendarDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    getDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCalendarDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=dashboardController.d.ts.map