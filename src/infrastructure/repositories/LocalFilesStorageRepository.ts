import { FileStorageRepository, FileUpload } from '../../domain/repositories/FileStorageRepository';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export class LocalFileStorageRepository implements FileStorageRepository {
    private _baseDir: string;
    private _baseUrl: string;

    constructor() {
        this._baseDir = path.join(process.cwd(), 'public');
        this._baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    }

    async uploadFile(file: FileUpload, folder: string): Promise<string> {
        // Create directories if they don't exist
        const uploadDir = path.join(this._baseDir, folder);
        await this._ensureDirectoryExists(uploadDir);

        // Get file extension from mimetype
        const extension = this._getFileExtension(file.mimetype);

        // Create a unique filename
        const filename = `${randomUUID()}${extension}`;
        const filePath = path.join(uploadDir, filename);

        // Write the file
        await writeFileAsync(filePath, file.buffer);

        // Return the URL that can be stored in the database
        return `${this._baseUrl}/public/${folder}/${filename}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            // Extract the file path from the URL
            const urlObj = new URL(fileUrl);
            const relativePath = urlObj.pathname; 
            
            // Convert to absolute path on server
            const filePath = path.join(process.cwd(), relativePath);

            // Check if file exists
            if (fs.existsSync(filePath)) {
                await unlinkAsync(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file');
        }
    }

    private async _ensureDirectoryExists(directory: string): Promise<void> {
        if (!fs.existsSync(directory)) {
            await mkdirAsync(directory, { recursive: true });
        }
    }

    private _getFileExtension(mimetype: string): string {
        const types: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
        };
        return types[mimetype] || '.jpg';
    }
}