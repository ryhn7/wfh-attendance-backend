import { format, toZonedTime } from 'date-fns-tz';
import { parseISO, formatISO } from 'date-fns';

// Indonesian timezone
const _TIMEZONE = 'Asia/Jakarta'; // GMT+7

export class DateUtils {
    /**
     * Get current time in Indonesian timezone
     */
    static getCurrentJakartaTime(): Date {
        const now = new Date();
        return toZonedTime(now, _TIMEZONE);
    }

    /**
     * Format date to Indonesian timezone string
     */
    static formatToJakartaTime(date: Date, formatPattern: string = 'yyyy-MM-dd HH:mm:ss'): string {
        const jakartaTime = toZonedTime(date, _TIMEZONE);
        return format(jakartaTime, formatPattern, { timeZone: _TIMEZONE });
    }

    /**
     * Get the start of day in Indonesian timezone
     */
    static getJakartaDateStart(date: Date = new Date()): Date {
        const jakartaDate = toZonedTime(date, _TIMEZONE);
        jakartaDate.setHours(0, 0, 0, 0);
        return jakartaDate;
    }

    /**
     * Get hour in Indonesian timezone
     */
    static getJakartaHour(date: Date = new Date()): number {
        const jakartaTime = toZonedTime(date, _TIMEZONE);
        return jakartaTime.getHours();
    }

    /**
     * Get ISO string in Jakarta timezone (for database storage)
     * This ensures the timezone offset is preserved
     */
    static getJakartaISOString(date: Date = new Date()): string {
        const jakartaTime = toZonedTime(date, _TIMEZONE);
        return formatISO(jakartaTime);
    }

    /**
     * Convert database date to Jakarta time
     * Use this when retrieving dates from the database
     */
    static dbDateToJakarta(dbDate: Date): Date {
        return toZonedTime(dbDate, _TIMEZONE);
    }

    /**
     * Calculate hours between two dates in Jakarta timezone
     */
    static calculateHoursBetween(startDate: Date, endDate: Date): number {
        const jakartaStart = toZonedTime(startDate, _TIMEZONE);
        const jakartaEnd = toZonedTime(endDate, _TIMEZONE);

        const diffMs = jakartaEnd.getTime() - jakartaStart.getTime();
        return diffMs / (1000 * 60 * 60);
    }

    /**
     * Format duration in hours to a human-readable string
     */
    static formatWorkDuration(hours: number): string {
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        return `${wholeHours}h ${minutes}m`;
    }
}