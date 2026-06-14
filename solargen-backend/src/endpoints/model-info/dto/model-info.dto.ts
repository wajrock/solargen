import {ApiProperty} from '@nestjs/swagger';

export class ModelInfoDto {
    @ApiProperty({example: 'Model Name'})
    model!: string;

    @ApiProperty({example: 0.75})
    r2!: number;

    @ApiProperty({example: 0.304})
    mae!: number;

    @ApiProperty({example: '2021-01-01'})
    train_start!: string;

    @ApiProperty({example: '2021-12-31'})
    train_end!: string;

    @ApiProperty({example: ['apparent_temperature', 'relative_humidity', 'shortwave_radiation']})
    features!: object;

    @ApiProperty({example: 20})
    sites_count!: number;
}
