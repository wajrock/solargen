import {ApiProperty} from '@nestjs/swagger';

export class InstallationDto {
    @ApiProperty({example: 'Bundoora'})
    name!: string;

    @ApiProperty({example: -37.71828652})
    latitude!: number;

    @ApiProperty({example: 145.0509752})
    longitude!: number;
}
