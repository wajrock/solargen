import {ApiProperty} from '@nestjs/swagger';

export class ErrorDto {
    @ApiProperty({example: 404})
    statusCode!: number;

    @ApiProperty({example: 'site_not_found'})
    error!: string;

    @ApiProperty({example: 'Site 0Y6D not found'})
    message!: string;
}
