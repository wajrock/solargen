import {ApiProperty} from '@nestjs/swagger';
import {SiteDto} from './sites.dto';

export class InstallationDto {
    @ApiProperty({example: 'Bundoora'})
    name!: string;

    @ApiProperty({example: -37.71828652})
    latitude!: number;

    @ApiProperty({example: 145.0509752})
    longitude!: number;

    @ApiProperty({example: 4000})
    total_capacity!: number;

    @ApiProperty({type: [SiteDto]})
    sites!: SiteDto[];
}
