export interface FastApiPredictionResponse {
    date: string;
    fetched_at: string;
    weather: FastApiWeather[];
    sites: FastApiSite[];
}

export interface FastApiWeather {
    timestamp: string;
    temperature: number;
    relative_humidity: number;
    cloud_cover: number;
    shortwave_radiation: number;
    diffuse_radiation: number;
}

export interface FastApiSite {
    site_id: string;
    kwp: number;
    total_solar_generation: number;
    productions: FastApiProduction[];
}

export interface FastApiProduction {
    timestamp: string;
    capacity_factor: number;
    solar_generation: number;
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
    inverters: {model: string; quantity: number};
}

export interface FastApiModelInfo {
    model: string;
    r2: number;
    mae: number;
    train_start: string;
    train_end: string;
    features: object;
    sites_count: number;
}
