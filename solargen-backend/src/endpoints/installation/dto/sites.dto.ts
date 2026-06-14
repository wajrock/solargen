import {ApiProperty} from '@nestjs/swagger';

export class SiteDto {
    @ApiProperty({example: 'SITE01'})
    id!: string;

    @ApiProperty({example: 25.5})
    kwp!: number;

    @ApiProperty({example: 10, nullable: true})
    panel_count!: number | null;

    @ApiProperty({example: 'JA Solar JAM72S30', nullable: true})
    panel_model!: string | null;

    @ApiProperty({example: 'Fronius Symo 15.0', nullable: true})
    inverter_model!: string | null;
}
