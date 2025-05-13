import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface UserRepository {
    create(data: CreateUserDTO): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, data: UpdateUserDTO): Promise<User>;
    delete(id: string): Promise<void>;
    findAll(): Promise<User[]>;
}
