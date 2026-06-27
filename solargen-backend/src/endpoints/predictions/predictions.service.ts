import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import axios from 'axios';
import {PrismaService} from '../../prisma/prisma.service';
import {FastApiPredictionResponse} from '../../types/fastapi.types';
import {WeatherService} from '../weather/weather.service';
import {GlobalPredictionDto, SitePredictionDto} from './dto/predictions.dto';

@Injectable()
export class PredictionsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly weatherService: WeatherService,
    ) {}

    async getByDate(date: string): Promise<GlobalPredictionDto> {
        const [production, weather] = await Promise.all([
            this.prismaService.prediction.groupBy({
                by: ['timestamp'],
                where: {timestamp: {startsWith: date}},
                _sum: {solar_generation: true},
                _avg: {capacity_factor: true},
                orderBy: {timestamp: 'asc'},
            }),
            this.weatherService.getByDate(date),
        ]);

        const mappedProduction = production.map((p) => ({
            timestamp: p.timestamp,
            total_solar_generation: parseFloat((p._sum.solar_generation ?? 0).toFixed(2)),
            avg_capacity_factor: parseFloat((p._avg.capacity_factor ?? 0).toFixed(3)),
        }));

        const peak = mappedProduction.reduce(
            (max, p) => (p.total_solar_generation > max.total_solar_generation ? p : max),
            mappedProduction[0],
        );

        const dayHours = mappedProduction.filter(
            (p) => weather.find((w) => w.timestamp === p.timestamp)?.shortwave_radiation ?? 0 > 0,
        );

        return {
            date,
            daily_solar_generation: parseFloat(
                mappedProduction.reduce((s, p) => s + p.total_solar_generation, 0).toFixed(2),
            ),
            daily_avg_capacity_factor: parseFloat(
                (dayHours.reduce((s, p) => s + p.avg_capacity_factor, 0) / dayHours.length).toFixed(3),
            ),
            peak_timestamp: peak?.timestamp ?? null,
            peak_solar_generation: peak?.total_solar_generation ?? 0,
            production: mappedProduction,
            weather,
        };
    }

    async getByDateAndSite(date: string, site: string): Promise<SitePredictionDto> {
        const [production, weather] = await Promise.all([
            this.prismaService.prediction.findMany({
                where: {timestamp: {startsWith: date}, site_id: site},
                orderBy: {timestamp: 'asc'},
                select: {
                    site_id: true,
                    timestamp: true,
                    capacity_factor: true,
                    solar_generation: true,
                },
            }),
            this.weatherService.getByDate(date),
        ]);

        const dayHours = production.filter(
            (p) => weather.find((w) => w.timestamp === p.timestamp)?.shortwave_radiation ?? 0 > 0,
        );

        const peak = production.reduce(
            (max, p) => (p.solar_generation > max.solar_generation ? p : max),
            production[0],
        );

        return {
            date,
            site_id: site,
            daily_solar_generation: parseFloat(production.reduce((s, p) => s + p.solar_generation, 0).toFixed(2)),
            daily_avg_capacity_factor: parseFloat(
                (dayHours.reduce((s, p) => s + p.capacity_factor, 0) / dayHours.length).toFixed(3),
            ),
            peak_timestamp: peak?.timestamp ?? null,
            peak_solar_generation: peak?.solar_generation ?? 0,
            production,
            weather,
        };
    }

    @Cron('0 1 * * *', {timeZone: 'Australia/Melbourne'})
    async scheduledAddTodayPredictions() {
        const result = await this.addTodayPredictions();
        console.info(result.message);
    }

    async addTodayPredictions() {
        const date = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});

        const {predictionCount, weatherCount} = await this.countExisting(date);

        if (predictionCount === 504 && weatherCount === 24) {
            return {success: true, message: `${date} already exists`};
        }

        const {data} = await axios.get<FastApiPredictionResponse>(`${process.env.FASTAPI_URL}/predictions`, {
            headers: {'X-API-Key': process.env.FASTAPI_KEY},
        });

        return this.insertPredictions(data, predictionCount, weatherCount, date);
    }

    async addPredictionByDate(date: string) {
        const {predictionCount, weatherCount} = await this.countExisting(date);

        if (predictionCount === 504 && weatherCount === 24) {
            return {success: true, message: `${date} already exists`};
        }

        const {data} = await axios.get<FastApiPredictionResponse>(`${process.env.FASTAPI_URL}/predictions/${date}`, {
            headers: {'X-API-Key': process.env.FASTAPI_KEY},
        });

        return this.insertPredictions(data, predictionCount, weatherCount, date);
    }

    private async countExisting(date: string): Promise<{predictionCount: number; weatherCount: number}> {
        const [predictionCount, weatherCount] = await Promise.all([
            this.prismaService.prediction.count({where: {timestamp: {startsWith: date}}}),
            this.prismaService.weather.count({where: {timestamp: {startsWith: date}}}),
        ]);
        return {predictionCount, weatherCount};
    }

    private async insertPredictions(
        data: FastApiPredictionResponse,
        predictionCount: number,
        weatherCount: number,
        date: string,
    ) {
        const [weatherResult, predictionResult] = await Promise.all([
            this.prismaService.weather.createMany({
                data: data.weather.map((w) => ({...w, fetched_at: new Date(data.fetched_at)})),
                skipDuplicates: true,
            }),
            this.prismaService.prediction.createMany({
                data: data.sites.flatMap((site) =>
                    site.productions.map((p) => ({
                        ...p,
                        site_id: site.site_id,
                        fetched_at: new Date(data.fetched_at),
                    })),
                ),
                skipDuplicates: true,
            }),
        ]);

        const totalPredictions = predictionCount + predictionResult.count;
        const totalWeather = weatherCount + weatherResult.count;

        if (totalPredictions === 504 && totalWeather === 24) {
            return {success: true, message: `Predictions for ${date} inserted`};
        } else {
            return {
                success: false,
                message: `Incomplete data for ${date}`,
            };
        }
    }
}
