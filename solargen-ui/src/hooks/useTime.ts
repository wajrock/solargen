import {useEffect, useState} from 'react';

export function useTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const currentDate = time.toLocaleDateString('fr-FR', {
        timeZone: 'Australia/Melbourne',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const currentTime = time.toLocaleTimeString('fr-FR', {
        timeZone: 'Australia/Melbourne',
        hour: '2-digit',
        minute: '2-digit',
    });

    return {date: currentDate, time: currentTime};
}
