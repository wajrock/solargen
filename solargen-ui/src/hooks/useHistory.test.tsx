/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {ReactNode} from 'react';
import {useHistory} from './useHistory';
import {api} from '@/services/api';

vi.mock('@/services/api', () => ({
    api: {get: vi.fn()},
}));

const mockGlobalHistory = {
    month: '06',
    current_year: {
        year: 2026,
        monthly: {solar_generation: 87456.32, capacity_factor: 0.138},
        daily: [{date: '2026-06-01', solar_generation: 2920.68, capacity_factor: 0.138}],
    },
    previous_year: {
        year: 2025,
        monthly: {solar_generation: 78234.12, capacity_factor: 0.124},
        daily: [{date: '2025-06-01', solar_generation: 2650.32, capacity_factor: 0.126}],
    },
};

const mockSiteHistory = {
    ...mockGlobalHistory,
    site_id: '0Y6D',
};

function createWrapper() {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return function Wrapper({children}: {children: ReactNode}) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the global history endpoint when no siteId is provided', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockGlobalHistory});

        const {result} = renderHook(() => useHistory('06'), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/history/06');
        expect(result.current.historyData).toEqual(mockGlobalHistory);
    });

    it('calls the site-specific history endpoint when siteId is provided', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockSiteHistory});

        const {result} = renderHook(() => useHistory('06', '0Y6D'), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/history/06/0Y6D');
        expect(result.current.historyData).toEqual(mockSiteHistory);
    });

    it('exposes loading as true before the query resolves', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // never resolves

        const {result} = renderHook(() => useHistory('06'), {wrapper: createWrapper()});

        expect(result.current.loading).toBe(true);
    });

    it('exposes an error when the request fails', async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

        const {result} = renderHook(() => useHistory('06'), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('uses a different query key for different months, keeping caches separate', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockGlobalHistory});

        const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
        const wrapper = ({children}: {children: ReactNode}) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        renderHook(() => useHistory('06'), {wrapper});
        renderHook(() => useHistory('07'), {wrapper});

        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));

        expect(api.get).toHaveBeenCalledWith('/history/06');
        expect(api.get).toHaveBeenCalledWith('/history/07');
    });
});
