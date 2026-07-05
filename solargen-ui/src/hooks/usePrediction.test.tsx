/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {ReactNode} from 'react';
import {usePredictions, usePredictionsStatus} from './usePrediction';
import {api} from '@/services/api';

vi.mock('@/services/api', () => ({
    api: {get: vi.fn()},
}));

const mockGlobalPrediction = {
    date: '2026-06-15',
    daily: {solar_generation: 2920.68, capacity_factor: 0.138},
    monthly_avg: {solar_generation: 2750.4, capacity_factor: 0.129},
    peak: {timestamp: '2026-06-15T13:00:00', solar_generation: 565.23},
    hourly: [],
};

const mockSitePrediction = {
    ...mockGlobalPrediction,
    site_id: '0Y6D',
};

const mockPredictionsStatus = {
    date: '2026-06-15',
    fetched_at: '2026-06-15T01:02:34',
    prediction_count: 504,
    weather_count: 24,
    is_complete: true,
};

function createWrapper() {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return function Wrapper({children}: {children: ReactNode}) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('usePredictions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls today predictions endpoint when neither date nor site is provided', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockGlobalPrediction});

        const {result} = renderHook(() => usePredictions(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/predictions/today');
        expect(result.current.predictionsData).toEqual(mockGlobalPrediction);
    });

    it('calls today by site endpoint when only siteId is provided', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockSitePrediction});

        const {result} = renderHook(() => usePredictions(undefined, '0Y6D'), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/predictions/today/0Y6D');
        expect(result.current.predictionsData).toEqual(mockSitePrediction);
    });

    it('calls date endpoint when only date is provided', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockGlobalPrediction});

        const {result} = renderHook(() => usePredictions('2026-06-15'), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/predictions/2026-06-15');
    });

    it('calls date and site endpoint when both are provided', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockSitePrediction});

        const {result} = renderHook(() => usePredictions('2026-06-15', '0Y6D'), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/predictions/2026-06-15/0Y6D');
    });

    it('uses distinct cache entries for different date/site combinations', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockGlobalPrediction});

        const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
        const wrapper = ({children}: {children: ReactNode}) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        renderHook(() => usePredictions('2026-06-15'), {wrapper});
        renderHook(() => usePredictions('2026-06-16'), {wrapper});

        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    });
});

describe('usePredictionsStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and returns the predictions status', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockPredictionsStatus});

        const {result} = renderHook(() => usePredictionsStatus(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/predictions/status');
        expect(result.current.predictionsStatusData).toEqual(mockPredictionsStatus);
    });

    it('exposes an error when the request fails', async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

        const {result} = renderHook(() => usePredictionsStatus(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
    });
});
