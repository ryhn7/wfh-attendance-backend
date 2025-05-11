import { Attendance, AttendanceValidation, CreateAttendanceDTO, UpdateAttendanceDTO } from '../entities/Attendance';

export interface AttendanceRepository {
    create(data: CreateAttendanceDTO): Promise<Attendance>;
    findById(id: string): Promise<Attendance | null>;
    findByUserId(userId: string): Promise<Attendance[]>;
    update(id: string, data: UpdateAttendanceDTO): Promise<Attendance>;
    delete(id: string): Promise<void>;
    findAll(): Promise<Attendance[]>;
    findTodayAttendanceByUserId(userId: string): Promise<Attendance | null>;
    findIncompleteAttendanceByUserId(userId: string): Promise<Attendance | null>;
}
