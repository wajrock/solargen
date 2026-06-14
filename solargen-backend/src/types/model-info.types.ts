export interface ModelInfoDto {
    model: string;
    r2: number;
    mae: number;
    train_start: string;
    train_end: string;
    features: object;
    hyperparams: object;
    sites_count: number;
}
