import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/User';

// Extend Express Request type to include user information
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('No token provided');
            error.name = 'AuthenticationError';
            return next(error);
        }

        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';

        // Verify token
        const decoded = jwt.verify(token, jwtSecret) as {
            id: string;
            name: string;
            email: string;
            role: UserRole;
        };

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        const authError = new Error('Invalid or expired token');
        authError.name = 'AuthenticationError';
        next(authError);
    }
};

// Middleware to check if user has required role
export const roleMiddleware = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            const error = new Error('Authentication required');
            error.name = 'AuthenticationError';
            return next(error);
        }

        if (!roles.includes(req.user.role)) {
            const error = new Error('Insufficient permissions');
            error.name = 'AuthorizationError';
            return next(error);
        }

        next();
    };
};
