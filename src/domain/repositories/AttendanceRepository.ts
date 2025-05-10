import { Attendance, CreateAttendanceDTO, UpdateAttendanceDTO } from '../entities/Attendance';

export interface AttendanceRepository {
    create(data: CreateAttendanceDTO): Promise<Attendance>;
    findById(id: string): Promise<Attendance | null>;
    findByUserId(userId: string): Promise<Attendance[]>;
    update(id: string, data: UpdateAttendanceDTO): Promise<Attendance>;
    delete(id: string): Promise<void>;
    findAll(): Promise<Attendance[]>;
}
