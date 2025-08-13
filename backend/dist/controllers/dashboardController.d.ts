import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCalendarDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getCalendarDashboard: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=dashboardController.d.ts.map