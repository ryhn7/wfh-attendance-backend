import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configure multer to store files in memory temporarily
const storage = multer.memoryStorage();

// Filter for image files only
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed'));
    }
    callback(null, true);
};

// Create the multer instance
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter
});

// Middleware for single photo upload
export const photoUpload = upload.single('photo');

// Error handler for multer errors
export const handleMulterError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }

    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next(err);
};