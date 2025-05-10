import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../../shared/utils/apiResponse';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
    }

    // Handle authentication errors
    if (err.name === 'AuthenticationError') {
        return ApiResponse.unauthorized(res, err.message);
    }

    // Handle authorization errors
    if (err.name === 'AuthorizationError') {
        return ApiResponse.forbidden(res, err.message);
    }

    // Handle known error types
    if (err.message === 'User not found' || err.message === 'Attendance record not found') {
        return ApiResponse.notFound(res, err.message);
    }

    if (err.message === 'User with this email already exists' ||
        err.message === 'Email is already taken') {
        return ApiResponse.error(res, err.message, 409); // Conflict
    }

    if (err.message === 'Invalid credentials') {
        return ApiResponse.unauthorized(res, err.message);
    }

    // Default error handler
    return ApiResponse.serverError(res, 'Internal server error', err);
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
