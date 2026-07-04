import {getInstallation} from '@/services/installation';
import {redirect} from 'react-router-dom';
import {getMelbourneToday, isFutureDate, isValidDateString, parseDate} from './date';
import {formatDate} from './formatters';

export const validateOverviewParams = async (request: Request) => {
    const url = new URL(request.url);
    const siteParam = url.searchParams.get('site');
    const dateParam = url.searchParams.get('date');
    let shouldRedirect = false;

    if (dateParam) {
        const parsedDate = parseDate(dateParam);
        if (
            !isValidDateString(dateParam) ||
            !parsedDate ||
            isFutureDate(parsedDate) ||
            formatDate(parsedDate, 'yyyy-MM-dd') === formatDate(getMelbourneToday(), 'yyyy-MM-dd')
        ) {
            url.searchParams.delete('date');
            shouldRedirect = true;
        }
    }

    if (siteParam) {
        const {data} = await getInstallation();
        const isValid = data.sites.some((s) => s.id === siteParam);
        if (!isValid) {
            url.searchParams.delete('site');
            shouldRedirect = true;
        }
    }

    return shouldRedirect ? redirect(url.toString()) : null;
};

export const validateHistoryParams = async (request: Request) => {
    const url = new URL(request.url);
    const siteParam = url.searchParams.get('site');
    const monthParam = url.searchParams.get('month');
    let shouldRedirect = false;

    if (monthParam) {
        const parsedMonth = parseInt(monthParam);
        const currentMonth = new Date().getMonth() + 1;

        if (monthParam.length !== 2 || !parsedMonth || parsedMonth > currentMonth || parsedMonth < 0) {
            url.searchParams.delete('month');
            shouldRedirect = true;
        }
    }

    if (siteParam) {
        const {data} = await getInstallation();
        const isValid = data.sites.some((s) => s.id === siteParam);
        if (!isValid) {
            url.searchParams.delete('site');
            shouldRedirect = true;
        }
    }

    return shouldRedirect ? redirect(url.toString()) : null;
};
