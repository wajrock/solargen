import {useEffect, useState} from 'react';

export function useTime() {
    // Hooks
    const [time, setTime] = useState(new Date());

    // Effects
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Misc.
    const currentDate = time.toLocaleDateString('fr-FR', {
        timeZone: 'Australia/Melbourne',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const currentTime = time.toLocaleTimeString('fr-FR', {
        timeZone: 'Australia/Melbourne',
        hour: '2-digit',
        minute: '2-digit',
    });

    return {date: currentDate, time: currentTime};
}
