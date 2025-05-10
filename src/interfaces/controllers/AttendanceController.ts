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
                    res.status(403).json({
                        error: 'You are not authorized to create attendance records for other users'
                    });
                    return;
                }

                const createAttendanceUseCase = new CreateAttendanceUseCase(
                    this._attendanceRepository,
                    this._userRepository
                );
                const attendance = await createAttendanceUseCase.execute(req.body);

                res.status(201).json({
                    success: true,
                    data: attendance,
                });
            } catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
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
                    res.status(403).json({
                        error: 'You are not authorized to view this attendance record'
                    });
                    return;
                }

                res.status(200).json({
                    success: true,
                    data: attendance,
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Attendance record not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
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
                    res.status(403).json({
                        error: 'You are not authorized to view attendance records for this user'
                    });
                    return;
                }

                const getAttendanceByUserIdUseCase = new GetAttendanceByUserIdUseCase(
                    this._attendanceRepository,
                    this._userRepository
                );
                const attendances = await getAttendanceByUserIdUseCase.execute(userId);

                res.status(200).json({
                    success: true,
                    data: attendances,
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
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
                    res.status(403).json({
                        error: 'You are not authorized to update this attendance record'
                    });
                    return;
                }

                const updateAttendanceUseCase = new UpdateAttendanceUseCase(this._attendanceRepository);
                const updatedAttendance = await updateAttendanceUseCase.execute(id, req.body);

                res.status(200).json({
                    success: true,
                    data: updatedAttendance,
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Attendance record not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
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
                    res.status(403).json({
                        error: 'You are not authorized to delete this attendance record'
                    });
                    return;
                }

                const deleteAttendanceUseCase = new DeleteAttendanceUseCase(this._attendanceRepository);
                await deleteAttendanceUseCase.execute(id);

                res.status(200).json({
                    success: true,
                    message: 'Attendance record deleted successfully',
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Attendance record not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }

    getAllAttendancesController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                // Only admin can list all attendance records
                if (req.user?.role !== 'ADMIN') {
                    res.status(403).json({ error: 'Unauthorized to view all attendance records' });
                    return;
                }

                const getAllAttendancesUseCase = new GetAllAttendancesUseCase(this._attendanceRepository);
                const attendances = await getAllAttendancesUseCase.execute();

                res.status(200).json({
                    success: true,
                    data: attendances,
                });
            } catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }
}