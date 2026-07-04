import {ApiProperty} from '@nestjs/swagger';

export class PredictionStatusDto {
    @ApiProperty({example: '2026-07-01', description: 'Date of the most recent predictions in the database'})
    date!: string;

    @ApiProperty({example: '2026-07-01T01:02:34', description: 'Timestamp of most recent predictions fetch'})
    fetched_at!: string;

    @ApiProperty({example: 504, description: 'Number of prediction records found for this date'})
    prediction_count!: number;

    @ApiProperty({example: 24, description: 'Number of weather records found for this date'})
    weather_count!: number;

    @ApiProperty({
        example: true,
        description: 'Whether the data for this date is complete (504 predictions and 24 weather records)',
    })
    is_complete!: boolean;
}

export class ProductionMetricsDto {
    @ApiProperty({example: 2920.68, description: 'Solar generation in kWh'})
    solar_generation!: number;

    @ApiProperty({example: 0.138, description: 'Capacity factor (0 to 1)'})
    capacity_factor!: number;
}

export class PeakDto {
    @ApiProperty({example: '2026-07-01T13:00:00', description: 'Timestamp of peak production'})
    timestamp!: string | null;

    @ApiProperty({example: 565.23, description: 'Peak solar generation in kWh'})
    solar_generation!: number;
}

export class HourlyProductionDto {
    @ApiProperty({example: 565.23, description: 'Solar generation for this hour in kWh'})
    solar_generation!: number;

    @ApiProperty({example: 0.268, description: 'Capacity factor for this hour (0 to 1)'})
    capacity_factor!: number;

    @ApiProperty({type: ProductionMetricsDto, description: 'Monthly average for this hour'})
    monthly_avg!: ProductionMetricsDto;
}

export class HourlyWeatherDto {
    @ApiProperty({example: 14.9, description: 'Temperature in °C'})
    temperature!: number;

    @ApiProperty({example: 72, description: 'Relative humidity in %'})
    relative_humidity!: number;

    @ApiProperty({example: 88, description: 'Cloud cover in %'})
    cloud_cover!: number;

    @ApiProperty({example: 281, description: 'Shortwave radiation in W/m²'})
    shortwave_radiation!: number;

    @ApiProperty({example: 172, description: 'Diffuse radiation in W/m²'})
    diffuse_radiation!: number;
}

export class HourlyDto {
    @ApiProperty({example: '2026-07-01T13:00:00', description: 'Hourly timestamp'})
    timestamp!: string;

    @ApiProperty({type: HourlyProductionDto})
    production!: HourlyProductionDto;

    @ApiProperty({type: HourlyWeatherDto, nullable: true})
    weather!: HourlyWeatherDto | null;
}

export class PredictionDto {
    @ApiProperty({example: '2026-07-01', description: 'Prediction date'})
    date!: string;

    @ApiProperty({type: ProductionMetricsDto, description: 'Daily aggregated metrics'})
    daily!: ProductionMetricsDto;

    @ApiProperty({type: ProductionMetricsDto, description: 'Monthly average daily metrics'})
    monthly_avg!: ProductionMetricsDto;

    @ApiProperty({type: PeakDto, description: 'Peak production of the day'})
    peak!: PeakDto;

    @ApiProperty({type: [HourlyDto], description: 'Hourly production and weather data'})
    hourly!: HourlyDto[];
}

export class GlobalPredictionDto extends PredictionDto {}

export class SitePredictionDto extends PredictionDto {
    @ApiProperty({example: '0Y6D', description: 'Unique site identifier'})
    site_id!: string;
}
