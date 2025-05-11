import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createApiRouter } from './interfaces/routes';
import { errorHandler } from './interfaces/middlewares/errorMiddleware';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { PrismaAttendanceRepository } from './infrastructure/repositories/PrismaAttendanceRepository';
import path from 'path';
import fs from 'fs';
import { DateUtils } from './shared/utils/dateUtils';

// Load environment variables
import dotenv from 'dotenv';
import { LocalFileStorageRepository } from './infrastructure/repositories/LocalFilesStorageRepository';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

console.log(`Server starting at: ${DateUtils.formatToJakartaTime(new Date())}`);

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create attendance photos directory
const attendanceDir = path.join(publicDir, 'attendance');
if (!fs.existsSync(attendanceDir)) {
  fs.mkdirSync(attendanceDir, { recursive: true });
}

// Serve static files from the 'public' folder
app.use('/public', express.static(publicDir));

// Create repository instances
const userRepository = new PrismaUserRepository();
const attendanceRepository = new PrismaAttendanceRepository();
const fileStorageRepository = new LocalFileStorageRepository();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', createApiRouter(userRepository, attendanceRepository, fileStorageRepository));

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
