import {TrendingDown, TrendingUp} from 'lucide-react';
import styles from './TrendTag.module.scss';
import tagStyles from './../Tag.module.scss';
import {formatTrend} from '@/utils/formatters';

interface TrendTagProps {
    currentValue: number;
    referenceValue: number;
    absoluteTrend: boolean;
    unit: string;
}

function TrendTag({currentValue, referenceValue, absoluteTrend, unit}: TrendTagProps) {
    const evolution = absoluteTrend
        ? currentValue - referenceValue
        : referenceValue === 0
          ? 0
          : (currentValue - referenceValue) / referenceValue;

    const trendClass = evolution > 0 ? styles.positiveLabel : evolution < 0 ? styles.negativeLabel : '';

    return (
        <div className={`${tagStyles.tag} ${styles.trendTag} ${trendClass}`}>
            {evolution > 0 && <TrendingUp />}
            {evolution < 0 && <TrendingDown />}
            <span>{formatTrend(!absoluteTrend ? evolution * 100 : evolution, unit)}</span>
        </div>
    );
}

export default TrendTag;
