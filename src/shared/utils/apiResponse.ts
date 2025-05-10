export class ResponseDto<T = any> {
    success: boolean;
    message: string;
    data?: T;

    constructor(success: boolean, message: string, data?: T) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    static success<T>(data?: T, message: string = 'Operation successful'): ResponseDto<T> {
        return new ResponseDto<T>(true, message, data);
    }

    static error(message: string = 'Operation failed', data?: any): ResponseDto<any> {
        return new ResponseDto(false, message, data);
    }
}

/**
 * Helper class to consistently format API responses
 */
export class ApiResponse {
    /**
     * Send a success response
     * @param data - The data to send in the response
     * @param message - Optional success message
     * @param statusCode - HTTP status code (default: 200)
     */
    static success<T>(res: any, data?: T, message: string = 'Operation successful', statusCode: number = 200): void {
        res.status(statusCode).json(ResponseDto.success(data, message));
    }

    /**
     * Send a created response (201 status)
     * @param data - The created resource data
     * @param message - Optional success message
     */
    static created<T>(res: any, data: T, message: string = 'Resource created successfully'): void {
        this.success(res, data, message, 201);
    }

    /**
     * Send an error response
     * @param message - Error message
     * @param statusCode - HTTP status code (default: 400)
     * @param data - Optional error details
     */
    static error(res: any, message: string = 'Operation failed', statusCode: number = 400, data?: any): void {
        res.status(statusCode).json(ResponseDto.error(message, data));
    }

    /**
     * Send a not found error response
     * @param message - Error message
     */
    static notFound(res: any, message: string = 'Resource not found'): void {
        this.error(res, message, 404);
    }

    /**
     * Send an unauthorized error response
     * @param message - Error message
     */
    static unauthorized(res: any, message: string = 'Unauthorized access'): void {
        this.error(res, message, 401);
    }

    /**
     * Send a forbidden error response
     * @param message - Error message
     */
    static forbidden(res: any, message: string = 'Forbidden access'): void {
        this.error(res, message, 403);
    }

    /**
     * Send a server error response
     * @param message - Error message
     * @param error - The original error object
     */
    static serverError(res: any, message: string = 'Internal server error', error?: any): void {
        console.error(error);
        this.error(res, message, 500, process.env.NODE_ENV === 'development' ? error : undefined);
    }
}