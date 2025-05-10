// Attendance entity types
export interface Attendance {
    id: string;
    userId: string;
    photo_url: string;
    duration?: number | null; // Duration in minutes
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAttendanceDTO {
    userId: string;
    photo_url: string;
}

export interface UpdateAttendanceDTO {
    photo_url?: string;
}
