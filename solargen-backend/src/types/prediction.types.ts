import {WeatherDto} from './weather.types';

export interface GlobalProductionDto {
    timestamp: string;
    total_production_kw: number;
}

export interface GlobalPredictionDto {
    production: GlobalProductionDto[];
    weather: WeatherDto[];
}

export interface SiteProductionDto {
    timestamp: string;
    efficiency: number;
    production_kw: number;
}

export interface SitePredictionDto {
    production: SiteProductionDto[];
    weather: WeatherDto[];
}
