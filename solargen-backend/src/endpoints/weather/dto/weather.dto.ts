import {ApiProperty} from '@nestjs/swagger';

export class WeatherDto {
    @ApiProperty({example: '2026-06-14T00:00:00'})
    timestamp!: string;

    @ApiProperty({example: 21.5})
    temperature!: number;

    @ApiProperty({example: 65})
    relative_humidity!: number;

    @ApiProperty({example: 44})
    cloud_cover!: number;

    @ApiProperty({example: 200})
    shortwave_radiation!: number;

    @ApiProperty({example: 121})
    diffuse_radiation!: number;
}
