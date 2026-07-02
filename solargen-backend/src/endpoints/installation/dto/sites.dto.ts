import {ApiProperty} from '@nestjs/swagger';

export class InverterDto {
    @ApiProperty({example: 'SolarEdge SE25K', description: 'Inverter model name'})
    model!: string;

    @ApiProperty({example: 2, description: 'Number of inverters of this model on the site'})
    quantity!: number;
}

export class SiteDto {
    @ApiProperty({example: '0Y6D', description: 'Unique site identifier'})
    id!: string;

    @ApiProperty({example: 94.24, description: 'Installed capacity of the site in kWp'})
    kwp!: number;

    @ApiProperty({example: 'Trina 310W', description: 'Solar panel model installed on the site'})
    panel_model!: string;

    @ApiProperty({type: [InverterDto], description: 'List of inverters installed on the site'})
    inverters!: InverterDto[];

    @ApiProperty({example: 0.17, description: 'Average capacity factor over the full available period (0 to 1)'})
    avg_capacity_factor!: number;
}
