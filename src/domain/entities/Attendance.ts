export interface Attendance {
    id: string;
    userId: string;
    date: Date;
    checkInTime: Date;
    checkOutTime?: Date | null;
    checkInPhotoUrl: string;
    checkOutPhotoUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Used for check-in operation
export interface CreateAttendanceDTO {
    userId: string;
    checkInPhotoUrl: string;
    // Date is handled by the server
}

// Used for check-out operation
export interface UpdateAttendanceDTO {
    checkOutPhotoUrl: string;
    // The checkOutTime is handled by the server
}

// For attendance validation
export interface AttendanceValidation {
    success: boolean;
    message: string;
}