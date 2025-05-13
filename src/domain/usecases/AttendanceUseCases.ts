import { CreateAttendanceDTO, Attendance, AttendanceValidation, UpdateAttendanceDTO } from '../entities/Attendance';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { UserRepository } from '../repositories/UserRepository';
import { DateUtils } from '../../shared/utils/dateUtils';

export class CreateAttendanceUseCase {
    constructor(
        private _attendanceRepository: AttendanceRepository,
        private _userRepository: UserRepository
    ) { }

    async execute(data: CreateAttendanceDTO): Promise<Attendance> {
        // Verify the user exists
        const user = await this._userRepository.findById(data.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user already has an attendance record for today
        const existingAttendance = await this._attendanceRepository.findTodayAttendanceByUserId(data.userId);
        if (existingAttendance) {
            throw new Error('You have already checked in today');
        }

        // Validate check-in time (8:00 AM - 10:00 AM allowed)
        const jakartaHour = DateUtils.getJakartaHour();
        if (jakartaHour < 8 || jakartaHour >= 10) {
            throw new Error('Check-in is only allowed between 8:00 AM and 10:00 AM (Jakarta time)')
        }

        // Create attendance record with current server time
        return this._attendanceRepository.create(data);
    }

    async validateCheckIn(userId: string): Promise<AttendanceValidation> {
        try {
            // Check if user already has an attendance record for today
            const existingAttendance = await this._attendanceRepository.findTodayAttendanceByUserId(userId);
            if (existingAttendance) {
                return {
                    success: false,
                    message: 'You have already checked in today'
                };
            }

            // Validate check-in time (8:00 AM - 10:00 AM allowed)
            const jakartaHour = DateUtils.getJakartaHour();
            if (jakartaHour < 8 || jakartaHour >= 10) {
                return {
                    success: false,
                    message: 'Check-in is only allowed between 8:00 AM and 10:00 AM (Jakarta time)'
                };
            }

            return {
                success: true,
                message: 'You can check in now'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'An error occurred while validating check-in'
            };
        }
    }
}

export class GetAttendanceByIdUseCase {
    constructor(private _attendanceRepository: AttendanceRepository) { }

    async execute(id: string): Promise<Attendance> {
        const attendance = await this._attendanceRepository.findById(id);
        if (!attendance) {
            throw new Error('Attendance record not found');
        }
        return attendance;
    }
}

export class GetAttendanceByUserIdUseCase {
    constructor(
        private _attendanceRepository: AttendanceRepository,
        private _userRepository: UserRepository
    ) { }

    async execute(userId: string): Promise<Attendance[]> {
        // Verify the user exists
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return this._attendanceRepository.findByUserId(userId);
    }
}

export class UpdateAttendanceUseCase {
    constructor(private _attendanceRepository: AttendanceRepository) { }

    async execute(id: string, data: UpdateAttendanceDTO): Promise<Attendance> {
        // Check if attendance record exists
        const existingAttendance = await this._attendanceRepository.findById(id);
        if (!existingAttendance) {
            throw new Error('Attendance record not found');
        }

        // Check if this attendance record has already been checked out
        if (existingAttendance.checkOutTime) {
            throw new Error('This attendance record has already been checked out');
        }

        // Validate check-out time (only allowed after 4:00 PM)
        const jakartaHour = DateUtils.getJakartaHour();
        if (jakartaHour < 16) {
            throw new Error('Check-out is only allowed after 4:00 PM');
        }

        // Update with check-out information
        return this._attendanceRepository.update(id, data);
    }

    async validateCheckOut(id: string, userId: string): Promise<AttendanceValidation> {
        try {
            // Check if user has any attendance record that hasn't been checked out
            const attendance = await this._attendanceRepository.findById(id);

            // Make sure the attendance record exists and belongs to the user
            if (!attendance) {
                return {
                    success: false,
                    message: 'No attendance record found to check out'
                };
            }

            if (attendance.userId !== userId) {
                return {
                    success: false,
                    message: 'This attendance record does not belong to you'
                };
            }

            // Check if already checked out
            if (attendance.checkOutTime) {
                return {
                    success: false,
                    message: 'You have already checked out for this record'
                };
            }

            // Validate time (after 4 PM)
            const jakartaHour = DateUtils.getJakartaHour();
            if (jakartaHour < 16) {
                return {
                    success: false,
                    message: 'Check-out is only allowed after 4:00 PM (Jakarta time)'
                };
            }

            // Calculate work duration in hours
            const workDurationInHours = DateUtils.calculateHoursBetween(
                attendance.checkInTime,
                DateUtils.getCurrentJakartaTime()
            );

            // Format the duration for a user-friendly message
            const formattedDuration = DateUtils.formatWorkDuration(workDurationInHours);

            // Validate minimum 8-hour work duration
            if (workDurationInHours < 8) {
                return {
                    success: false,
                    message: `You must work for at least 8 hours before checking out (current: ${formattedDuration})`
                };
            }

            return {
                success: true,
                message: `You can check out now (worked: ${formattedDuration})`
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'An error occurred while validating check-out'
            };
        }
    }
}

export class GetAllAttendancesUseCase {
    constructor(private _attendanceRepository: AttendanceRepository) { }

    async execute(): Promise<Attendance[]> {
        return this._attendanceRepository.findAll();
    }
}

export class GetIncompleteAttendanceUseCase {
    constructor(private _attendanceRepository: AttendanceRepository) { }

    async execute(userId: string): Promise<Attendance | null> {
        return this._attendanceRepository.findIncompleteAttendanceByUserId(userId);
    }
}

export class GetTodayAttendanceByUserIdUseCase {
    constructor(
        private _attendanceRepository: AttendanceRepository,
        private _userRepository: UserRepository
    ) { }

    async execute(userId: string): Promise<Attendance | null> {
        // Verify the user exists
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return this._attendanceRepository.findTodayAttendanceByUserId(userId);
    }
}
