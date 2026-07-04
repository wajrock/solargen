import TrendTag from '@/components/shared/Tag/TrendTag/TrendTag';
import styles from './ComparisonBlock.module.scss';

interface ComparisonBlockProps {
    title: string;
    currentValue: number;
    formatedCurrentValue: string;
    currentYear: number;
    referenceValue: number;
    referenceYear: number;
    formatedReferenceValue: string;
    absoluteTrend: boolean;
    unit: string;
}

function ComparisonBlock({
    title,
    currentValue,
    formatedCurrentValue,
    currentYear,
    referenceValue,
    referenceYear,
    formatedReferenceValue,
    absoluteTrend,
    unit,
}: ComparisonBlockProps) {
    const minValue = Math.min(currentValue, referenceValue);
    const maxValue = Math.max(currentValue, referenceValue);
    const range = maxValue - minValue;

    const baseWidth = 70;
    const deltaWidth = 30;

    const currentWidth =
        baseWidth + (currentValue === maxValue ? deltaWidth : ((currentValue - minValue) / range) * deltaWidth);
    const referenceWidth =
        baseWidth + (referenceValue === maxValue ? deltaWidth : ((referenceValue - minValue) / range) * deltaWidth);

    return (
        <section className={`block ${styles.comparisonBlock}`}>
            <header className={styles.comparisonBlockHeader}>
                <h2 className="block-title">{title}</h2>
                <TrendTag
                    currentValue={currentValue}
                    referenceValue={referenceValue}
                    absoluteTrend={absoluteTrend}
                    unit={unit}
                />
            </header>

            {currentValue && referenceValue ? (
                <div className={styles.bars}>
                    <div className={styles.barGroup}>
                        <div className={`${styles.bar} ${styles.currentValue}`} style={{width: `${currentWidth}%`}}>
                            {currentYear}
                        </div>
                        <span className={styles.textValue}>{formatedCurrentValue}</span>
                    </div>
                    <div className={styles.barGroup}>
                        <div className={`${styles.bar} ${styles.referencevalue}`} style={{width: `${referenceWidth}%`}}>
                            {referenceYear}
                        </div>
                        <span className={styles.textValue}>{formatedReferenceValue}</span>
                    </div>
                </div>
            ) : (
                <div className={`skeleton ${styles.skeleton}`}></div>
            )}
        </section>
    );
}

export default ComparisonBlock;
