export interface Installation {
    name: string;
    latitude: number;
    longitude: number;
    total_capacity: number;
    sites: Site[];
}

export interface Site {
    id: string;
    kwp: number;
    panel_model: string;
    inverters: Inverter[];
    avg_capacity_factor: number;
}

export interface Inverter {
    model: string;
    quantity: number;
}
