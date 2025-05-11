import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/errorMiddleware';
import { createUserSchema, loginSchema, updateUserSchema } from '../validators/userValidator';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserRole } from '../../domain/entities/User';

export const createUserRouter = (userRepository: UserRepository) => {
    const router = Router();
    const userController = new UserController(userRepository);

    // Public routes
    router.post(
        '/add',
        validateRequest(createUserSchema),
        userController.addUserController()
    );

    router.post(
        '/login',
        validateRequest(loginSchema),
        userController.getLoginController()
    );

    // Protected routes
    router.get(
        '/employees',
        authMiddleware,
        roleMiddleware([UserRole.ADMIN]),
        userController.getAllEmployeesController()
    );

    router.get(
        '/employee/:id',
        authMiddleware,
        userController.getEmployeeByIdController()
    );

    router.put(
        '/:id',
        authMiddleware,
        roleMiddleware([UserRole.ADMIN]),
        validateRequest(updateUserSchema),
        userController.updateUserController()
    );

    router.delete(
        '/:id',
        authMiddleware,
        roleMiddleware([UserRole.ADMIN]),
        userController.deleteUserController()
    );

    return router;
};
