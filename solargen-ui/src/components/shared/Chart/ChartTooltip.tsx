/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import type {ChartTooltipProps} from '@/types/chart';
import styles from './Chart.module.scss';

function ChartTooltip({series, active, label, payload}: ChartTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipLabel}>{label}</span>
            {payload.map((entry: any, index) => (
                <div key={entry.dataKey} className={styles.tooltipRow}>
                    <span className={styles.tooltipValue} style={{color: series[index].color}}>
                        {entry.value} {series[index].unit}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default ChartTooltip;
