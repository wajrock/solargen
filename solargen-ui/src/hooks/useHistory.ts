import {getHistoryByMonth, getHistoryByMonthAndBySite} from '@/services/history';
import type {GlobalHistory, SiteHistory} from '@/types/history';
import {useQuery} from '@tanstack/react-query';

function getQueryFn(month: string, siteId?: string) {
    if (siteId) return () => getHistoryByMonthAndBySite(month, siteId).then((res) => res.data);
    return () => getHistoryByMonth(month).then((res) => res.data);
}

export function useHistory(month: string, siteId?: string) {
    const {data, isLoading, error} = useQuery<GlobalHistory | SiteHistory>({
        queryKey: ['history', month, siteId],
        queryFn: getQueryFn(month, siteId),
        staleTime: Infinity,
    });

    return {historyData: data, loading: isLoading, error};
}
