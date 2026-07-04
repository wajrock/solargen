import Card from '@/components/shared/Card/Card';
import cardStyles from '@/components/shared/Card/Card.module.scss';
import type {ModelInfo} from '@/types/model';
import styles from './ModelCards.module.scss';
import {formatDate} from '@/utils/formatters';

interface ModelCardsProps {
    data: ModelInfo | undefined;
}

function ModelCards({data}: ModelCardsProps) {
    if (!data) {
        return (
            <div className={styles.cards}>
                <Card name="Algorithme" skeleton />
                <Card name="Score R²" skeleton />
                <Card name="Erreur moyenne" skeleton />
                <Card name="Période d’entrainement" skeleton />
            </div>
        );
    }

    return (
        <div className={styles.cards}>
            <Card
                name="Algorithme"
                infoTooltip="Modèle d'arbres de décisions entraîné pour prédire la production solaire horaire."
            >
                <span className={cardStyles.cardValue}>{data.model}</span>
            </Card>
            <Card
                name="Score R²"
                infoTooltip="Indique à quel point les prédictions du modèle collent à la réalité. ((0 à 1, plus haut est meilleur)."
            >
                <span className={cardStyles.cardValue}>{data.r2}</span>
            </Card>
            <Card
                name="Erreur moyenne"
                infoTooltip="Écart moyen entre production prédite et réelle sur les données de test."
            >
                <span className={cardStyles.cardValue}>{data.mae}</span>
            </Card>
            <Card
                name="Période d’entrainement"
                infoTooltip="Plage de données du dataset UNISOLAR utilisée pour l'entraînement."
            >
                <span className={`${cardStyles.cardValue} ${styles.trainPeriod}`}>
                    {formatDate(new Date(data.train_start), 'MMMM yyyy')}
                    {' → '}
                    {formatDate(new Date(data.train_end), 'MMMM yyyy')}
                </span>
            </Card>
        </div>
    );
}

export default ModelCards;
