import { CreateUserDTO, UpdateUserDTO, User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import prisma from '../db/prisma';

export class PrismaUserRepository implements UserRepository {
    async create(data: CreateUserDTO): Promise<User> {
        return prisma.user.create({
            data
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async update(id: string, data: UpdateUserDTO): Promise<User> {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }

    async findEmployees(): Promise<User[]> {
        return prisma.user.findMany({
            where: { role: 'EMPLOYEE' }
        });
    }
}
