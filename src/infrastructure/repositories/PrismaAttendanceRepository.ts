import { CreateAttendanceDTO, UpdateAttendanceDTO, Attendance } from '../../domain/entities/Attendance';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import prisma from '../db/prisma';
import { Attendance as PrismaAttendance, User as PrismaUser } from '@prisma/client';
import { DateUtils } from '../../shared/utils/dateUtils';
import { UserRole } from '@/domain/entities/User';

export class PrismaAttendanceRepository implements AttendanceRepository {
    // Mapper function to convert Prisma Attendance to domain Attendance
    private _mapToDomainAttendance(prismaAttendance: PrismaAttendance & { user?: PrismaUser }): Attendance {
        return {
            id: prismaAttendance.id,
            userId: prismaAttendance.userId,
            user: prismaAttendance.user ? {
                name: prismaAttendance.user.name,
                email: prismaAttendance.user.email,
                role: prismaAttendance.user.role as unknown as UserRole
            } : undefined,
            date: prismaAttendance.date,
            checkInTime: prismaAttendance.checkInTime,
            checkOutTime: prismaAttendance.checkOutTime,
            checkInPhotoUrl: prismaAttendance.checkInPhotoUrl,
            checkOutPhotoUrl: prismaAttendance.checkOutPhotoUrl,
            createdAt: prismaAttendance.createdAt,
            updatedAt: prismaAttendance.updatedAt
        };
    } async create(data: CreateAttendanceDTO): Promise<Attendance> {
        // Get current Jakarta date properly formatted for database
        const todayJakarta = new Date(DateUtils.getJakartaDateForDB());

        // Current Jakarta time for check-in
        const nowJakarta = DateUtils.getCurrentJakartaTime();


        const prismaAttendance = await prisma.attendance.create({
            data: {
                userId: data.userId,
                checkInPhotoUrl: data.checkInPhotoUrl,
                date: todayJakarta, // This will be stored in yyyy-MM-dd format in the database
                checkInTime: nowJakarta // Server time in Jakarta timezone
            },
        });

        return this._mapToDomainAttendance(prismaAttendance);
    }

    async findById(id: string): Promise<Attendance | null> {
        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: { user: true },
        });

        return attendance ? this._mapToDomainAttendance(attendance) : null;
    }

    async findByUserId(userId: string): Promise<Attendance[]> {
        const attendances = await prisma.attendance.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return attendances.map(attendance => this._mapToDomainAttendance(attendance));
    }

    async update(id: string, data: UpdateAttendanceDTO): Promise<Attendance> {
        const updatedAttendance = await prisma.attendance.update({
            where: { id },
            data: {
                checkOutPhotoUrl: data.checkOutPhotoUrl,
                checkOutTime: DateUtils.getCurrentJakartaTime() // Server time in Jakarta timezone
            },
        });

        return this._mapToDomainAttendance(updatedAttendance);
    }

    async findAll(): Promise<Attendance[]> {
        const attendances = await prisma.attendance.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });

        return attendances.map(attendance => this._mapToDomainAttendance(attendance));
    }

    async findTodayAttendanceByUserId(userId: string): Promise<Attendance | null> {
        // Get today's date in Jakarta timezone properly formatted for database
        const todayJakarta = new Date(DateUtils.getJakartaDateForDB());

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                date: todayJakarta
            }
        });

        return attendance ? this._mapToDomainAttendance(attendance) : null;
    }

    async findIncompleteAttendanceByUserId(userId: string): Promise<Attendance | null> {
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkOutTime: null
            },
            orderBy: {
                checkInTime: 'desc'
            }
        });

        return attendance ? this._mapToDomainAttendance(attendance) : null;
    }
}
