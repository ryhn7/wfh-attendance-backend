import { Request, Response } from 'express';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { FileStorageRepository } from '../../domain/repositories/FileStorageRepository';
import {
    CreateAttendanceUseCase,
    GetAllAttendancesUseCase,
    GetAttendanceByUserIdUseCase,
    GetAttendanceByIdUseCase,
    UpdateAttendanceUseCase,
    GetIncompleteAttendanceUseCase
} from '../../domain/usecases/AttendanceUseCases';
import { ApiResponse } from '../../shared/utils/apiResponse';

export class AttendanceController {
    constructor(
        private _attendanceRepository: AttendanceRepository,
        private _userRepository: UserRepository,
        private _fileStorageRepository: FileStorageRepository
    ) { }

    // Check-in controller
    checkInController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                // Always use the authenticated user's ID for check-in
                const userId = req.user!.id;

                const createAttendanceUseCase = new CreateAttendanceUseCase(
                    this._attendanceRepository,
                    this._userRepository
                );

                // First validate if check-in is possible
                const validation = await createAttendanceUseCase.validateCheckIn(userId);
                if (!validation.success) {
                    ApiResponse.error(res, validation.message);
                    return;
                }

                // Check if photo was uploaded
                if (!req.file) {
                    ApiResponse.error(res, 'Photo is required for check-in');
                    return;
                }

                // Upload the photo to local storage
                const photoUrl = await this._fileStorageRepository.uploadFile(
                    {
                        buffer: req.file.buffer,
                        mimetype: req.file.mimetype,
                        originalname: req.file.originalname
                    },
                    'attendance'
                );

                // Proceed with check-in
                const attendance = await createAttendanceUseCase.execute({
                    userId,
                    checkInPhotoUrl: photoUrl
                });

                ApiResponse.created(res, attendance, 'Check-in successful');
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    // Check if user can check in
    validateCheckInController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const userId = req.user!.id;

                const createAttendanceUseCase = new CreateAttendanceUseCase(
                    this._attendanceRepository,
                    this._userRepository
                );

                const validation = await createAttendanceUseCase.validateCheckIn(userId);
                ApiResponse.success(res, validation, validation.message);
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    getAttendanceByIdController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                const getAttendanceByIdUseCase = new GetAttendanceByIdUseCase(this._attendanceRepository);
                const attendance = await getAttendanceByIdUseCase.execute(id);

                // Check if user has permission to view this attendance record
                if (attendance.userId !== req.user?.id &&
                    req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'You are not authorized to view this attendance record');
                    return;
                }

                ApiResponse.success(res, attendance);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Attendance record not found') {
                        ApiResponse.notFound(res, error.message);
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    getAttendanceByUserIdController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { userId } = req.params;

                // Check if user has permission to view these attendance records
                if (userId !== req.user?.id &&
                    req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'You are not authorized to view attendance records for this user');
                    return;
                }

                const getAttendanceByUserIdUseCase = new GetAttendanceByUserIdUseCase(
                    this._attendanceRepository,
                    this._userRepository
                );
                const attendances = await getAttendanceByUserIdUseCase.execute(userId);

                ApiResponse.success(res, attendances);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        ApiResponse.notFound(res, error.message);
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }    // Check-out controller
    checkOutController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;
                const userId = req.user!.id;

                const updateAttendanceUseCase = new UpdateAttendanceUseCase(this._attendanceRepository);

                // Validate if check-out is possible
                const validation = await updateAttendanceUseCase.validateCheckOut(id, userId);
                if (!validation.success) {
                    ApiResponse.error(res, validation.message);
                    return;
                }

                // Check if photo was uploaded
                if (!req.file) {
                    ApiResponse.error(res, 'Photo is required for check-out');
                    return;
                }

                // Upload the photo to local storage
                const photoUrl = await this._fileStorageRepository.uploadFile(
                    {
                        buffer: req.file.buffer,
                        mimetype: req.file.mimetype,
                        originalname: req.file.originalname
                    },
                    'attendance'
                );

                // Proceed with check-out
                const updatedAttendance = await updateAttendanceUseCase.execute(id, {
                    checkOutPhotoUrl: photoUrl
                });

                ApiResponse.success(res, updatedAttendance, 'Check-out successful');
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Attendance record not found') {
                        ApiResponse.notFound(res, error.message);
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    // Check if user can check out
    validateCheckOutController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;
                const userId = req.user!.id;

                const updateAttendanceUseCase = new UpdateAttendanceUseCase(this._attendanceRepository);
                const validation = await updateAttendanceUseCase.validateCheckOut(id, userId);

                ApiResponse.success(res, validation, validation.message);
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    getAllAttendancesController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                // Only admin can list all attendance records
                if (req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'Unauthorized to view all attendance records');
                    return;
                }

                const getAllAttendancesUseCase = new GetAllAttendancesUseCase(this._attendanceRepository);
                const attendances = await getAllAttendancesUseCase.execute();

                ApiResponse.success(res, attendances);
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    // Get user's incomplete attendance (for check-out purposes)
    getIncompleteAttendanceController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const userId = req.user!.id;

                const getIncompleteAttendanceUseCase = new GetIncompleteAttendanceUseCase(this._attendanceRepository);
                const attendance = await getIncompleteAttendanceUseCase.execute(userId);

                if (!attendance) {
                    ApiResponse.success(res, null, 'No incomplete attendance records found');
                    return;
                }

                ApiResponse.success(res, attendance);
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }
}