import {ApiProperty} from '@nestjs/swagger';

export class WeatherDto {
    @ApiProperty({example: '2026-06-14T00:00:00'})
    timestamp!: string;

    @ApiProperty({example: 21.5})
    apparent_temperature!: number;

    @ApiProperty({example: 65})
    relative_humidity!: number;

    @ApiProperty({example: 12})
    dew_point_temperature!: number;

    @ApiProperty({example: 200})
    shortwave_radiation!: number;
}
