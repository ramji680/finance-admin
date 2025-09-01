import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                email: string;
                role: string;
            };
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (role: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireSuperadmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireFinance: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map