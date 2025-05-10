import { CreateAttendanceDTO, Attendance, UpdateAttendanceDTO } from '../entities/Attendance';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { UserRepository } from '../repositories/UserRepository';

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

        return this._attendanceRepository.create(data);
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

        return this._attendanceRepository.update(id, data);
    }
}

export class DeleteAttendanceUseCase {
    constructor(private _attendanceRepository: AttendanceRepository) { }

    async execute(id: string): Promise<void> {
        const existingAttendance = await this._attendanceRepository.findById(id);
        if (!existingAttendance) {
            throw new Error('Attendance record not found');
        }

        await this._attendanceRepository.delete(id);
    }
}

export class GetAllAttendancesUseCase {
    constructor(private _attendanceRepository: AttendanceRepository) { }

    async execute(): Promise<Attendance[]> {
        return this._attendanceRepository.findAll();
    }
}
