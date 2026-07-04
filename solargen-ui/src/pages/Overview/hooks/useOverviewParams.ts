import {isFutureDate, isValidDateString, parseDate} from '@/utils/date';
import {formatDate} from '@/utils/formatters';
import {useSearchParams} from 'react-router-dom';

function useOverviewParams() {
    // Hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Constants
    const dateParam = searchParams.get('date');
    const siteParam = searchParams.get('site');
    const parsedDate = dateParam ? parseDate(dateParam) : undefined;

    const date =
        dateParam && isValidDateString(dateParam) && parsedDate && !isFutureDate(parsedDate) ? parsedDate : undefined;

    const siteId = siteParam ?? undefined;

    // Handlers
    const handleDateChange = (newDate: Date | undefined) => {
        setSearchParams((prev) => {
            if (newDate) {
                prev.set('date', formatDate(newDate, 'yyyy-MM-dd'));
            } else {
                prev.delete('date');
            }
            return prev;
        });
    };

    const handleSiteChange = (newSiteId: string | undefined) => {
        setSearchParams((prev) => {
            if (newSiteId) {
                prev.set('site', newSiteId);
            } else {
                prev.delete('site');
            }
            return prev;
        });
    };

    return {date, siteId, handleDateChange, handleSiteChange};
}

export default useOverviewParams;
