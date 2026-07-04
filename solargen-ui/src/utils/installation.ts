import type {Site} from '@/types/installation';
import {formatInverterModel} from './formatters';

export const getAvgCapacityFactor = (sites: Site[]): number => {
    return sites.reduce((sum, site) => sum + site.avg_capacity_factor, 0) / sites.length;
};

export const getStandardDeviation = (sites: Site[], avgCapacityFactor: number): number => {
    return Math.sqrt(
        sites.reduce((sum, site) => sum + Math.pow(site.avg_capacity_factor - avgCapacityFactor, 2), 0) / sites.length,
    );
};

export enum PERFORMANCE_LEVEL {
    HIGH = 'high',
    NORMAL = 'normal',
    LOW = 'low',
}

export const getSitePerformance = (
    value: number,
    avgCapacityFactor: number,
    standardDeviation: number,
): {type: PERFORMANCE_LEVEL; text: string} => {
    if (value > avgCapacityFactor + standardDeviation) return {type: PERFORMANCE_LEVEL.HIGH, text: 'Excellent'};
    if (value < avgCapacityFactor - standardDeviation) return {type: PERFORMANCE_LEVEL.LOW, text: 'Faible'};
    return {type: PERFORMANCE_LEVEL.NORMAL, text: 'Normal'};
};

export const getBestSite = (sites: Site[]): Site => {
    return [...sites].sort((a, b) => b.avg_capacity_factor - a.avg_capacity_factor)[0];
};

export const getWorstSite = (sites: Site[]): Site => {
    return [...sites].sort((a, b) => a.avg_capacity_factor - b.avg_capacity_factor)[0];
};

export const getInvertersType = (sites: Site[]): string[] => {
    const inverters: string[] = [];

    for (const site of sites) {
        for (const inverter of site.inverters) {
            const inverterModel = formatInverterModel(inverter.model);
            if (!inverters.includes(inverterModel)) {
                inverters.push(inverterModel);
            }
        }
    }

    return inverters;
};
