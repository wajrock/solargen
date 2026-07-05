/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {render} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Overview from './index';
import useOverviewParams from './hooks/useOverviewParams';
import {usePredictions} from '@/hooks/usePrediction';
import {formatDate} from '@/utils/formatters';
import {getMelbourneToday} from '@/utils/date';
import Chart from '@/components/shared/Chart/Chart';
import OverviewCards from './components/OverviewCards/OverviewCards';
import DatePicker from '@/components/shared/DatePicker/DatePicker';
import SiteSelect from '@/components/shared/SiteSelect/SiteSelect';

vi.mock('./hooks/useOverviewParams');
vi.mock('@/hooks/usePrediction');
vi.mock('@/utils/formatters');
vi.mock('@/utils/date');

vi.mock('@/components/shared/Chart/Chart', () => ({
    default: vi.fn(() => <div data-testid="mock-chart" />),
}));

vi.mock('./components/OverviewCards/OverviewCards', () => ({
    default: vi.fn(() => <div data-testid="mock-overview-cards" />),
}));

vi.mock('@/components/shared/DatePicker/DatePicker', () => ({
    default: vi.fn(() => <div data-testid="mock-date-picker" />),
}));

vi.mock('@/components/shared/SiteSelect/SiteSelect', () => ({
    default: vi.fn(() => <div data-testid="mock-site-select" />),
}));

describe('Overview', () => {
    const mockHourlyData = [
        {
            timestamp: '2026-07-05T10:00:00Z',
            production: {
                solar_generation: 150,
                monthly_avg: {solar_generation: 120},
            },
            weather: {
                shortwave_radiation: 800,
                diffuse_radiation: 200,
                temperature: 25,
                cloud_cover: 10,
                relative_humidity: 45,
            },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useOverviewParams).mockReturnValue({
            date: new Date('2026-07-05T00:00:00Z'),
            siteId: 'site-1',
            handleDateChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });

        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: {hourly: mockHourlyData} as any,
            loading: false,
            error: null,
        });

        vi.mocked(formatDate).mockImplementation((_, format) => {
            if (format === 'yyyy-MM-dd') return '2026-07-05';
            if (format === 'HH:mm') return '10:00';
            if (format === 'd MMMM') return '5 juillet';
            return 'formatted-date';
        });

        vi.mocked(getMelbourneToday).mockReturnValue(new Date('2026-08-01T00:00:00Z'));
    });

    it('sets the document title on mount', () => {
        render(<Overview />);
        expect(document.title).toBe('Tableau de bord | SolarGen');
    });

    it('fetches predictions with correctly formatted date and siteId', () => {
        render(<Overview />);

        expect(formatDate).toHaveBeenCalledWith(new Date('2026-07-05T00:00:00Z'), 'yyyy-MM-dd');
        expect(usePredictions).toHaveBeenCalledWith('2026-07-05', 'site-1');
    });

    it('passes handlers and current values to DatePicker and SiteSelect', () => {
        const mockHandleDateChange = vi.fn();
        const mockHandleSiteChange = vi.fn();

        vi.mocked(useOverviewParams).mockReturnValue({
            date: new Date('2026-07-05T00:00:00Z'),
            siteId: 'site-1',
            handleDateChange: mockHandleDateChange,
            handleSiteChange: mockHandleSiteChange,
        });

        render(<Overview />);

        expect(DatePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                value: new Date('2026-07-05T00:00:00Z'),
                onChange: mockHandleDateChange,
            }),
            undefined,
        );

        expect(SiteSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 'site-1',
                onChange: mockHandleSiteChange,
            }),
            undefined,
        );
    });

    it('passes predictionsData to OverviewCards', () => {
        render(<Overview />);

        expect(OverviewCards).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({hourly: mockHourlyData}),
            }),
            undefined,
        );
    });

    it('maps and passes correct data structure to the Solar Generation chart', () => {
        render(<Overview />);

        const chartCalls = vi.mocked(Chart).mock.calls;
        const solarChartProps = chartCalls[0][0];

        expect(solarChartProps.title).toBe('Production solaire sur 24h');
        expect(solarChartProps.data).toEqual([
            {
                timestamp: '10:00',
                solarGeneration: 150,
                monthlyAvgSolarGeneration: 120,
            },
        ]);
        expect(solarChartProps.margin).toEqual({top: 1, right: 0, left: -35, bottom: -10});
        expect(solarChartProps.series[0].label).toBe('5 juillet');
        expect(solarChartProps.series[1].label).toBe('Moyenne juillet');
    });

    it('maps and passes correct data structure to the weather charts', () => {
        render(<Overview />);

        const chartCalls = vi.mocked(Chart).mock.calls;

        const radiationChartProps = chartCalls[1][0];
        expect(radiationChartProps.title).toBe('Rayonnement solaire');
        expect(radiationChartProps.data).toEqual([
            {
                timestamp: '10:00',
                shortwaveRadiation: 800,
                diffuseRadiation: 200,
            },
        ]);

        const temperatureChartProps = chartCalls[2][0];
        expect(temperatureChartProps.title).toBe('Température');
        expect(temperatureChartProps.data).toEqual([
            {
                timestamp: '10:00',
                temperature: 25,
            },
        ]);

        const variablesChartProps = chartCalls[3][0];
        expect(variablesChartProps.title).toBe('Autre Variables');
        expect(variablesChartProps.data).toEqual([
            {
                timestamp: '10:00',
                cloudCover: 10,
                relativeHumidity: 45,
            },
        ]);
    });

    it('passes empty arrays to charts when predictionsData is undefined', () => {
        vi.mocked(usePredictions).mockReturnValue({
            predictionsData: undefined,
            loading: false,
            error: null,
        });

        render(<Overview />);

        const chartCalls = vi.mocked(Chart).mock.calls;
        expect(chartCalls[0][0].data).toEqual([]);
        expect(chartCalls[1][0].data).toEqual([]);
        expect(chartCalls[2][0].data).toEqual([]);
        expect(chartCalls[3][0].data).toEqual([]);
    });

    it('adjusts margins and labels appropriately when date and siteId are absent', () => {
        vi.mocked(useOverviewParams).mockReturnValue({
            date: undefined,
            siteId: undefined,
            handleDateChange: vi.fn(),
            handleSiteChange: vi.fn(),
        });

        render(<Overview />);

        const chartCalls = vi.mocked(Chart).mock.calls;
        const solarChartProps = chartCalls[0][0];

        expect(solarChartProps.margin).toEqual({top: 1, right: 0, left: -25, bottom: -10});
        expect(solarChartProps.series[0].label).toBe("Aujourd'hui");
        expect(solarChartProps.series[1].label).toBe('Moyenne août');
    });
});
