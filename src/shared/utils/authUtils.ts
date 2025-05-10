import { UserRole } from '../../domain/entities/User';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: string;
    email: string;
    role: UserRole;
}

export const generateToken = (payload: TokenPayload): string => {
    const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
    return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload => {
    const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
    return jwt.verify(token, jwtSecret) as TokenPayload;
};
