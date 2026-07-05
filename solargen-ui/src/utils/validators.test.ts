import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {validateOverviewParams, validateHistoryParams} from './validators';
import {getInstallation} from '@/services/installation';

vi.mock('@/services/installation', () => ({
    getInstallation: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    redirect: vi.fn((url: string) => ({redirected: true, url})),
}));

const mockSites = [{id: '0Y6D'}, {id: 'CIDK'}];

function makeRequest(url: string): Request {
    return new Request(url);
}

describe('validateOverviewParams', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 15)); // 15 juin 2026
        vi.mocked(getInstallation).mockResolvedValue({data: {sites: mockSites}} as never);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns null when no params are provided', async () => {
        const result = await validateOverviewParams(makeRequest('https://app.test/dashboard'));
        expect(result).toBeNull();
    });

    it('returns null for a valid past date and existing site', async () => {
        const result = await validateOverviewParams(
            makeRequest('https://app.test/dashboard?date=2026-01-15&site=0Y6D'),
        );
        expect(result).toBeNull();
    });

    it('redirects and strips the date when it has an invalid format', async () => {
        const result = await validateOverviewParams(makeRequest('https://app.test/dashboard?date=invalid'));
        expect(result).not.toBeNull();
    });

    it('redirects and strips the date when it is in the future', async () => {
        const result = await validateOverviewParams(makeRequest('https://app.test/dashboard?date=2027-01-01'));
        expect(result).not.toBeNull();
    });

    it('redirects and strips the date when it equals today', async () => {
        const result = await validateOverviewParams(makeRequest('https://app.test/dashboard?date=2026-06-15'));
        expect(result).not.toBeNull();
    });

    it('redirects and strips the site when it does not exist', async () => {
        const result = await validateOverviewParams(makeRequest('https://app.test/dashboard?site=UNKNOWN'));
        expect(result).not.toBeNull();
    });

    it('redirects only once even when both date and site are invalid', async () => {
        const result = await validateOverviewParams(
            makeRequest('https://app.test/dashboard?date=invalid&site=UNKNOWN'),
        );
        expect(result).not.toBeNull();
    });
});

describe('validateHistoryParams', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 15)); // 15 juin 2026, mois courant = 06
        vi.mocked(getInstallation).mockResolvedValue({data: {sites: mockSites}} as never);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns null when no params are provided', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history'));
        expect(result).toBeNull();
    });

    it('returns null for a valid past month', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history?month=01'));
        expect(result).toBeNull();
    });

    it('returns null for the current month', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history?month=06'));
        expect(result).toBeNull();
    });

    it('redirects and strips the month when it is in the future', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history?month=07'));
        expect(result).not.toBeNull();
    });

    it('redirects and strips the month when the format is not two digits', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history?month=1'));
        expect(result).not.toBeNull();
    });

    it('redirects and strips the month when it is not a valid number', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history?month=ab'));
        expect(result).not.toBeNull();
    });

    it('redirects and strips the site when it does not exist', async () => {
        const result = await validateHistoryParams(makeRequest('https://app.test/history?site=UNKNOWN'));
        expect(result).not.toBeNull();
    });
});
