import type {TooltipContentProps} from 'recharts';
import type {ValueType, NameType} from 'recharts/types/component/DefaultTooltipContent';

export enum CHART_TYPE {
    AREA = 'area',
    LINE = 'line',
    BAR = 'bar',
}

export interface AreaSeries {
    key: string;
    type: CHART_TYPE;
    showDash?: boolean;
    label: string;
    color: string;
    unit: string;
}

export interface ChartTooltipProps extends TooltipContentProps<ValueType, NameType> {
    series: AreaSeries[];
}
