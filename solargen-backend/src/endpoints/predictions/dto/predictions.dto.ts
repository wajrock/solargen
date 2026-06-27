import {ApiProperty} from '@nestjs/swagger';
import {WeatherDto} from '../../weather/dto/weather.dto';

export class GlobalProductionDto {
    @ApiProperty({example: '2026-06-14T00:00:00'})
    timestamp!: string;

    @ApiProperty({example: 125.4})
    total_solar_generation!: number;

    @ApiProperty({example: 0.125})
    avg_capacity_factor!: number;
}

export class GlobalPredictionDto {
    @ApiProperty({example: '2026-06-14'})
    date!: string;

    @ApiProperty({example: 8500})
    daily_solar_generation!: number;

    @ApiProperty({example: 0.16})
    daily_avg_capacity_factor!: number;

    @ApiProperty({example: '2026-06-14T14:00:00'})
    peak_timestamp!: string;

    @ApiProperty({example: 12.4})
    peak_solar_generation!: number;

    @ApiProperty({type: [GlobalProductionDto]})
    production!: GlobalProductionDto[];

    @ApiProperty({type: [WeatherDto]})
    weather!: WeatherDto[];
}

export class SiteProductionDto {
    @ApiProperty({example: '2026-06-14T00:00:00'})
    timestamp!: string;

    @ApiProperty({example: 0.8765})
    capacity_factor!: number;

    @ApiProperty({example: 12.4})
    solar_generation!: number;
}

export class SitePredictionDto {
    @ApiProperty({example: '2026-06-14'})
    date!: string;

    @ApiProperty({example: 'SITE01'})
    site_id!: string;

    @ApiProperty({example: 2500})
    daily_solar_generation!: number;

    @ApiProperty({example: 0.16})
    daily_avg_capacity_factor!: number;

    @ApiProperty({example: '2026-06-14T14:00:00'})
    peak_timestamp!: string;

    @ApiProperty({example: 12.4})
    peak_solar_generation!: number;

    @ApiProperty({type: [SiteProductionDto]})
    production!: SiteProductionDto[];

    @ApiProperty({type: [WeatherDto]})
    weather!: WeatherDto[];
}
