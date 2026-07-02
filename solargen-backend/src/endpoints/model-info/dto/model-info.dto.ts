import {ApiProperty} from '@nestjs/swagger';

export class ModelInfoDto {
    @ApiProperty({example: 'LightGBM', description: 'Machine learning algorithm used for solar generation prediction'})
    model!: string;

    @ApiProperty({example: 0.887, description: 'R² score — coefficient of determination (0 to 1, higher is better)'})
    r2!: number;

    @ApiProperty({example: 0.064, description: 'Mean Absolute Error of the model predictions'})
    mae!: number;

    @ApiProperty({example: '2020-01-08', description: 'Training dataset start date'})
    train_start!: string;

    @ApiProperty({example: '2022-04-23', description: 'Training dataset end date'})
    train_end!: string;

    @ApiProperty({
        example: ['temperature', 'relative_humidity', 'shortwave_radiation'],
        type: [String],
        description: 'List of input features used by the model',
    })
    features!: string[];

    @ApiProperty({example: 21, description: 'Number of solar sites used for training'})
    sites_count!: number;
}
