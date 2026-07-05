/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import OverviewCards from './OverviewCards';
import useVariables from '@/hooks/useVariables';
import Card from '@/components/shared/Card/Card';
import TrendTag from '@/components/shared/Tag/TrendTag/TrendTag';
import Tag from '@/components/shared/Tag/Tag';
import {
    formatCapacityFactor,
    formatCO2Savings,
    formatDate,
    formatEnergyPrice,
    formatProduction,
} from '@/utils/formatters';

vi.mock('@/hooks/useVariables');
vi.mock('@/utils/formatters');

vi.mock('@/components/shared/Card/Card', () => ({
    default: vi.fn(({children}) => <div>{children}</div>),
}));

vi.mock('@/components/shared/Tag/TrendTag/TrendTag', () => ({
    default: vi.fn(() => <div data-testid="mock-trend-tag" />),
}));

vi.mock('@/components/shared/Tag/Tag', () => ({
    default: vi.fn(() => <div data-testid="mock-tag" />),
}));

describe('OverviewCards', () => {
    const mockData = {
        daily: {
            solar_generation: 1500,
            capacity_factor: 0.25,
        },
        monthly_avg: {
            solar_generation: 1200,
            capacity_factor: 0.2,
        },
        peak: {
            solar_generation: 300,
            timestamp: '2026-07-05T14:30:00Z',
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useVariables).mockReturnValue({
            co2Rate: 0.75,
            electricRate: 0.35,
            setCo2Rate: vi.fn(),
            setElectricRate: vi.fn(),
        });

        vi.mocked(formatProduction).mockImplementation((val) => `${val} kWh`);
        vi.mocked(formatCapacityFactor).mockImplementation((val) => `${val * 100}%`);
        vi.mocked(formatCO2Savings).mockImplementation((val, rate) => `${val * rate} kg`);
        vi.mocked(formatEnergyPrice).mockImplementation((val, rate) => `${val * rate} A$`);
        vi.mocked(formatDate).mockReturnValue('14:30');
    });

    it('renders skeleton cards when data is undefined', () => {
        render(<OverviewCards data={undefined} />);

        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({name: 'Production Totale', skeleton: true}),
            undefined,
        );
        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({name: 'Pic de Production', skeleton: true}),
            undefined,
        );
        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({name: "Taux d'Utilisation", skeleton: true}),
            undefined,
        );
        expect(Card).toHaveBeenCalledWith(expect.objectContaining({name: 'Économies CO₂', skeleton: true}), undefined);
        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({name: 'Énergie valorisée', skeleton: true}),
            undefined,
        );
    });

    it('displays formatted values using formatter utilities when data is provided', () => {
        render(<OverviewCards data={mockData as any} />);

        expect(formatProduction).toHaveBeenCalledWith(1500);
        expect(screen.getByText('1500 kWh')).toBeInTheDocument();

        expect(formatProduction).toHaveBeenCalledWith(300);
        expect(screen.getByText('300 kWh')).toBeInTheDocument();

        expect(formatDate).toHaveBeenCalledWith(new Date('2026-07-05T14:30:00Z'), 'hh:mm');
        expect(Tag).toHaveBeenCalledWith(expect.objectContaining({text: '14:30'}), undefined);

        expect(formatCapacityFactor).toHaveBeenCalledWith(0.25);
        expect(screen.getByText('25%')).toBeInTheDocument();

        expect(formatCO2Savings).toHaveBeenCalledWith(1500, 0.75);
        expect(screen.getByText('1125 kg')).toBeInTheDocument();

        expect(formatEnergyPrice).toHaveBeenCalledWith(1500, 0.35);
        expect(screen.getByText('525 A$')).toBeInTheDocument();
    });

    it('calculates and passes correct current and reference values to TrendTag components', () => {
        render(<OverviewCards data={mockData as any} />);

        expect(TrendTag).toHaveBeenCalledWith(
            expect.objectContaining({
                currentValue: 1500,
                referenceValue: 1200,
                unit: '%',
                absoluteTrend: false,
            }),
            undefined,
        );

        expect(TrendTag).toHaveBeenCalledWith(
            expect.objectContaining({
                currentValue: 25,
                referenceValue: 20,
                unit: '%',
                absoluteTrend: true,
            }),
            undefined,
        );

        expect(TrendTag).toHaveBeenCalledWith(
            expect.objectContaining({
                currentValue: 1125,
                referenceValue: 900,
                unit: ' kg',
                absoluteTrend: true,
            }),
            undefined,
        );

        expect(TrendTag).toHaveBeenCalledWith(
            expect.objectContaining({
                currentValue: 525,
                referenceValue: 420,
                unit: ' A$',
                absoluteTrend: true,
            }),
            undefined,
        );
    });

    it('includes dynamic variable rates in tooltips', () => {
        render(<OverviewCards data={mockData as any} />);

        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Économies CO₂',
                infoTooltip:
                    "CO₂ évité grâce à la production solaire, basé sur un facteur d'émission de 0.75 kg CO₂/kWh.",
            }),
            undefined,
        );

        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Énergie valorisée',
                infoTooltip:
                    'Valeur estimée de la production solaire basée sur un tarif de 0.35 AUD/kWh (Monnaie Australienn).',
            }),
            undefined,
        );
    });
});
