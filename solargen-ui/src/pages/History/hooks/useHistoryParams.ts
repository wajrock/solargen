import {useSearchParams} from 'react-router-dom';

function useHistoryParams() {
    // Hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Constants
    const monthParam = searchParams.get('month') ?? undefined;
    const siteParam = searchParams.get('site') ?? undefined;

    // Handlers
    const handleMonthChange = (newMonth: string | undefined) => {
        setSearchParams((prev) => {
            if (newMonth) {
                prev.set('month', newMonth);
            } else {
                prev.delete('month');
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

    return {monthParam, siteParam, handleMonthChange, handleSiteChange};
}

export default useHistoryParams;
