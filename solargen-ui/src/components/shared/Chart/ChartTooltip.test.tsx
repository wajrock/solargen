/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import ChartTooltip from './ChartTooltip';
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

function makePayload(entries: {dataKey: string; value: number}[]): any {
    return entries;
}

describe('ChartTooltip', () => {
    it('renders nothing when not active', () => {
        const {container} = render(
            <ChartTooltip
                series={mockSeries}
                active={false}
                label="13:00"
                payload={makePayload([{dataKey: 'total_solar_generation', value: 565.23}])}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is empty', () => {
        const {container} = render(
            <ChartTooltip
                series={mockSeries}
                active={true}
                label="13:00"
                payload={makePayload([])}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is undefined', () => {
        const {container} = render(
            <ChartTooltip
                series={mockSeries}
                active={true}
                label="13:00"
                payload={undefined as any}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('displays the label when active with data', () => {
        render(
            <ChartTooltip
                series={mockSeries}
                active={true}
                label="13:00"
                payload={makePayload([{dataKey: 'total_solar_generation', value: 565.23}])}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        expect(screen.getByText('13:00')).toBeInTheDocument();
    });

    it('displays the value and unit for a single entry', () => {
        render(
            <ChartTooltip
                series={mockSeries}
                active={true}
                label="13:00"
                payload={makePayload([{dataKey: 'total_solar_generation', value: 565.23}])}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        expect(screen.getByText('565.23 kWh')).toBeInTheDocument();
    });

    it('displays multiple entries in the same order as the series prop', () => {
        render(
            <ChartTooltip
                series={mockSeries}
                active={true}
                label="13:00"
                payload={makePayload([
                    {dataKey: 'total_solar_generation', value: 565.23},
                    {dataKey: 'monthly_avg_hourly_solar_generation', value: 520.1},
                ])}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        expect(screen.getByText('565.23 kWh')).toBeInTheDocument();
        expect(screen.getByText('520.1 kWh')).toBeInTheDocument();
    });

    it('applies the correct color from the series for each entry', () => {
        render(
            <ChartTooltip
                series={mockSeries}
                active={true}
                label="13:00"
                payload={makePayload([{dataKey: 'total_solar_generation', value: 565.23}])}
                coordinate={undefined}
                accessibilityLayer={false}
                activeIndex={undefined}
            />,
        );

        const valueSpan = screen.getByText('565.23 kWh');
        expect(valueSpan).toHaveStyle({color: '#f97316'});
    });
});
