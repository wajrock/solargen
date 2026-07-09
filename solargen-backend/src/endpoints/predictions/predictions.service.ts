import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import axios from 'axios';
import {PrismaService} from '../../prisma/prisma.service';
import {FastApiPredictionResponse} from '../../types/fastapi.types';
import {WeatherService} from '../weather/weather.service';
import {
    GlobalPredictionDto,
    HourlyDto,
    PredictionStatusDto,
    ProductionMetricsDto,
    SitePredictionDto,
} from './dto/predictions.dto';
import {getHourlyAverage, getYearAndMonth, getMonthlyAvgDaily} from './predictions.utils';
import {WeatherDto} from '../weather/dto/weather.dto';

interface MonthlyPrediction {
    timestamp: string;
    _sum: {solar_generation: number | null};
    _avg: {capacity_factor: number | null};
}

@Injectable()
export class PredictionsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly weatherService: WeatherService,
    ) {}

    async getByDate(date: string): Promise<GlobalPredictionDto> {
        const month = getYearAndMonth(date);

        const [monthHourlyPredictions, weatherData] = await Promise.all([
            this.fetchMonthPredictions(month),
            this.weatherService.getByDate(date),
        ]);

        const hourlyPredictionsData = this.formatHourlyPredictionsData(monthHourlyPredictions, date, weatherData);

        if (hourlyPredictionsData.length === 0) {
            return this.formatPredictionResponse(date, [], {solar_generation: 0, capacity_factor: 0});
        }

        const peak = hourlyPredictionsData.reduce(
            (max, hourly) => (hourly.production.solar_generation > max.production.solar_generation ? hourly : max),
            hourlyPredictionsData[0],
        );

        const monthlyAvgDaily = getMonthlyAvgDaily(hourlyPredictionsData);

        return this.formatPredictionResponse(date, hourlyPredictionsData, monthlyAvgDaily, peak);
    }

    async getByDateAndSite(date: string, siteId: string): Promise<SitePredictionDto> {
        const month = getYearAndMonth(date);

        const [monthHourlyPredictions, weatherData] = await Promise.all([
            this.fetchMonthPredictions(month, siteId),
            this.weatherService.getByDate(date),
        ]);

        const hourlyPredictionsData = this.formatHourlyPredictionsData(monthHourlyPredictions, date, weatherData);

        if (hourlyPredictionsData.length === 0) {
            return this.formatPredictionResponse(
                date,
                [],
                {solar_generation: 0, capacity_factor: 0},
                undefined,
                siteId,
            ) as SitePredictionDto;
        }

        const peak = hourlyPredictionsData.reduce(
            (max, hourly) => (hourly.production.solar_generation > max.production.solar_generation ? hourly : max),
            hourlyPredictionsData[0],
        );

        const monthlyAvgDaily = getMonthlyAvgDaily(hourlyPredictionsData);

        return this.formatPredictionResponse(
            date,
            hourlyPredictionsData,
            monthlyAvgDaily,
            peak,
            siteId,
        ) as SitePredictionDto;
    }

    private fetchMonthPredictions(month: string, siteId?: string) {
        return this.prismaService.prediction.groupBy({
            by: ['timestamp'],
            where: {timestamp: {startsWith: month}, ...(siteId && {site_id: siteId})},
            _sum: {solar_generation: true},
            _avg: {capacity_factor: true},
        });
    }

    private formatHourlyPredictionsData(
        monthHourlyPredictions: MonthlyPrediction[],
        currentDate: string,
        weatherData: WeatherDto[],
    ) {
        const currentDatePredictions = monthHourlyPredictions.filter(
            (prediction) => prediction.timestamp.slice(0, 10) === currentDate,
        );

        return currentDatePredictions.map((prediction) => {
            const monthHourlyAvg = getHourlyAverage(monthHourlyPredictions, prediction.timestamp);
            const weatherRecord = weatherData.find((weather) => weather.timestamp === prediction.timestamp);
            return {
                timestamp: prediction.timestamp,
                production: {
                    solar_generation: parseFloat((prediction._sum.solar_generation ?? 0).toFixed(2)),
                    capacity_factor: parseFloat((prediction._avg.capacity_factor ?? 0).toFixed(3)),
                    monthly_avg: {
                        solar_generation: monthHourlyAvg.solar_generation,
                        capacity_factor: monthHourlyAvg.capacity_factor,
                    },
                },
                weather: weatherRecord ?? {
                    temperature: 0,
                    relative_humidity: 0,
                    cloud_cover: 0,
                    shortwave_radiation: 0,
                    diffuse_radiation: 0,
                },
            };
        });
    }

    private formatPredictionResponse(
        date: string,
        hourlyPredictionsData: HourlyDto[],
        monthlyAvgDaily: ProductionMetricsDto,
        peak?: HourlyDto,
        siteId?: string,
    ): GlobalPredictionDto | SitePredictionDto {
        return {
            date,
            ...(siteId && {site_id: siteId}),
            daily: {
                solar_generation: parseFloat(
                    hourlyPredictionsData
                        .reduce((sum, hourly) => sum + hourly.production.solar_generation, 0)
                        .toFixed(2),
                ),
                capacity_factor: hourlyPredictionsData.length
                    ? parseFloat(
                          (
                              hourlyPredictionsData.reduce(
                                  (sum, hourly) => sum + hourly.production.capacity_factor,
                                  0,
                              ) / hourlyPredictionsData.length
                          ).toFixed(3),
                      )
                    : 0,
            },
            monthly_avg: {
                solar_generation: monthlyAvgDaily.solar_generation,
                capacity_factor: monthlyAvgDaily.capacity_factor,
            },
            peak: {
                timestamp: peak?.timestamp ?? null,
                solar_generation: peak?.production.solar_generation ?? 0,
            },
            hourly: hourlyPredictionsData,
        };
    }

    async getLastPredictionStatus(): Promise<PredictionStatusDto | null> {
        const lastPrediction = await this.prismaService.prediction.findFirst({orderBy: {timestamp: 'desc'}});

        if (!lastPrediction) {
            return null;
        }

        const date = lastPrediction.timestamp.slice(0, 10);
        const {predictionCount, weatherCount} = await this.countExisting(date);

        return {
            date: date,
            fetched_at: lastPrediction.fetched_at.toISOString(),
            prediction_count: predictionCount,
            weather_count: weatherCount,
            is_complete: predictionCount === 504 && weatherCount === 24,
        };
    }

    // POST
    @Cron('0 9 * * *', {timeZone: 'Australia/Melbourne'})
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
                    site.productions.map((production) => ({
                        ...production,
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
