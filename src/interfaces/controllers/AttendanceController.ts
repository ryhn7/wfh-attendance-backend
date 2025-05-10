import { Request, Response } from 'express';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
    CreateAttendanceUseCase,
    DeleteAttendanceUseCase,
    GetAllAttendancesUseCase,
    GetAttendanceByUserIdUseCase,
    GetAttendanceByIdUseCase,
    UpdateAttendanceUseCase
} from '../../domain/usecases/AttendanceUseCases';
import { ApiResponse } from '../../shared/utils/apiResponse';

export class AttendanceController {
    constructor(
        private _attendanceRepository: AttendanceRepository,
        private _userRepository: UserRepository
    ) { }

    createAttendanceController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                // If the request doesn't specify a userId, use the authenticated user's id
                if (!req.body.userId && req.user) {
                    req.body.userId = req.user.id;
                }

                // Only admins can create attendance entries for other users
                if (req.body.userId !== req.user?.id &&
                    req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'You are not authorized to create attendance records for other users');
                    return;
                }

                const createAttendanceUseCase = new CreateAttendanceUseCase(
                    this._attendanceRepository,
                    this._userRepository
                );
                const attendance = await createAttendanceUseCase.execute(req.body);

                ApiResponse.created(res, attendance, 'Attendance record created successfully');
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
    }

    updateAttendanceController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Get the attendance to check ownership
                const getAttendanceByIdUseCase = new GetAttendanceByIdUseCase(this._attendanceRepository);
                const attendance = await getAttendanceByIdUseCase.execute(id);

                // Check if user has permission to update this attendance record
                if (attendance.userId !== req.user?.id &&
                    req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'You are not authorized to update this attendance record');
                    return;
                }

                const updateAttendanceUseCase = new UpdateAttendanceUseCase(this._attendanceRepository);
                const updatedAttendance = await updateAttendanceUseCase.execute(id, req.body);

                ApiResponse.success(res, updatedAttendance, 'Attendance record updated successfully');
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

    deleteAttendanceController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Get the attendance to check ownership
                const getAttendanceByIdUseCase = new GetAttendanceByIdUseCase(this._attendanceRepository);
                const attendance = await getAttendanceByIdUseCase.execute(id);

                // Check if user has permission to delete this attendance record
                if (attendance.userId !== req.user?.id &&
                    req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'You are not authorized to delete this attendance record');
                    return;
                }

                const deleteAttendanceUseCase = new DeleteAttendanceUseCase(this._attendanceRepository);
                await deleteAttendanceUseCase.execute(id);

                ApiResponse.success(res, null, 'Attendance record deleted successfully');
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
}