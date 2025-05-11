import { z } from 'zod';

// Check-in validation schema
export const checkInSchema = z.object({
    userId: z.string().uuid('Invalid user ID format').optional(), // Optional because we'll get it from the auth token
    checkInPhotoUrl: z.string().min(1, 'Check-in photo URL is required'),
});

// Check-out validation schema
export const checkOutSchema = z.object({
    checkOutPhotoUrl: z.string().min(1, 'Check-out photo URL is required'),
});
