import Card from '@/components/shared/Card/Card';
import cardStyles from '@/components/shared/Card/Card.module.scss';
import type {Installation} from '@/types/installation';
import {formatCapacity, formatCapacityFactor} from '@/utils/formatters';
import {getBestSite, getWorstSite} from '@/utils/installation';
import styles from './InstallationCards.module.scss';
import Tag from '@/components/shared/Tag/Tag';

interface InstallationCardsProps {
    data: Installation | undefined;
    loading: boolean;
}

function InstallationCards({data, loading}: InstallationCardsProps) {
    if (loading || !data) {
        return (
            <div className={styles.cards}>
                <Card name="Capacité Totale" skeleton />
                <Card name="Site le plus Performant" skeleton />
                <Card name="Site le moins Performant" skeleton />
            </div>
        );
    }

    const bestSite = getBestSite(data.sites);
    const worstSite = getWorstSite(data.sites);

    return (
        <div className={styles.cards}>
            <Card name="Capacité totale">
                <span className={cardStyles.cardValue}>{formatCapacity(data.total_capacity)}</span>
            </Card>
            <Card name="Site le plus performant">
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>#{bestSite.id}</span>
                    <Tag text={formatCapacityFactor(bestSite.avg_capacity_factor)} />
                </div>
            </Card>
            <Card name="Site le moins performant">
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>#{worstSite.id}</span>
                    <Tag text={formatCapacityFactor(worstSite.avg_capacity_factor)} />
                </div>
            </Card>
        </div>
    );
}

export default InstallationCards;
