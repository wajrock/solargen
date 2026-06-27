import {ApiProperty} from '@nestjs/swagger';

export class InverterDto {
    @ApiProperty({example: 'SolarEdge SE25K'})
    model!: string;

    @ApiProperty({example: 2})
    quantity!: number;
}

export class SiteDto {
    @ApiProperty({example: '0Y6D'})
    id!: string;

    @ApiProperty({example: 94.24})
    kwp!: number;

    @ApiProperty({example: 'Trina 310W'})
    panel_model!: string;

    @ApiProperty({type: [InverterDto]})
    inverters!: InverterDto[];

    @ApiProperty({example: 0.17})
    avg_capacity_factor!: number;
}
