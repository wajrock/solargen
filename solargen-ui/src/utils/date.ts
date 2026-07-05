import {toZonedTime} from 'date-fns-tz';

export const MELBOURNE_TZ = 'Australia/Melbourne';
export const getMelbourneToday = (): Date => toZonedTime(new Date(), MELBOURNE_TZ);
export const isFutureDate = (date: Date): boolean => date > getMelbourneToday();

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export const isValidDateString = (dateStr: string): boolean => {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(dateStr)) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const isoStringToLocalDate = (isoDateString: string): Date => {
    return toZonedTime(new Date(isoDateString), MELBOURNE_TZ);
};
