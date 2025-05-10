import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors,
        });
    }    // Handle known error types
    if (err.message === 'User not found' || err.message === 'Attendance record not found') {
        return res.status(404).json({ error: err.message });
    }

    if (err.message === 'User with this email already exists' ||
        err.message === 'Email is already taken') {
        return res.status(409).json({ error: err.message });
    }

    if (err.message === 'Invalid credentials') {
        return res.status(401).json({ error: err.message });
    }

    // Default error handler
    return res.status(500).json({ error: 'Internal server error' });
};

export const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        } catch (error) {
            next(error);
        }
    };
};
