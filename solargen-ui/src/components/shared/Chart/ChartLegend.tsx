import type {AreaSeries} from '@/types/chart';
import styles from './Chart.module.scss';

interface ChartLegendProps {
    series: AreaSeries[];
}

function ChartLegend({series}: ChartLegendProps) {
    return (
        <div className={styles.legend}>
            {series.map((serie) => (
                <div key={serie.key} className={styles.legendItem}>
                    <span className={styles.legendItemRound} style={{backgroundColor: serie.color}}></span>
                    <span className={styles.legendItemName}>
                        {serie.label} ({serie.unit})
                    </span>
                </div>
            ))}
        </div>
    );
}

export default ChartLegend;
