import {describe, it, expect, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import useVariables from './useVariables';

describe('useVariables', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns default values when localStorage is empty', () => {
        const {result} = renderHook(() => useVariables());

        expect(result.current.co2Rate).toBe(0.82);
        expect(result.current.electricRate).toBe(0.348);
    });

    it('reads existing values from localStorage on initialization', () => {
        localStorage.setItem('co2-rate', '0.78');
        localStorage.setItem('electric-rate', '0.35');

        const {result} = renderHook(() => useVariables());

        expect(result.current.co2Rate).toBe(0.78);
        expect(result.current.electricRate).toBe(0.35);
    });

    it('persists co2Rate to localStorage when updated', () => {
        const {result} = renderHook(() => useVariables());

        act(() => {
            result.current.setCo2Rate(0.65);
        });

        expect(result.current.co2Rate).toBe(0.65);
        expect(localStorage.getItem('co2-rate')).toBe('0.65');
    });

    it('persists electricRate to localStorage when updated', () => {
        const {result} = renderHook(() => useVariables());

        act(() => {
            result.current.setElectricRate(0.4);
        });

        expect(result.current.electricRate).toBe(0.4);
        expect(localStorage.getItem('electric-rate')).toBe('0.4');
    });

    it('keeps co2Rate and electricRate independent when only one changes', () => {
        const {result} = renderHook(() => useVariables());

        act(() => {
            result.current.setCo2Rate(0.9);
        });

        expect(result.current.co2Rate).toBe(0.9);
        expect(result.current.electricRate).toBe(0.348);
    });
});
