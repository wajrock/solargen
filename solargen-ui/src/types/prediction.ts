export interface PredictionsStatus {
    date: string;
    fetched_at: string;
    prediction_count: number;
    weather_count: number;
    is_complete: boolean;
}

export interface ProductionMetrics {
    solar_generation: number;
    capacity_factor: number;
}

interface HourlyProduction {
    solar_generation: number;
    capacity_factor: number;
    monthly_avg: ProductionMetrics;
}

interface HourlyWeather {
    temperature: number;
    relative_humidity: number;
    cloud_cover: number;
    shortwave_radiation: number;
    diffuse_radiation: number;
}

interface HourlyPrediction {
    timestamp: string;
    production: HourlyProduction;
    weather: HourlyWeather;
}

interface Peak {
    timestamp: string;
    solar_generation: number;
}

interface Prediction {
    date: string;
    daily: ProductionMetrics;
    monthly_avg: ProductionMetrics;
    peak: Peak;
    hourly: HourlyPrediction[];
}

export type GlobalPrediction = Prediction;

export interface SitePrediction extends Prediction {
    site_id: string;
}
