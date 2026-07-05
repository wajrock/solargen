import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import History from './index';
import useHistoryParams from './hooks/useHistoryParams';
import {useHistory} from '@/hooks/useHistory';
import useVariables from '@/hooks/useVariables';

vi.mock('./hooks/useHistoryParams');
vi.mock('@/hooks/useVariables');
vi.mock('@/hooks/useHistory');

vi.mock('@/utils/date', () => ({
    getMelbourneToday: vi.fn(() => new Date('2026-07-05T00:00:00Z')),
}));

vi.mock('@/hooks/useInstallation', () => ({
    useInstallation: () => ({installationData: {sites: []}}),
}));

const mockHistoryData = {
    month: '06',
    current_year: {
        year: 2026,
        monthly: {solar_generation: 87456.32, capacity_factor: 0.138},
        daily: [
            {date: '2026-06-01', solar_generation: 2920.68, capacity_factor: 0.138},
            {date: '2026-06-02', solar_generation: 3100.45, capacity_factor: 0.147},
        ],
    },
    previous_year: {
        year: 2025,
        monthly: {solar_generation: 78234.12, capacity_factor: 0.124},
        daily: [
            {date: '2025-06-01', solar_generation: 2650.32, capacity_factor: 0.126},
            {date: '2025-06-02', solar_generation: 2890.15, capacity_factor: 0.137},
        ],
    },
};

describe('History', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useHistoryParams).mockReturnValue({
            monthParam: '06',
            siteParam: undefined,
            handleMonthChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });

        vi.mocked(useVariables).mockReturnValue({
            co2Rate: 0.78,
            electricRate: 0.35,
            setCo2Rate: vi.fn(),
            setElectricRate: vi.fn(),
        });

        vi.mocked(useHistory).mockReturnValue({
            historyData: mockHistoryData,
            loading: false,
            error: null,
        });
    });

    it('displays an error message when the request fails', () => {
        vi.mocked(useHistory).mockReturnValue({
            historyData: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        render(<History />);

        expect(screen.getByText('Impossible de charger les données')).toBeInTheDocument();
        expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('displays an empty state message when current year daily data is empty', () => {
        vi.mocked(useHistory).mockReturnValue({
            historyData: {
                month: '06',
                current_year: {year: 2026, monthly: {solar_generation: 0, capacity_factor: 0}, daily: []},
                previous_year: {year: 2025, monthly: {solar_generation: 0, capacity_factor: 0}, daily: []},
            },
            loading: false,
            error: null,
        });

        render(<History />);

        expect(screen.getByText('Aucune donnée pour ce mois')).toBeInTheDocument();
    });

    it('does not display error or empty state while still loading', () => {
        vi.mocked(useHistory).mockReturnValue({
            historyData: undefined,
            loading: true,
            error: null,
        });

        render(<History />);

        expect(screen.queryByText('Aucune donnée pour ce mois')).not.toBeInTheDocument();
        expect(screen.queryByText('Impossible de charger les données')).not.toBeInTheDocument();
    });

    it('computes CO2 savings by multiplying solar generation with the current co2Rate', () => {
        render(<History />);
        expect(screen.getByText(/68215\.93/)).toBeInTheDocument();
    });

    it('computes energy price by multiplying solar generation with the current electricRate', () => {
        render(<History />);
        expect(screen.getByText(/30609\.71/)).toBeInTheDocument();
    });

    it('defaults to the current Melbourne month when no month param is set in the URL', () => {
        vi.mocked(useHistoryParams).mockReturnValue({
            monthParam: undefined,
            siteParam: undefined,
            handleMonthChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });

        render(<History />);

        const calledMonth = vi.mocked(useHistory).mock.calls[0][0];
        expect(calledMonth).toMatch(/^\d{2}$/);
    });

    it('passes the site param from the URL through to useHistory', () => {
        vi.mocked(useHistoryParams).mockReturnValue({
            monthParam: '06',
            siteParam: '0Y6D',
            handleMonthChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });

        render(<History />);

        expect(useHistory).toHaveBeenCalledWith('06', '0Y6D');
    });
});
