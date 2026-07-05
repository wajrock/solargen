import {describe, it, expect} from 'vitest';
import {formatPredictionsStatusTooltip} from './formatPredictionsStatusTooltip';
import type {PredictionsStatus} from '@/types/prediction';

const createMockPredictionsStatus = (overrides?: Partial<PredictionsStatus>): PredictionsStatus => ({
    date: '2026-07-05',
    fetched_at: '2026-07-05T12:00:00Z',
    prediction_count: 504,
    weather_count: 24,
    is_complete: true,
    ...overrides,
});

describe('formatPredictionsStatusTooltip', () => {
    it('returns missing counts for both predictions and weather when both are below thresholds', () => {
        const status = createMockPredictionsStatus({
            prediction_count: 500,
            weather_count: 20,
            is_complete: false,
        });

        const result = formatPredictionsStatusTooltip(status);

        expect(result).toBe('Il manque 4 prédictions et 4 données météos');
    });

    it('returns only missing predictions count when weather data meets the threshold', () => {
        const status = createMockPredictionsStatus({
            prediction_count: 400,
            weather_count: 24,
            is_complete: false,
        });

        const result = formatPredictionsStatusTooltip(status);

        expect(result).toBe('Il manque 104 prédictions');
    });

    it('returns only missing weather count when predictions data meets the threshold', () => {
        const status = createMockPredictionsStatus({
            prediction_count: 504,
            weather_count: 10,
            is_complete: false,
        });

        const result = formatPredictionsStatusTooltip(status);

        expect(result).toBe('Il manque 14 données météos');
    });

    it('returns complete status when both predictions and weather exactly meet their thresholds', () => {
        const status = createMockPredictionsStatus({
            prediction_count: 504,
            weather_count: 24,
            is_complete: true,
        });

        const result = formatPredictionsStatusTooltip(status);

        expect(result).toBe('Prédictions complètes');
    });
});
