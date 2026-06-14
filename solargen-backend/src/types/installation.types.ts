export interface InstallationDto {
    name: string;
    latitude: number;
    longitude: number;
}

export interface SiteDto {
    id: string;
    kwp: number;
    panel_count: number | null;
    panel_model: string | null;
    inverter_model: string | null;
}
