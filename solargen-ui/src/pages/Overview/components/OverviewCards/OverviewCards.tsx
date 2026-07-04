import Card from '@/components/shared/Card/Card';
import cardStyles from '@/components/shared/Card/Card.module.scss';
import useVariables from '@/hooks/useVariables';
import type {GlobalPrediction, SitePrediction} from '@/types/prediction';
import {
    formatCapacityFactor,
    formatCO2Savings,
    formatDate,
    formatEnergyPrice,
    formatProduction,
} from '@/utils/formatters';
import styles from './OverviewCards.module.scss';
import TrendTag from '@/components/shared/Tag/TrendTag/TrendTag';
import Tag from '@/components/shared/Tag/Tag';

interface OverviewCardsProps {
    data: GlobalPrediction | SitePrediction | undefined;
}

function OverviewCards({data}: OverviewCardsProps) {
    const {co2Rate, electricRate} = useVariables();

    if (!data) {
        return (
            <div className={styles.cards}>
                <Card name="Production Totale" skeleton />
                <Card name="Pic de Production" skeleton />
                <Card name="Taux d'Utilisation" skeleton />
                <Card name="Économies CO₂" skeleton />
                <Card name="Énergie valorisée" skeleton />
            </div>
        );
    }

    return (
        <div className={styles.cards}>
            <Card name="Production totale">
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>{formatProduction(data.daily.solar_generation)}</span>

                    <TrendTag
                        currentValue={data.daily.solar_generation}
                        referenceValue={data.monthly_avg.solar_generation}
                        unit={'%'}
                        absoluteTrend={false}
                    />
                </div>
            </Card>
            <Card name="Pic de production">
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>{formatProduction(data.peak.solar_generation)}</span>
                    <Tag text={formatDate(new Date(data.peak.timestamp), 'hh:mm')} />
                </div>
            </Card>
            <Card
                name="Taux d'utilisation"
                infoTooltip="Part de la capacité maximale effectivement utilisée durant les heures de production."
            >
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>{formatCapacityFactor(data.daily.capacity_factor)}</span>
                    <TrendTag
                        currentValue={data.daily.capacity_factor * 100}
                        referenceValue={data.monthly_avg.capacity_factor * 100}
                        unit={'%'}
                        absoluteTrend={true}
                    />
                </div>
            </Card>
            <Card
                name="Économies CO₂"
                infoTooltip={`CO₂ évité grâce à la production solaire, basé sur un facteur d'émission de ${co2Rate} kg CO₂/kWh.`}
            >
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>
                        {formatCO2Savings(data.daily.solar_generation, co2Rate)}
                    </span>
                    <TrendTag
                        currentValue={data.daily.solar_generation * co2Rate}
                        referenceValue={data.monthly_avg.solar_generation * co2Rate}
                        unit={' kg'}
                        absoluteTrend={true}
                    />
                </div>
            </Card>
            <Card
                name="Énergie valorisée"
                infoTooltip={`Valeur estimée de la production solaire basée sur un tarif de ${electricRate} AUD/kWh (Monnaie Australienn).`}
            >
                <div className={cardStyles.cardGroup}>
                    <span className={cardStyles.cardValue}>
                        {formatEnergyPrice(data.daily.solar_generation, electricRate)}
                    </span>
                    <TrendTag
                        currentValue={data.daily.solar_generation * electricRate}
                        referenceValue={data.monthly_avg.solar_generation * electricRate}
                        unit={' A$'}
                        absoluteTrend={true}
                    />
                </div>
            </Card>
        </div>
    );
}

export default OverviewCards;
