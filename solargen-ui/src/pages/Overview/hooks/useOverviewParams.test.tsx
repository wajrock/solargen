/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useSearchParams} from 'react-router-dom';
import useOverviewParams from './useOverviewParams';
import {isFutureDate, isValidDateString, parseDate} from '@/utils/date';
import {formatDate} from '@/utils/formatters';

vi.mock('react-router-dom');
vi.mock('@/utils/date');
vi.mock('@/utils/formatters');

describe('useOverviewParams', () => {
    let mockParams: URLSearchParams;
    const mockSetSearchParams = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockParams = new URLSearchParams();
        vi.mocked(useSearchParams).mockReturnValue([mockParams, mockSetSearchParams]);
    });

    it('returns undefined for date when date param is missing', () => {
        const {result} = renderHook(() => useOverviewParams());
        expect(result.current.date).toBeUndefined();
    });

    it('returns undefined for date when date string is invalid', () => {
        mockParams.set('date', 'invalid-date');
        vi.mocked(isValidDateString).mockReturnValue(false);

        const {result} = renderHook(() => useOverviewParams());

        expect(result.current.date).toBeUndefined();
        expect(isValidDateString).toHaveBeenCalledWith('invalid-date');
    });

    it('returns undefined for date when date is in the future', () => {
        mockParams.set('date', '2030-01-01');
        const mockParsedDate = new Date('2030-01-01');

        vi.mocked(isValidDateString).mockReturnValue(true);
        vi.mocked(parseDate).mockReturnValue(mockParsedDate);
        vi.mocked(isFutureDate).mockReturnValue(true);

        const {result} = renderHook(() => useOverviewParams());

        expect(result.current.date).toBeUndefined();
        expect(isFutureDate).toHaveBeenCalledWith(mockParsedDate);
    });

    it('returns the parsed date when param is valid and not in the future', () => {
        mockParams.set('date', '2026-07-01');
        const mockParsedDate = new Date('2026-07-01');

        vi.mocked(isValidDateString).mockReturnValue(true);
        vi.mocked(parseDate).mockReturnValue(mockParsedDate);
        vi.mocked(isFutureDate).mockReturnValue(false);

        const {result} = renderHook(() => useOverviewParams());

        expect(result.current.date).toEqual(mockParsedDate);
    });

    it('returns siteId from URL params when present', () => {
        mockParams.set('site', 'site-123');
        const {result} = renderHook(() => useOverviewParams());
        expect(result.current.siteId).toBe('site-123');
    });

    it('returns undefined for siteId when site param is missing', () => {
        const {result} = renderHook(() => useOverviewParams());
        expect(result.current.siteId).toBeUndefined();
    });

    it('sets the date param correctly when handleDateChange is called with a date', () => {
        vi.mocked(formatDate).mockReturnValue('2026-07-05');
        const {result} = renderHook(() => useOverviewParams());

        act(() => {
            result.current.handleDateChange(new Date('2026-07-05T00:00:00Z'));
        });

        const updaterFunction = mockSetSearchParams.mock.calls[0][0];
        const nextParams = updaterFunction(new URLSearchParams());

        expect(formatDate).toHaveBeenCalledWith(new Date('2026-07-05T00:00:00Z'), 'yyyy-MM-dd');
        expect(nextParams.get('date')).toBe('2026-07-05');
    });

    it('deletes the date param when handleDateChange is called with undefined', () => {
        const {result} = renderHook(() => useOverviewParams());

        act(() => {
            result.current.handleDateChange(undefined);
        });

        const initialParams = new URLSearchParams([['date', '2026-07-05']]);
        const updaterFunction = mockSetSearchParams.mock.calls[0][0];
        const nextParams = updaterFunction(initialParams);

        expect(nextParams.has('date')).toBe(false);
    });

    it('sets the site param when handleSiteChange is called with a valid string', () => {
        const {result} = renderHook(() => useOverviewParams());

        act(() => {
            result.current.handleSiteChange('new-site-id');
        });

        const updaterFunction = mockSetSearchParams.mock.calls[0][0];
        const nextParams = updaterFunction(new URLSearchParams());

        expect(nextParams.get('site')).toBe('new-site-id');
    });

    it('deletes the site param when handleSiteChange is called with undefined', () => {
        const {result} = renderHook(() => useOverviewParams());

        act(() => {
            result.current.handleSiteChange(undefined);
        });

        const initialParams = new URLSearchParams([['site', 'old-site-id']]);
        const updaterFunction = mockSetSearchParams.mock.calls[0][0];
        const nextParams = updaterFunction(initialParams);

        expect(nextParams.has('site')).toBe(false);
    });
});
