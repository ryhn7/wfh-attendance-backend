import { Request, Response } from 'express';
import {
    CreateUserUseCase,
    DeleteUserUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    GetUserByEmailUseCase,
    UpdateUserUseCase
} from '../../domain/usecases/UserUseCases';
import { UserRepository } from '../../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../shared/utils/apiResponse';

export class UserController {
    constructor(private _userRepository: UserRepository) { }

    addUserController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const createUserUseCase = new CreateUserUseCase(this._userRepository);
                const user = await createUserUseCase.execute(req.body);

                // Remove password from response
                const { password, ...userWithoutPassword } = user;

                ApiResponse.created(res, userWithoutPassword, 'User registered successfully');
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
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
                    ApiResponse.unauthorized(res, 'Invalid credentials');
                    return;
                }

                // Generate JWT
                const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
                const token = jwt.sign(
                    {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    jwtSecret,
                    {
                        expiresIn: '24h'
                    }
                );

                ApiResponse.success(res, {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }, 'Login successful');
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        ApiResponse.unauthorized(res, 'Invalid credentials');
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
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

                ApiResponse.success(res, userWithoutPassword);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Employee not found') {
                        ApiResponse.notFound(res, error.message);
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    updateUserController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                const { id } = req.params;

                // Only admin can update users
                if (req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'Unauthorized to update this user');
                    return;
                }

                const updateUserUseCase = new UpdateUserUseCase(this._userRepository);
                const user = await updateUserUseCase.execute(id, req.body);

                // Remove password from response
                const { password, ...userWithoutPassword } = user;

                ApiResponse.success(res, userWithoutPassword, 'User updated successfully');
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        ApiResponse.notFound(res, error.message);
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
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
                    ApiResponse.forbidden(res, 'Unauthorized to delete users');
                    return;
                }

                const deleteUserUseCase = new DeleteUserUseCase(this._userRepository);
                await deleteUserUseCase.execute(id);

                ApiResponse.success(res, null, 'User deleted successfully');
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        ApiResponse.notFound(res, error.message);
                    } else {
                        ApiResponse.error(res, error.message);
                    }
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }

    getAllUsersController() {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                // Only admin can list all users
                if (req.user?.role !== 'ADMIN') {
                    ApiResponse.forbidden(res, 'Unauthorized to view all users');
                    return;
                }

                const getAllUsersUseCase = new GetAllUsersUseCase(this._userRepository);
                const users = await getAllUsersUseCase.execute();

                // Remove passwords from response
                const usersWithoutPasswords = users.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });

                ApiResponse.success(res, usersWithoutPasswords);
            } catch (error) {
                if (error instanceof Error) {
                    ApiResponse.error(res, error.message);
                } else {
                    ApiResponse.serverError(res, 'An unexpected error occurred', error);
                }
            }
        };
    }
}