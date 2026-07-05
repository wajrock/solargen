import {render, screen} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Overview from './index';
import useOverviewParams from './hooks/useOverviewParams';
import {usePredictions} from '@/hooks/usePrediction';
import StateMessage from '@/components/shared/StateMessage/StateMessage';

vi.mock('./hooks/useOverviewParams');
vi.mock('@/hooks/usePrediction');

vi.mock('@/hooks/useInstallation', () => ({
    useInstallation: () => ({installationData: {sites: []}, loading: false, error: null}),
}));

vi.mock('@/components/shared/Chart/Chart', () => ({
    default: vi.fn(() => <div data-testid="mock-chart" />),
}));

vi.mock('@/components/shared/StateMessage/StateMessage', () => ({
    default: vi.fn(() => <div data-testid="mock-state-message" />),
}));

function renderWithQueryClient(ui: React.ReactElement) {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockPredictionsData = {
    date: '2026-07-05',
    daily: {solar_generation: 2920.68, capacity_factor: 0.138},
    monthly_avg: {solar_generation: 2750.4, capacity_factor: 0.129},
    peak: {timestamp: '2026-07-05T13:00:00', solar_generation: 565.23},
    hourly: [
        {
            timestamp: '2026-07-05T13:00:00',
            production: {
                solar_generation: 565.23,
                capacity_factor: 0.268,
                monthly_avg: {solar_generation: 520.1, capacity_factor: 0.2},
            },
            weather: {
                temperature: 14.9,
                relative_humidity: 72,
                cloud_cover: 88,
                shortwave_radiation: 281,
                diffuse_radiation: 172,
            },
        },
    ],
};

describe('Overview', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useOverviewParams).mockReturnValue({
            date: undefined,
            siteId: undefined,
            handleDateChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });
    });

    it('displays an error message when the request fails, with a retry option', () => {
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        renderWithQueryClient(<Overview />);

        expect(screen.getByTestId('mock-state-message')).toBeInTheDocument();
        expect(StateMessage).toHaveBeenCalledWith(
            expect.objectContaining({title: 'Impossible de charger les données'}),
            undefined,
        );
    });

    it('displays the "today" empty message when no date is selected and hourly is empty', () => {
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: {...mockPredictionsData, hourly: []},
            loading: false,
            error: null,
        });

        renderWithQueryClient(<Overview />);

        expect(StateMessage).toHaveBeenCalledWith(
            expect.objectContaining({title: 'Aucune prédiction disponible pour le moment'}),
            undefined,
        );
    });

    it('displays the "past date" empty message when a past date is selected and hourly is empty', () => {
        vi.mocked(useOverviewParams).mockReturnValue({
            date: new Date(2020, 0, 1),
            siteId: undefined,
            handleDateChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: {...mockPredictionsData, hourly: []},
            loading: false,
            error: null,
        });

        renderWithQueryClient(<Overview />);

        expect(StateMessage).toHaveBeenCalledWith(
            expect.objectContaining({title: 'Aucune donnée pour cette date'}),
            undefined,
        );
    });

    it('does not display the empty state while still loading, even if hourly is empty', () => {
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: {...mockPredictionsData, hourly: []},
            loading: true,
            error: null,
        });

        renderWithQueryClient(<Overview />);

        expect(screen.queryByTestId('mock-state-message')).not.toBeInTheDocument();
    });

    it('renders 4 Chart components when data is present and not empty', () => {
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: mockPredictionsData,
            loading: false,
            error: null,
        });

        renderWithQueryClient(<Overview />);

        expect(screen.getAllByTestId('mock-chart')).toHaveLength(4);
    });

    it('calls usePredictions with the formatted date string and siteId', () => {
        vi.mocked(useOverviewParams).mockReturnValue({
            date: new Date(2026, 5, 15),
            siteId: '0Y6D',
            handleDateChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: mockPredictionsData,
            loading: false,
            error: null,
        });

        renderWithQueryClient(<Overview />);

        expect(usePredictions).toHaveBeenCalledWith('2026-06-15', '0Y6D');
    });

    it('calls usePredictions with undefined date when no date is selected', () => {
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: mockPredictionsData,
            loading: false,
            error: null,
        });

        renderWithQueryClient(<Overview />);

        expect(usePredictions).toHaveBeenCalledWith(undefined, undefined);
    });
});
