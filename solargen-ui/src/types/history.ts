import type {ProductionMetrics} from './prediction';

interface DailyMetrics {
    date: string;
    solar_generation: number;
    capacity_factor: number;
}

interface YearHistory {
    year: number;
    monthly: ProductionMetrics;
    daily: DailyMetrics[];
}

interface History {
    month: string;
    current_year: YearHistory;
    previous_year: YearHistory;
}

export type GlobalHistory = History;
export interface SiteHistory extends History {
    site_id: string;
}
