export interface FastApiWeather {
    timestamp: string;
    apparent_temperature: number;
    relative_humidity: number;
    dew_point_temperature: number;
    shortwave_radiation: number;
}

export interface FastApiProduction {
    timestamp: string;
    efficiency: number;
    production_kw: number;
}

export interface FastApiSite {
    site_id: string;
    kwp: number;
    total_production_kw: number;
    productions: FastApiProduction[];
}

export interface FastApiPredictionResponse {
    date: string;
    fetched_at: string;
    weather: FastApiWeather[];
    sites: FastApiSite[];
}

export interface FastApiInstallationResponse {
    name: string;
    latitude: number;
    longitude: number;
    sites: FastApiSiteConfig[];
}

export interface FastApiSiteConfig {
    id: string;
    kwp: number;
    panel_count: number;
    panel_model: string;
    inverter_model: string;
}

export interface FastApiModelInfo {
    model: string;
    r2: number;
    mae: number;
    train_start: string;
    train_end: string;
    features: object;
    hyperparams: object;
    sites_count: number;
}
