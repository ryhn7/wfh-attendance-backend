import { ErrorRequestHandler, Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/errorMiddleware';
import { checkInSchema, checkOutSchema } from '../validators/attendanceValidator';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserRole } from '../../domain/entities/User';
import { LocalFileStorageRepository } from '@/infrastructure/repositories/LocalFilesStorageRepository';
import { photoUpload, handleMulterError } from '../middlewares/fileUploadMiddleware';

export const createAttendanceRouter = (
    attendanceRepository: AttendanceRepository,
    userRepository: UserRepository,
    localFileStorageRepository: LocalFileStorageRepository
) => {
    const router = Router();
    const attendanceController = new AttendanceController(
        attendanceRepository,
        userRepository,
        localFileStorageRepository
    );

    // All routes require authentication
    router.use(authMiddleware);

    // Check-in routes
    router.post(
        '/check-in',
        photoUpload,
        attendanceController.checkInController()
    );

    router.get(
        '/validate-check-in',
        attendanceController.validateCheckInController()
    );

    // Check-out routes
    router.post(
        '/check-out/:id',
        photoUpload,
        attendanceController.checkOutController()
    );

    router.get(
        '/validate-check-out/:id',
        attendanceController.validateCheckOutController()
    );

    // Get user's incomplete attendance record
    router.get(
        '/incomplete',
        attendanceController.getIncompleteAttendanceController()
    );

    // Admin routes
    router.get(
        '/',
        roleMiddleware([UserRole.ADMIN]),
        attendanceController.getAllAttendancesController()
    );

    // Get attendance history for a specific user
    router.get(
        '/history',
        attendanceController.getAttendanceHistoryController()
    );

    // Get attendance records for a specific user
    router.get(
        '/user/:userId',
        roleMiddleware([UserRole.ADMIN]),
        attendanceController.getEmployeeAttendanceController()
    );

    // Get a specific attendance record by ID
    router.get(
        '/:id',
        attendanceController.getAttendanceByIdController()
    );

    // Error handling for multer (must come after routes that use photoUpload)
    router.use(handleMulterError as ErrorRequestHandler);

    return router;
};
