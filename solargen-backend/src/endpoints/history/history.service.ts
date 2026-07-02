import {Injectable} from '@nestjs/common';
import {GlobalHistoryDto, SiteHistoryDto} from './dto/history.dto';
import {PrismaService} from '../../prisma/prisma.service';
import {getTodayDate} from '../../common/utils/utils';

type MonthPredictions = {
    timestamp: string;
    _sum: {solar_generation: number | null};
    _avg: {capacity_factor: number | null};
}[];

@Injectable()
export class HistoryService {
    constructor(private readonly prismaService: PrismaService) {}

    async getByMonth(month: string): Promise<GlobalHistoryDto> {
        const {currentYear, previousYear, currentYearMonthPredictions, previousYearMonthPredictions} =
            await this.getYearsPredictions(month);
        return {
            month,
            current_year: this.buildYearData(currentYearMonthPredictions, currentYear),
            previous_year: this.buildYearData(previousYearMonthPredictions, previousYear),
        };
    }

    async getByMonthAndSite(month: string, siteId: string): Promise<SiteHistoryDto> {
        const {currentYear, previousYear, currentYearMonthPredictions, previousYearMonthPredictions} =
            await this.getYearsPredictions(month, siteId);

        return {
            month,
            site_id: siteId,
            current_year: this.buildYearData(currentYearMonthPredictions, currentYear),
            previous_year: this.buildYearData(previousYearMonthPredictions, previousYear),
        };
    }

    private async getYearsPredictions(month: string, siteId?: string) {
        const today = getTodayDate();
        const currentYear = new Date(today).getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = String(new Date(today).getMonth() + 1).padStart(2, '0');
        const dayOfMonth = today.slice(8, 10);
        const isCurrentMonth = month === currentMonth;

        const [currentYearMonthPredictions, previousYearMonthPredictions] = await Promise.all([
            this.fetchMonthPredictions(
                `${currentYear}-${month}`,
                isCurrentMonth ? `${today}T23:59:59` : undefined,
                siteId,
            ),
            this.fetchMonthPredictions(
                `${previousYear}-${month}`,
                isCurrentMonth ? `${previousYear}-${month}-${dayOfMonth}T23:59:59` : undefined,
                siteId,
            ),
        ]);

        return {currentYear, previousYear, currentYearMonthPredictions, previousYearMonthPredictions};
    }

    private fetchMonthPredictions(period: string, lte?: string, siteId?: string) {
        return this.prismaService.prediction.groupBy({
            by: ['timestamp'],
            where: {
                timestamp: {
                    startsWith: period,
                    ...(lte && {lte}),
                },
                ...(siteId && {site_id: siteId}),
            },
            _sum: {solar_generation: true},
            _avg: {capacity_factor: true},
        });
    }

    private buildYearData(predictions: MonthPredictions, year: number) {
        const dailyMap = predictions.reduce(
            (days, prediction) => {
                const date = prediction.timestamp.slice(0, 10);
                const existing = days[date] ?? {solar_generation: 0, capacity_factor: 0, count: 0};
                days[date] = {
                    solar_generation: existing.solar_generation + (prediction._sum.solar_generation ?? 0),
                    capacity_factor: existing.capacity_factor + (prediction._avg.capacity_factor ?? 0),
                    count: existing.count + 1,
                };
                return days;
            },
            {} as Record<string, {solar_generation: number; capacity_factor: number; count: number}>,
        );

        const daily = Object.entries(dailyMap).map(([date, {solar_generation, capacity_factor, count}]) => ({
            date,
            solar_generation: parseFloat(solar_generation.toFixed(2)),
            capacity_factor: parseFloat((capacity_factor / count).toFixed(3)),
        }));

        const monthly = {
            solar_generation: parseFloat(daily.reduce((sum, day) => sum + day.solar_generation, 0).toFixed(2)),
            capacity_factor: parseFloat(
                (daily.reduce((sum, day) => sum + day.capacity_factor, 0) / daily.length).toFixed(3),
            ),
        };

        return {year, monthly, daily};
    }
}
