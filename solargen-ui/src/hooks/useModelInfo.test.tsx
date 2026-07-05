/* eslint-disable @typescript-eslint/unbound-method */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {ReactNode} from 'react';
import useModelInfo from './useModelInfo';
import {api} from '@/services/api';

vi.mock('@/services/api', () => ({
    api: {get: vi.fn()},
}));

const mockModelInfo = {
    model: 'LightGBM',
    r2: 0.887,
    mae: 0.064,
    train_start: '2020-01-08',
    train_end: '2022-04-23',
    features: ['temperature', 'shortwave_radiation'],
    sites_count: 21,
};

function createWrapper() {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return function Wrapper({children}: {children: ReactNode}) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useModelInfo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and returns model info data', async () => {
        vi.mocked(api.get).mockResolvedValue({data: mockModelInfo});

        const {result} = renderHook(() => useModelInfo(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(api.get).toHaveBeenCalledWith('/model-info');
        expect(result.current.modelInfoData).toEqual(mockModelInfo);
    });

    it('exposes loading as true before the query resolves', () => {
        vi.mocked(api.get).mockReturnValue(new Promise(() => {}));

        const {result} = renderHook(() => useModelInfo(), {wrapper: createWrapper()});

        expect(result.current.loading).toBe(true);
    });

    it('exposes an error when the request fails', async () => {
        vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

        const {result} = renderHook(() => useModelInfo(), {wrapper: createWrapper()});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
    });
});
