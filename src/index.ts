import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createApiRouter } from './interfaces/routes';
import { errorHandler } from './interfaces/middlewares/errorMiddleware';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { PrismaAttendanceRepository } from './infrastructure/repositories/PrismaAttendanceRepository';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create repository instances
const userRepository = new PrismaUserRepository();
const attendanceRepository = new PrismaAttendanceRepository();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', createApiRouter(userRepository, attendanceRepository));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res, next);
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
});
