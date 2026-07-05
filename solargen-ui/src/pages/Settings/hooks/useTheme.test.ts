import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import useTheme, {THEME} from './useTheme';

describe('useTheme', () => {
    const originalMatchMedia = window.matchMedia;

    const mockMatchMedia = (matchesDark: boolean) => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    };

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    it('initializes with the theme from localStorage if it exists', () => {
        localStorage.setItem('theme', THEME.DARK);
        mockMatchMedia(false);

        const {result} = renderHook(() => useTheme());

        expect(result.current.theme).toBe(THEME.DARK);
    });

    it('falls back to dark system preference when localStorage is empty', () => {
        mockMatchMedia(true);

        const {result} = renderHook(() => useTheme());

        expect(result.current.theme).toBe(THEME.DARK);
    });

    it('falls back to light system preference when localStorage is empty and system is not dark', () => {
        mockMatchMedia(false);

        const {result} = renderHook(() => useTheme());

        expect(result.current.theme).toBe(THEME.LIGHT);
    });

    it('updates DOM attributes and localStorage when theme changes to dark', () => {
        mockMatchMedia(false);
        const {result} = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme(THEME.DARK);
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe(THEME.DARK);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe(THEME.DARK);
    });

    it('updates DOM attributes and localStorage when theme changes to light', () => {
        mockMatchMedia(true);
        const {result} = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme(THEME.LIGHT);
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe(THEME.LIGHT);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('theme')).toBe(THEME.LIGHT);
    });
});
