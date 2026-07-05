import {CHART_TYPE, type AreaSeries} from '@/types/chart';
import {useState} from 'react';
import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    type Margin,
} from 'recharts';
import styles from './Chart.module.scss';
import ChartLegend from './ChartLegend';
import ChartTooltip from './ChartTooltip';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import {Info} from 'lucide-react';

interface AreaChartProps {
    title: string;
    className?: string;
    data: Record<string, unknown>[];
    loading: boolean;
    series: AreaSeries[];
    xKey: string;
    tooltip?: string;
    interval?: number;
    margin: Partial<Margin>;
}

function Chart({data, loading, className, series, xKey, title, margin, tooltip, interval}: AreaChartProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const getBarCategoryGap = (pointsCount: number): string => {
        if (pointsCount <= 5) return '40%';
        if (pointsCount <= 15) return '25%';
        return '15%';
    };

    return (
        <div
            className={`block ${styles.wrapper} ${className ?? ''}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className={styles.wrapperHeader}>
                <h2 className="block-title">{title}</h2>
                {tooltip && showTooltip && (
                    <CustomTooltip text={tooltip}>
                        <Info className={styles.infoIcon}></Info>
                    </CustomTooltip>
                )}
            </div>

            {loading && <div className={`${styles.chartSkeleton} skeleton`}></div>}

            {!loading && (
                <>
                    <ChartLegend series={series} />
                    <ResponsiveContainer width="100%" className={styles.chart}>
                        <ComposedChart data={data} margin={margin} barCategoryGap={getBarCategoryGap(data.length)}>
                            <CartesianGrid className={styles.grid} />
                            <XAxis
                                className={styles.xAxis}
                                dataKey={xKey}
                                tick={{fontSize: 12, fill: 'var(--secondary-text-color)'}}
                                interval={interval}
                                padding={
                                    series.some((serie) => serie.type === CHART_TYPE.BAR)
                                        ? {left: 25, right: 25}
                                        : undefined
                                }
                            />
                            <YAxis
                                className={styles.yAxis}
                                tick={{fontSize: 12, fill: 'var(--secondary-text-color)'}}
                            />
                            <Tooltip content={(props) => <ChartTooltip {...props} series={series} />} />
                            {series.map((serie) => {
                                switch (serie.type) {
                                    case CHART_TYPE.LINE:
                                        return (
                                            <Line
                                                type={'monotone'}
                                                key={serie.key}
                                                name={serie.label}
                                                dataKey={serie.key}
                                                stroke={serie.color}
                                                strokeWidth={2}
                                                strokeDasharray={serie.showDash ? 4 : 0}
                                                dot={false}
                                            />
                                        );

                                    case CHART_TYPE.BAR:
                                        return (
                                            <Bar
                                                key={serie.key}
                                                type="monotone"
                                                dataKey={serie.key}
                                                name={serie.label}
                                                fill={serie.color}
                                                radius={4}
                                            />
                                        );

                                    default:
                                        return (
                                            <Area
                                                key={serie.key}
                                                type="monotone"
                                                dataKey={serie.key}
                                                name={serie.label}
                                                stroke={serie.color}
                                                fill={serie.color}
                                                fillOpacity={0.15}
                                                strokeWidth={2}
                                            />
                                        );
                                }
                            })}
                        </ComposedChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    );
}

export default Chart;
