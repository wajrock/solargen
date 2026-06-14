import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import axios from 'axios';
import {PrismaService} from '../../prisma/prisma.service';
import {FastApiPredictionResponse} from '../../types/fastapi.types';
import {GlobalPredictionDto, SitePredictionDto} from '../../types/prediction.types';
import {WeatherService} from '../weather/weather.service';

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
                _sum: {production_kw: true},
                orderBy: {timestamp: 'asc'},
            }),
            this.weatherService.getByDate(date),
        ]);

        return {
            production: production.map((p) => ({
                timestamp: p.timestamp,
                total_production_kw: Math.round((p._sum.production_kw ?? 0) * 100) / 100,
            })),
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
                    efficiency: true,
                    production_kw: true,
                },
            }),
            this.weatherService.getByDate(date),
        ]);

        return {
            production,
            weather,
        };
    }

    @Cron('0 1 * * *', {timeZone: 'Australia/Melbourne'})
    async scheduledAddTodayPredictions() {
        const result = await this.addTodayPredictions();
        console.log(result.message);
    }

    async addTodayPredictions() {
        const date = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});

        const {predictionCount, weatherCount} = await this.countExisting(date);

        if (predictionCount === 600 && weatherCount === 24) {
            return {success: true, message: `${date} already exists`};
        }

        const {data} = await axios.get<FastApiPredictionResponse>(`${process.env.FASTAPI_URL}/predictions`, {
            headers: {'X-API-Key': process.env.FASTAPI_KEY},
        });

        return this.insertPredictions(data, predictionCount, weatherCount, date);
    }

    async addPredictionByDate(date: string) {
        const {predictionCount, weatherCount} = await this.countExisting(date);

        if (predictionCount === 600 && weatherCount === 24) {
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

    private async insertPredictions(data: FastApiPredictionResponse, predictionCount: number, weatherCount: number, date: string) {
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

        if (totalPredictions === 600 && totalWeather === 24) {
            return {success: true, message: `Predictions for ${date} inserted`};
        } else {
            return {success: false, message: `Incomplete data for ${date} — weather: ${totalWeather}/24, predictions: ${totalPredictions}/600`};
        }
    }
}
