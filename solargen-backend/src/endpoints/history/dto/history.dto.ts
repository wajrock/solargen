import {ApiProperty} from '@nestjs/swagger';

class MonthlyMetricsDto {
    @ApiProperty({example: 87456.32, description: 'Total solar generation for the month in kWh'})
    solar_generation!: number;

    @ApiProperty({example: 0.138, description: 'Average capacity factor for the month (0 to 1)'})
    capacity_factor!: number;
}

class DailyMetricsDto {
    @ApiProperty({example: '2026-06-01', description: 'Date of the daily record'})
    date!: string;

    @ApiProperty({example: 2920.68, description: 'Total solar generation for the day in kWh'})
    solar_generation!: number;

    @ApiProperty({example: 0.138, description: 'Average capacity factor for the day (0 to 1)'})
    capacity_factor!: number;
}

class YearDto {
    @ApiProperty({example: 2026, description: 'Year of the data'})
    year!: number;

    @ApiProperty({type: MonthlyMetricsDto, description: 'Aggregated metrics for the month'})
    monthly!: MonthlyMetricsDto;

    @ApiProperty({type: [DailyMetricsDto], description: 'Daily production metrics for each day of the month'})
    daily!: DailyMetricsDto[];
}

class HistoryDto {
    @ApiProperty({example: '06', description: 'Month in MM format (01-12)'})
    month!: string;

    @ApiProperty({type: YearDto, description: 'Data for the current year'})
    current_year!: YearDto;

    @ApiProperty({type: YearDto, description: 'Data for the previous year'})
    previous_year!: YearDto;
}

export class GlobalHistoryDto extends HistoryDto {}

export class SiteHistoryDto extends HistoryDto {
    @ApiProperty({example: '0Y6D', description: 'Unique site identifier'})
    site_id!: string;
}
