import type {PredictionsStatus} from '@/types/prediction';

export const formatPredictionsStatusTooltip = (predictionsStatus: PredictionsStatus): string => {
    if (predictionsStatus.prediction_count < 504 && predictionsStatus.weather_count < 24) {
        return `Il manque ${504 - predictionsStatus.prediction_count} prédictions et ${24 - predictionsStatus.weather_count} données météos`;
    }

    if (predictionsStatus.prediction_count < 504) {
        return `Il manque ${504 - predictionsStatus.prediction_count} prédictions`;
    }

    if (predictionsStatus.prediction_count < 24) {
        return `Il manque ${24 - predictionsStatus.weather_count} données météos`;
    }

    return 'Prédictions complètes';
};
