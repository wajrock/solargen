import {getMelbourneToday} from './date';

export function getCurrentYearMonths(): {value: string; label: string}[] {
    const months = [];

    const todayDate = getMelbourneToday();
    const currentYear = todayDate.getFullYear();

    const dateStart = `${currentYear}-01`;
    const date = new Date(dateStart);

    while (date.getMonth() < todayDate.getMonth()) {
        const month = String(date.getMonth() + 1);
        const monthLabel = date.toLocaleString('fr-FR', {month: 'long'});

        months.push({
            value: month.padStart(2, '0'),
            label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        });
        date.setMonth(date.getMonth() + 1);
    }

    return months.reverse();
}
