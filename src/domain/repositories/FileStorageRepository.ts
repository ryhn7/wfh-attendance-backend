export interface FileUpload {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

export interface FileStorageRepository {
  uploadFile(file: FileUpload, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}