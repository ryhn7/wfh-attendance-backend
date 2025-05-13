import { CreateUserDTO, UpdateUserDTO, User, UserRole } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import prisma from '../db/prisma';
import { User as PrismaUser } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
    private _mapToDomainUser(prismaUser: PrismaUser): User {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            password: prismaUser.password,
            name: prismaUser.name,
            role: prismaUser.role as unknown as UserRole, // Type assertion to handle the enum mismatch
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt
        };
    }

    async create(data: CreateUserDTO): Promise<User> {
        const prismaUser = await prisma.user.create({
            data
        });
        return this._mapToDomainUser(prismaUser);
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id }
        });
        return user ? this._mapToDomainUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        return user ? this._mapToDomainUser(user) : null;
    }

    async update(id: string, data: UpdateUserDTO): Promise<User> {
        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });
        return this._mapToDomainUser(updatedUser);
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany();
        return users.map(user => this._mapToDomainUser(user));
    }
}