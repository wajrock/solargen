/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {ReactNode} from 'react';
import {useInstallation} from './useInstallation';
import {api} from '@/services/api';

vi.mock('@/services/api', () => ({
    api: {get: vi.fn()},
}));

const mockInstallation = {
    name: 'Bundoora',
    latitude: -37.71828652,
    longitude: 145.0509752,
    total_capacity: 1842,
    sites: [
        {
            id: '0Y6D',
            kwp: 94.24,
            panel_model: 'Trina 310W',
            inverters: [{model: 'SolarEdge SE82.8K', quantity: 1}],
            avg_capacity_factor: 0.2807,
        },
    ],
};

function createWrapper() {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return function Wrapper({children}: {children: ReactNode}) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useInstallation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and returns installation data', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockInstallation});

        const {result} = renderHook(() => useInstallation(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/installation');
        expect(result.current.installationData).toEqual(mockInstallation);
    });

    it('exposes loading as true before the query resolves', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));

        const {result} = renderHook(() => useInstallation(), {wrapper: createWrapper()});

        expect(result.current.loading).toBe(true);
    });

    it('exposes an error when the request fails', async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

        const {result} = renderHook(() => useInstallation(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('does not refetch on remount within the same query client, thanks to staleTime Infinity', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockInstallation});

        const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
        const wrapper = ({children}: {children: ReactNode}) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        const {result: result1, unmount} = renderHook(() => useInstallation(), {wrapper});
        await waitFor(() => expect(result1.current.loading).toBe(false));
        unmount();

        const {result: result2} = renderHook(() => useInstallation(), {wrapper});
        await waitFor(() => expect(result2.current.installationData).toEqual(mockInstallation));

        expect(api.get).toHaveBeenCalledTimes(1);
    });
});
