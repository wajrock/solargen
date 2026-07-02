import {ApiProperty} from '@nestjs/swagger';
import {SiteDto} from './sites.dto';

export class InstallationDto {
    @ApiProperty({example: 'Bundoora', description: 'Name of the campus installation'})
    name!: string;

    @ApiProperty({example: -37.71828652, description: 'Latitude coordinate of the campus'})
    latitude!: number;

    @ApiProperty({example: 145.0509752, description: 'Longitude coordinate of the campus'})
    longitude!: number;

    @ApiProperty({example: 1842, description: 'Total installed capacity of the campus in kWp'})
    total_capacity!: number;

    @ApiProperty({type: [SiteDto], description: 'List of solar sites on the campus'})
    sites!: SiteDto[];
}
