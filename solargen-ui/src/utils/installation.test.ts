import {describe, it, expect} from 'vitest';
import {
    getAvgCapacityFactor,
    getStandardDeviation,
    getSitePerformance,
    getBestSite,
    getWorstSite,
    getInvertersType,
} from './installation';
import {PERFORMANCE_LEVEL} from '@/types/installation';
import type {Site} from '@/types/installation';

const makeSite = (
    id: string,
    avgCapacityFactor: number,
    inverters: {model: string; quantity: number}[] = [],
): Site => ({
    id,
    kwp: 50,
    panel_model: 'Trina 330W',
    inverters,
    avg_capacity_factor: avgCapacityFactor,
});

describe('getAvgCapacityFactor', () => {
    it('computes the mean capacity factor across all sites', () => {
        const sites = [makeSite('A', 0.2), makeSite('B', 0.3), makeSite('C', 0.4)];
        expect(getAvgCapacityFactor(sites)).toBeCloseTo(0.3);
    });
});

describe('getStandardDeviation', () => {
    it('computes zero deviation when all sites have the same capacity factor', () => {
        const sites = [makeSite('A', 0.28), makeSite('B', 0.28), makeSite('C', 0.28)];
        const avg = getAvgCapacityFactor(sites);
        expect(getStandardDeviation(sites, avg)).toBe(0);
    });

    it('computes a positive deviation when values differ from the average', () => {
        const sites = [makeSite('A', 0.2), makeSite('B', 0.4)];
        const avg = getAvgCapacityFactor(sites);
        expect(getStandardDeviation(sites, avg)).toBeCloseTo(0.1);
    });
});

describe('getSitePerformance', () => {
    it('classifies as Excellent when value exceeds avg + standard deviation', () => {
        const result = getSitePerformance(0.35, 0.28, 0.03);
        expect(result).toEqual({type: PERFORMANCE_LEVEL.HIGH, text: 'Excellent'});
    });

    it('classifies as Faible when value is below avg - standard deviation', () => {
        const result = getSitePerformance(0.2, 0.28, 0.03);
        expect(result).toEqual({type: PERFORMANCE_LEVEL.LOW, text: 'Faible'});
    });

    it('classifies as Normal when value is within one standard deviation of the average', () => {
        const result = getSitePerformance(0.29, 0.28, 0.03);
        expect(result).toEqual({type: PERFORMANCE_LEVEL.NORMAL, text: 'Normal'});
    });

    it('classifies a value exactly at the upper boundary as Normal, not Excellent', () => {
        const result = getSitePerformance(0.31, 0.28, 0.03);
        expect(result.text).toBe('Normal');
    });
});

describe('getBestSite', () => {
    it('returns the site with the highest capacity factor', () => {
        const sites = [makeSite('A', 0.2), makeSite('B', 0.35), makeSite('C', 0.28)];
        expect(getBestSite(sites).id).toBe('B');
    });

    it('does not mutate the original sites array', () => {
        const sites = [makeSite('A', 0.2), makeSite('B', 0.35)];
        const original = [...sites];
        getBestSite(sites);
        expect(sites).toEqual(original);
    });
});

describe('getWorstSite', () => {
    it('returns the site with the lowest capacity factor', () => {
        const sites = [makeSite('A', 0.2), makeSite('B', 0.35), makeSite('C', 0.15)];
        expect(getWorstSite(sites).id).toBe('C');
    });
});

describe('getInvertersType', () => {
    it('returns unique inverter models across all sites, formatted', () => {
        const sites = [
            makeSite('A', 0.2, [{model: 'SolarEdge SE25K', quantity: 1}]),
            makeSite('B', 0.3, [{model: 'SolarEdge SE25K', quantity: 2}]),
        ];
        expect(getInvertersType(sites)).toEqual(['SE25K']);
    });

    it('collects distinct models from multiple different sites', () => {
        const sites = [
            makeSite('A', 0.2, [{model: 'SolarEdge SE25K', quantity: 1}]),
            makeSite('B', 0.3, [{model: 'ABB', quantity: 3}]),
        ];
        expect(getInvertersType(sites)).toEqual(['SE25K', 'ABB']);
    });

    it('handles multiple inverters within a single site', () => {
        const sites = [
            makeSite('A', 0.2, [
                {model: 'SolarEdge SE25K', quantity: 2},
                {model: 'SolarEdge SE15K', quantity: 1},
            ]),
        ];
        expect(getInvertersType(sites)).toEqual(['SE25K', 'SE15K']);
    });
});
