import type {GlobalHistory, SiteHistory} from '@/types/history';
import {api} from './api';

export const getHistoryByMonth = (month: string) => {
    return api.get<GlobalHistory>(`/history/${month}`);
};

export const getHistoryByMonthAndBySite = (month: string, siteId: string) => {
    return api.get<SiteHistory>(`/history/${month}/${siteId}`);
};
