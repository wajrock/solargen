import {describe, it, expect} from 'vitest';
import {isValidDateString, parseDate, isFutureDate, isSameDay, getMelbourneToday} from './date';

describe('isValidDateString', () => {
    it('accepts a valid date string', () => {
        expect(isValidDateString('2026-06-15')).toBe(true);
    });

    it('rejects an invalid month', () => {
        expect(isValidDateString('2026-13-15')).toBe(false);
    });

    it('rejects an invalid day for a given month', () => {
        expect(isValidDateString('2026-02-30')).toBe(false);
    });

    it('rejects a non-existent leap day on a non-leap year', () => {
        expect(isValidDateString('2025-02-29')).toBe(false);
    });

    it('accepts a valid leap day on a leap year', () => {
        expect(isValidDateString('2024-02-29')).toBe(true);
    });

    it('rejects a malformed string', () => {
        expect(isValidDateString('15-06-2026')).toBe(false);
    });

    it('rejects an empty string', () => {
        expect(isValidDateString('')).toBe(false);
    });
});

describe('parseDate', () => {
    it('parses a date string into a Date object with matching year, month, and day', () => {
        const result = parseDate('2026-06-15');
        expect(result.getFullYear()).toBe(2026);
        expect(result.getMonth()).toBe(5);
        expect(result.getDate()).toBe(15);
    });
});

describe('isFutureDate', () => {
    it('returns true for a date far in the future', () => {
        const futureDate = new Date(getMelbourneToday().getFullYear() + 1, 0, 1);
        expect(isFutureDate(futureDate)).toBe(true);
    });

    it('returns false for a date in the past', () => {
        const pastDate = new Date(2020, 0, 1);
        expect(isFutureDate(pastDate)).toBe(false);
    });
});

describe('isSameDay', () => {
    it('returns true for two identical dates', () => {
        const date1 = new Date(2026, 6, 6);
        const date2 = new Date(2026, 6, 6);
        expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns true for the same day with different times', () => {
        const date1 = new Date(2026, 6, 6, 8, 0);
        const date2 = new Date(2026, 6, 6, 23, 59);
        expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different days', () => {
        const date1 = new Date(2026, 6, 6);
        const date2 = new Date(2026, 6, 7);
        expect(isSameDay(date1, date2)).toBe(false);
    });

    it('returns false for the same day and month but different years', () => {
        const date1 = new Date(2026, 6, 6);
        const date2 = new Date(2025, 6, 6);
        expect(isSameDay(date1, date2)).toBe(false);
    });

    it('returns false for the same day and year but different months', () => {
        const date1 = new Date(2026, 6, 6);
        const date2 = new Date(2026, 7, 6);
        expect(isSameDay(date1, date2)).toBe(false);
    });
});
