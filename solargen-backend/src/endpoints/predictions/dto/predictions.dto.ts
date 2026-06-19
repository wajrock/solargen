import {ApiProperty} from '@nestjs/swagger';
import {WeatherDto} from '../../weather/dto/weather.dto';

export class GlobalProductionDto {
    @ApiProperty({example: '2026-06-14T00:00:00'})
    timestamp!: string;

    @ApiProperty({example: 125.4})
    total_solar_generation!: number;
}

export class GlobalPredictionDto {
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
    @ApiProperty({type: [SiteProductionDto]})
    production!: SiteProductionDto[];

    @ApiProperty({type: [WeatherDto]})
    weather!: WeatherDto[];
}
