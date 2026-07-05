import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chart from './Chart';
import {CHART_TYPE, type AreaSeries} from '@/types/chart';

const mockData = [
    {timestamp: '00:00', total_solar_generation: 0},
    {timestamp: '13:00', total_solar_generation: 565.23},
];

const areaSeries: AreaSeries[] = [
    {type: CHART_TYPE.AREA, key: 'total_solar_generation', label: 'Production', color: '#f97316', unit: 'kWh'},
];

const barSeries: AreaSeries[] = [
    {type: CHART_TYPE.BAR, key: 'total_solar_generation', label: 'Production', color: '#f97316', unit: 'kWh'},
];

const lineSeries: AreaSeries[] = [
    {type: CHART_TYPE.LINE, key: 'total_solar_generation', label: 'Moyenne', color: '#94a3b8', unit: 'kWh'},
];

describe('Chart', () => {
    it('renders the title', () => {
        render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
            />,
        );

        expect(screen.getByText('Production solaire')).toBeInTheDocument();
    });

    it('renders a skeleton when loading is true, regardless of data', () => {
        const {container} = render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={true}
            />,
        );

        expect(container.querySelector('.skeleton')).toBeInTheDocument();
    });

    it('does not render a skeleton when loading is false', () => {
        const {container} = render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
            />,
        );

        expect(container.querySelector('.skeleton')).not.toBeInTheDocument();
    });

    it('renders the legend when loading is false', () => {
        render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
            />,
        );

        expect(screen.getByText('Production (kWh)')).toBeInTheDocument();
    });

    it('does not show the legend while loading', () => {
        render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={true}
            />,
        );

        expect(screen.queryByText('Production (kWh)')).not.toBeInTheDocument();
    });

    it('does not show the info icon before hovering, even with a tooltip prop', () => {
        const {container} = render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
                tooltip="Explication du graphique"
            />,
        );

        expect(container.querySelector('.lucide-info')).not.toBeInTheDocument();
    });

    it('shows the info icon on hover when a tooltip prop is provided', async () => {
        const user = userEvent.setup();
        const {container} = render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
                tooltip="Explication du graphique"
            />,
        );

        await user.hover(container.firstChild as Element);

        expect(container.querySelector('.lucide-info')).toBeInTheDocument();
    });

    it('never shows the info icon when no tooltip prop is provided, even on hover', async () => {
        const user = userEvent.setup();
        const {container} = render(
            <Chart
                title="Production solaire"
                data={mockData}
                series={areaSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
            />,
        );

        await user.hover(container.firstChild as Element);

        expect(container.querySelector('.lucide-info')).not.toBeInTheDocument();
    });

    it('renders without crashing for bar series type', () => {
        const {container} = render(
            <Chart
                title="Historique"
                data={mockData}
                series={barSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
            />,
        );

        expect(container.querySelector('.skeleton')).not.toBeInTheDocument();
    });

    it('renders without crashing for line series type', () => {
        const {container} = render(
            <Chart
                title="Historique"
                data={mockData}
                series={lineSeries}
                xKey="timestamp"
                margin={{}}
                loading={false}
            />,
        );

        expect(container.querySelector('.skeleton')).not.toBeInTheDocument();
    });
});
