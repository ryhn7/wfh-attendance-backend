import { format, toZonedTime } from 'date-fns-tz';
import { parseISO, formatISO, startOfDay } from 'date-fns';

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
    }    /**
     * Get the start of day in Indonesian timezone
     * Ensures the date is correct for Jakarta timezone
     */
    static getJakartaDateStart(date: Date = new Date()): Date {
        // Convert to Jakarta timezone first, then get start of day
        const jakartaDate = toZonedTime(date, _TIMEZONE);
        const startDay = startOfDay(jakartaDate);

        // Create a Date that won't be affected by timezone conversion
        return new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 0, 0, 0);
    }

    /**
     * Get Jakarta date as a formatted string for database storage
     * Returns date in yyyy-MM-dd format which is standard for database date storage
     */
    static getJakartaDateForDB(date: Date = new Date()): string {
        const jakartaDate = toZonedTime(date, _TIMEZONE);
        return format(jakartaDate, 'yyyy-MM-dd', { timeZone: _TIMEZONE });
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

    /**
     * Format date to dd-mm-yyyy format
     */
    static formatToDateString(date: Date, formatPattern: string = 'dd-MM-yyyy'): string {
        const jakartaTime = toZonedTime(date, _TIMEZONE);
        return format(jakartaTime, formatPattern, { timeZone: _TIMEZONE });
    }
}