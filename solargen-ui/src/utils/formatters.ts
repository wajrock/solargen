import {format} from 'date-fns';
import {fr} from 'date-fns/locale';

// DATE
export const formatDate = (date: Date, pattern: string): string => {
    return format(date, pattern, {locale: fr});
};

// SITES
export const formatCapacity = (capcity: number) => {
    return `${capcity.toFixed(2)} kWp`;
};

export const formatSiteId = (siteId: string) => {
    return `#${siteId}`;
};

export const formatInverterModel = (inverterModel: string) => {
    if (inverterModel.split(' ').length > 1) {
        return inverterModel.split(' ')[1];
    }
    return inverterModel;
};

// PRODUCTION
export const formatProduction = (production: number) => {
    return `${production.toFixed(2)} kWh`;
};

export const formatCapacityFactor = (capacityFactor: number) => {
    return `${(capacityFactor * 100).toFixed(1)}%`;
};

export const formatCO2Savings = (production: number, co2Rate: number) => {
    return `${(production * co2Rate).toFixed(2)} kgCO₂`;
};

export const formatEnergyPrice = (production: number, electricRate: number) => {
    return `${(production * electricRate).toFixed(2)}  A$`;
};

export const formatCardTrend = (value: number, monthlyAvg: number) => {
    const percentage = ((value - monthlyAvg) / monthlyAvg) * 100;
    return `${percentage}`;
};

export const formatTrend = (trend: number, unit: string): string => {
    return `${Math.abs(trend).toFixed(1)}${unit}`;
};
