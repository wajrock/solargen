import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import ChartLegend from './ChartLegend';
import styles from './Chart.module.scss';
import type {AreaSeries} from '@/types/chart';
import {CHART_TYPE} from '@/types/chart';

const mockSeries: AreaSeries[] = [
    {type: CHART_TYPE.AREA, key: 'total_solar_generation', label: 'Production', color: '#f97316', unit: 'kWh'},
    {
        type: CHART_TYPE.AREA,
        key: 'monthly_avg_hourly_solar_generation',
        label: 'Moyenne',
        color: '#94a3b8',
        unit: 'kWh',
    },
];

describe('ChartLegend', () => {
    it('renders one legend item per series entry', () => {
        render(<ChartLegend series={mockSeries} />);

        expect(screen.getByText('Production (kWh)')).toBeInTheDocument();
        expect(screen.getByText('Moyenne (kWh)')).toBeInTheDocument();
    });

    it('applies the correct color to each legend indicator', () => {
        render(<ChartLegend series={mockSeries} />);

        const items = document.querySelectorAll(`.${styles.legendItemRound}`);
        expect(items[0]).toHaveStyle({backgroundColor: '#f97316'});
        expect(items[1]).toHaveStyle({backgroundColor: '#94a3b8'});
    });

    it('renders nothing when series is empty', () => {
        render(<ChartLegend series={[]} />);

        expect(screen.queryByText(/kWh/)).not.toBeInTheDocument();
    });
});
