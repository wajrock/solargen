import {describe, it, expect, vi, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useTime} from './useTime';

describe('useTime', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('formats the initial date and time correctly for Melbourne timezone', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-15T03:30:00Z'));

        const {result} = renderHook(() => useTime());

        expect(result.current.date).toBe('15 juin 2026');
        expect(result.current.time).toBe('13:30');
    });

    it('updates the time after one second passes', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-15T03:30:00Z'));

        const {result} = renderHook(() => useTime());
        const initialTime = result.current.time;

        act(() => {
            vi.advanceTimersByTime(60000);
        });

        expect(result.current.time).not.toBe(initialTime);
    });

    it('clears the interval on unmount to avoid memory leaks', () => {
        vi.useFakeTimers();
        const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

        const {unmount} = renderHook(() => useTime());
        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});
