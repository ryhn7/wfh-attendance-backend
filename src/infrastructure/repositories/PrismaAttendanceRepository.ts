import { CreateAttendanceDTO, Attendance, UpdateAttendanceDTO } from '../../domain/entities/Attendance';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import prisma from '../db/prisma';

export class PrismaAttendanceRepository implements AttendanceRepository {
    async create(data: CreateAttendanceDTO): Promise<Attendance> {
        return prisma.attendance.create({
            data: {
                ...data
            },
        });
    }

    async findById(id: string): Promise<Attendance | null> {
        return prisma.attendance.findUnique({
            where: { id },
            include: { user: true },
        });
    }

    async findByUserId(userId: string): Promise<Attendance[]> {
        return prisma.attendance.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, data: UpdateAttendanceDTO): Promise<Attendance> {
        return prisma.attendance.update({
            where: { id },
            data: data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.attendance.delete({
            where: { id },
        });
    }

    async findAll(): Promise<Attendance[]> {
        return prisma.attendance.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
    }
}
