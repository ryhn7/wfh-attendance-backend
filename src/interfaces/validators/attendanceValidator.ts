import { z } from 'zod';

// Attendance creation validation schema
export const createAttendanceSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    photo_url: z.string().min(1, 'Photo URL is required'),
});

// Attendance update validation schema
export const updateAttendanceSchema = z.object({
    photo_url: z.string().min(1, 'Photo URL is required').optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});
