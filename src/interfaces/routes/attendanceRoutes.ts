import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/errorMiddleware';
import { createAttendanceSchema, updateAttendanceSchema } from '../validators/attendanceValidator';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserRole } from '../../domain/entities/User';

export const createAttendanceRouter = (
    attendanceRepository: AttendanceRepository,
    userRepository: UserRepository
) => {
    const router = Router();
    const attendanceController = new AttendanceController(
        attendanceRepository,
        userRepository
    );

    // All routes require authentication
    router.use(authMiddleware);

    // Create attendance record
    router.post(
        '/',
        validateRequest(createAttendanceSchema),
        attendanceController.createAttendanceController()
    );

    // Get all attendance records (admin only)
    router.get(
        '/',
        roleMiddleware([UserRole.ADMIN]),
        attendanceController.getAllAttendancesController()
    );

    // Get attendance records for a specific user
    router.get(
        '/user/:userId',
        attendanceController.getAttendanceByUserIdController()
    );

    // Get a specific attendance record by ID
    router.get(
        '/:id',
        attendanceController.getAttendanceByIdController()
    );

    // Update an attendance record
    router.put(
        '/:id',
        validateRequest(updateAttendanceSchema),
        attendanceController.updateAttendanceController()
    );

    // Delete an attendance record
    router.delete(
        '/:id',
        attendanceController.deleteAttendanceController()
    );

    return router;
};
