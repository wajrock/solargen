import {describe, it, expect, vi, afterEach} from 'vitest';
import {getCurrentYearPastMonths} from './history';

describe('getCurrentYearPastMonths', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('excludes the current month since it is not yet complete', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15)); // 15 juillet 2026

        const months = getCurrentYearPastMonths();

        expect(months).not.toContainEqual(expect.objectContaining({value: '07'}));
        expect(months[0]).toEqual({value: '06', label: 'Juin'});
    });

    it('returns months in descending order, most recent completed month first', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 2, 10)); // 10 mars 2026

        const months = getCurrentYearPastMonths();

        expect(months[0].value).toBe('02');
        expect(months[months.length - 1].value).toBe('01');
    });

    it('capitalizes the first letter of the month label', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 1)); // juin 2026

        const months = getCurrentYearPastMonths();

        expect(months.every((m) => m.label[0] === m.label[0].toUpperCase())).toBe(true);
    });

    it('returns an empty array in January since no month is completed yet', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 15)); // 15 janvier 2026

        const months = getCurrentYearPastMonths();

        expect(months).toEqual([]);
    });
});
