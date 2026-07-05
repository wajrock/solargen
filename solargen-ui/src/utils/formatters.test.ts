import {describe, it, expect} from 'vitest';
import {
    formatCapacity,
    formatSiteId,
    formatInverterModel,
    formatProduction,
    formatCapacityFactor,
    formatCO2Savings,
    formatEnergyPrice,
    formatCardTrend,
    formatTrend,
} from './formatters';

describe('formatCapacity', () => {
    it('formats a capacity value with two decimals and unit', () => {
        expect(formatCapacity(94.24)).toBe('94.24 kWp');
    });

    it('pads a whole number with two decimals', () => {
        expect(formatCapacity(66)).toBe('66.00 kWp');
    });
});

describe('formatSiteId', () => {
    it('prefixes the site id with a hash', () => {
        expect(formatSiteId('0Y6D')).toBe('#0Y6D');
    });
});

describe('formatInverterModel', () => {
    it('extracts the model part after the brand name', () => {
        expect(formatInverterModel('SolarEdge SE82.8K')).toBe('SE82.8K');
    });

    it('returns the string as-is when there is no space', () => {
        expect(formatInverterModel('ABB')).toBe('ABB');
    });

    it('only takes the second word, ignoring anything after it', () => {
        expect(formatInverterModel('SolarEdge SE25K Extra')).toBe('SE25K');
    });
});

describe('formatProduction', () => {
    it('formats production with two decimals and unit', () => {
        expect(formatProduction(2920.68)).toBe('2920.68 kWh');
    });
});

describe('formatCapacityFactor', () => {
    it('converts a decimal ratio to a percentage with one decimal', () => {
        expect(formatCapacityFactor(0.138)).toBe('13.8%');
    });

    it('rounds correctly at the boundary', () => {
        expect(formatCapacityFactor(0.2807)).toBe('28.1%');
    });
});

describe('formatCO2Savings', () => {
    it('multiplies production by the CO2 rate', () => {
        expect(formatCO2Savings(1000, 0.78)).toBe('780.00 kgCO₂');
    });
});

describe('formatEnergyPrice', () => {
    it('multiplies production by the electric rate', () => {
        expect(formatEnergyPrice(1000, 0.35)).toBe('350.00  A$');
    });
});

describe('formatCardTrend', () => {
    it('computes a positive percentage variation', () => {
        expect(formatCardTrend(110, 100)).toBe('10');
    });

    it('computes a negative percentage variation', () => {
        expect(formatCardTrend(90, 100)).toBe('-10');
    });

    it('returns zero when value equals the average', () => {
        expect(formatCardTrend(100, 100)).toBe('0');
    });
});

describe('formatTrend', () => {
    it('formats a positive trend without a sign, using absolute value', () => {
        expect(formatTrend(6.2, '%')).toBe('6.2%');
    });

    it('formats a negative trend as a positive absolute value', () => {
        expect(formatTrend(-3.14, '%')).toBe('3.1%');
    });
});
