import { Request, Response } from 'express';
import {
    CreateUserUseCase,
    DeleteUserUseCase,
    GetAllEmployeesUseCase,
    GetUserByEmailUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase
} from '../../domain/usecases/UserUseCases';
import { UserRepository } from '../../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserController {
    constructor(private _userRepository: UserRepository) { }

    getRegisterController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const createUserUseCase = new CreateUserUseCase(this._userRepository);
                const user = await createUserUseCase.execute(req.body);

                // Remove password from response
                const { password, ...userWithoutPassword } = user;

                res.status(201).json({
                    success: true,
                    data: userWithoutPassword,
                });
            } catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }

    getLoginController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { email, password } = req.body;

                const getUserByEmailUseCase = new GetUserByEmailUseCase(this._userRepository);
                const user = await getUserByEmailUseCase.execute(email);

                // Check password
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    res.status(401).json({ error: 'Invalid credentials' });
                    return;
                }

                // Generate JWT
                const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    jwtSecret,
                    {
                        expiresIn: '24h'
                    }
                );

                res.status(200).json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        res.status(401).json({ error: 'Invalid credentials' });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }

    getUserByIdController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                const getUserByIdUseCase = new GetUserByIdUseCase(this._userRepository);
                const user = await getUserByIdUseCase.execute(id);

                // Remove password from response
                const { password, ...userWithoutPassword } = user;

                res.status(200).json({
                    success: true,
                    data: userWithoutPassword,
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }

    updateUserController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Check if the authenticated user is updating their own profile or is an admin
                if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
                    res.status(403).json({ error: 'Unauthorized to update this user' });
                    return;
                }

                const updateUserUseCase = new UpdateUserUseCase(this._userRepository);
                const user = await updateUserUseCase.execute(id, req.body);

                // Remove password from response
                const { password, ...userWithoutPassword } = user;

                res.status(200).json({
                    success: true,
                    data: userWithoutPassword,
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }

    deleteUserController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Only admin can delete users
                if (req.user?.role !== 'ADMIN') {
                    res.status(403).json({ error: 'Unauthorized to delete users' });
                    return;
                }

                const deleteUserUseCase = new DeleteUserUseCase(this._userRepository);
                await deleteUserUseCase.execute(id);

                res.status(200).json({
                    success: true,
                    message: 'User deleted successfully',
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        res.status(404).json({ error: error.message });
                    } else {
                        res.status(400).json({ error: error.message });
                    }
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }

    getAllEmployeesController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                // Only admin and managers can list all users
                if (req.user?.role !== 'ADMIN') {
                    res.status(403).json({ error: 'Unauthorized to view all users' });
                    return;
                }

                const getAllEmployeesUseCase = new GetAllEmployeesUseCase(this._userRepository);
                const users = await getAllEmployeesUseCase.execute();

                // Remove passwords from response
                const usersWithoutPasswords = users.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });

                res.status(200).json({
                    success: true,
                    data: usersWithoutPasswords,
                });
            } catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'An unexpected error occurred' });
                }
            }
        };
    }
}