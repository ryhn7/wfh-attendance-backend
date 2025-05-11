import { CreateUserDTO, UpdateUserDTO, User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';

export class CreateUserUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(data: CreateUserDTO): Promise<User> {
        // Check if user already exists
        const existingUser = await this._userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user with hashed password
        return this._userRepository.create({
            ...data,
            password: hashedPassword,
        });
    }
}

export class GetUserByIdUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(id: string): Promise<User> {
        const user = await this._userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export class GetEmployeeByIdUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(id: string): Promise<User> {
        const user = await this._userRepository.findEmployeeById(id);
        if (!user) {
            throw new Error('Employee not found');
        }
        return user;
    }
}

export class GetUserByEmailUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(email: string): Promise<User> {
        const user = await this._userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export class UpdateUserUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(id: string, data: UpdateUserDTO): Promise<User> {
        // Check if user exists
        const existingUser = await this._userRepository.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        // Check if email is already taken by another user
        if (data.email && data.email !== existingUser.email) {
            const userWithEmail = await this._userRepository.findByEmail(data.email);
            if (userWithEmail && userWithEmail.id !== id) {
                throw new Error('Email is already taken');
            }
        }

        return this._userRepository.update(id, data);
    }
}

export class DeleteUserUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(id: string): Promise<void> {
        const existingUser = await this._userRepository.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        await this._userRepository.delete(id);
    }
}

export class GetAllEmployeesUseCase {
    constructor(private _userRepository: UserRepository) { }

    async execute(): Promise<User[]> {
        return this._userRepository.findEmployees();
    }
}
