import { Router } from 'express';
import { createUserRouter } from './userRoutes';
import { createAttendanceRouter } from './attendanceRoutes';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import { LocalFileStorageRepository } from '@/infrastructure/repositories/LocalFilesStorageRepository';

export const createApiRouter = (
    userRepository: UserRepository,
    attendanceRepository: AttendanceRepository,
    localFileStorageRepository: LocalFileStorageRepository
) => {
    const router = Router();

    // Mount the user routes
    router.use('/users', createUserRouter(userRepository));

    // Mount the attendance routes
    router.use('/attendance', createAttendanceRouter(attendanceRepository, userRepository, localFileStorageRepository));

    return router;
};
