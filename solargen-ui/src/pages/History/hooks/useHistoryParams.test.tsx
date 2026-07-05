import {describe, it, expect} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import type {ReactNode} from 'react';
import useHistoryParams from './useHistoryParams';

function createWrapper(initialRoute: string) {
    return function Wrapper({children}: {children: ReactNode}) {
        return <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>;
    };
}

describe('useHistoryParams', () => {
    it('returns undefined for month and site when no params are in the URL', () => {
        const {result} = renderHook(() => useHistoryParams(), {wrapper: createWrapper('/history')});

        expect(result.current.monthParam).toBeUndefined();
        expect(result.current.siteParam).toBeUndefined();
    });

    it('reads existing month and site params from the URL', () => {
        const {result} = renderHook(() => useHistoryParams(), {
            wrapper: createWrapper('/history?month=06&site=0Y6D'),
        });

        expect(result.current.monthParam).toBe('06');
        expect(result.current.siteParam).toBe('0Y6D');
    });

    it('sets the month param when handleMonthChange is called with a value', () => {
        const {result} = renderHook(() => useHistoryParams(), {wrapper: createWrapper('/history')});

        act(() => {
            result.current.handleMonthChange('07');
        });

        expect(result.current.monthParam).toBe('07');
    });

    it('removes the month param when handleMonthChange is called with undefined', () => {
        const {result} = renderHook(() => useHistoryParams(), {wrapper: createWrapper('/history?month=06')});

        act(() => {
            result.current.handleMonthChange(undefined);
        });

        expect(result.current.monthParam).toBeUndefined();
    });

    it('sets the site param when handleSiteChange is called with a value', () => {
        const {result} = renderHook(() => useHistoryParams(), {wrapper: createWrapper('/history')});

        act(() => {
            result.current.handleSiteChange('CIDK');
        });

        expect(result.current.siteParam).toBe('CIDK');
    });

    it('removes the site param when handleSiteChange is called with undefined', () => {
        const {result} = renderHook(() => useHistoryParams(), {wrapper: createWrapper('/history?site=CIDK')});

        act(() => {
            result.current.handleSiteChange(undefined);
        });

        expect(result.current.siteParam).toBeUndefined();
    });

    it('updates the month param without affecting the existing site param', () => {
        const {result} = renderHook(() => useHistoryParams(), {
            wrapper: createWrapper('/history?month=06&site=0Y6D'),
        });

        act(() => {
            result.current.handleMonthChange('07');
        });

        expect(result.current.monthParam).toBe('07');
        expect(result.current.siteParam).toBe('0Y6D');
    });
});
