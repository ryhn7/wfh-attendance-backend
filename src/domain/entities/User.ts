// User entity types
export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE',
}

export interface CreateUserDTO {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
    role?: UserRole;
}
