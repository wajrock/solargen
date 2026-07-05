import {
    getPredictionsByDateAndSite,
    getPredictionsByDate,
    getTodayPredictionsBySite,
    getTodayPredictions,
    getLastPredictionsStatus,
} from '@/services/predictions';
import type {GlobalPrediction, PredictionsStatus, SitePrediction} from '@/types/prediction';
import {useQuery} from '@tanstack/react-query';

function getQueryFn(date?: string, siteId?: string) {
    if (date && siteId) return () => getPredictionsByDateAndSite(date, siteId).then((res) => res.data);
    if (date) return () => getPredictionsByDate(date).then((res) => res.data);
    if (siteId) return () => getTodayPredictionsBySite(siteId).then((res) => res.data);
    return () => getTodayPredictions().then((res) => res.data);
}

export function usePredictions(date?: string, siteId?: string) {
    const {data, isLoading, error} = useQuery<GlobalPrediction | SitePrediction>({
        queryKey: ['predictions', date, siteId],
        queryFn: getQueryFn(date, siteId),
        staleTime: Infinity,
        retry: 1,
    });

    return {predictionsData: data, loading: isLoading, error};
}

export function usePredictionsStatus() {
    const {data, isLoading, error} = useQuery<PredictionsStatus>({
        queryKey: ['last-predictions-status'],
        queryFn: () => getLastPredictionsStatus().then((res) => res.data),
        staleTime: 1000 * 60 * 60,
        retry: 1,
    });

    return {predictionsStatusData: data, loading: isLoading, error};
}
