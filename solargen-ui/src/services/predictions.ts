import type {GlobalPrediction, PredictionsStatus, SitePrediction} from '@/types/prediction';
import {api} from './api';

export const getLastPredictionsStatus = () => {
    return api.get<PredictionsStatus>('/predictions/status');
};

export const getTodayPredictions = () => {
    return api.get<GlobalPrediction>('/predictions/today');
};

export const getTodayPredictionsBySite = (siteId: string) => {
    return api.get<SitePrediction>(`/predictions/today/${siteId}`);
};

export const getPredictionsByDate = (date: string) => {
    return api.get<GlobalPrediction>(`/predictions/${date}`);
};

export const getPredictionsByDateAndSite = (date: string, siteId: string) => {
    return api.get<SitePrediction>(`/predictions/${date}/${siteId}`);
};
