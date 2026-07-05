import {Test, TestingModule} from '@nestjs/testing';
import {PredictionsService} from './predictions.service';
import {PrismaService} from '../../prisma/prisma.service';
import {WeatherService} from '../weather/weather.service';
import axios from 'axios';
import {WeatherDto} from '../weather/dto/weather.dto';
import {FastApiPredictionResponse} from '../../types/fastapi.types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockWeather: WeatherDto[] = [
    {
        timestamp: '2026-06-15T13:00:00',
        temperature: 14.9,
        relative_humidity: 72,
        cloud_cover: 88,
        shortwave_radiation: 281,
        diffuse_radiation: 172,
    },
];

const mockFastApiResponse: {data: FastApiPredictionResponse} = {
    data: {
        date: '2026-06-15',
        fetched_at: '2026-06-15T01:02:34',
        weather: mockWeather,
        sites: [
            {
                site_id: '0Y6D',
                kwp: 94.24,
                total_solar_generation: 565.23,
                productions: [{timestamp: '2026-06-15T13:00:00', capacity_factor: 0.268, solar_generation: 565.23}],
            },
        ],
    },
};

const mockPrismaService = {
    prediction: {
        groupBy: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        createMany: jest.fn(),
    },
    weather: {
        count: jest.fn(),
        createMany: jest.fn(),
    },
};

const mockWeatherService = {
    getByDate: jest.fn().mockResolvedValue(mockWeather),
};

describe('PredictionsService', () => {
    let service: PredictionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PredictionsService,
                {provide: PrismaService, useValue: mockPrismaService},
                {provide: WeatherService, useValue: mockWeatherService},
            ],
        }).compile();

        service = module.get<PredictionsService>(PredictionsService);
        jest.clearAllMocks();
        mockWeatherService.getByDate.mockResolvedValue(mockWeather);
    });

    describe('getByDate', () => {
        it('filters predictions to only the requested date from the full month dataset', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2026-06-14T13:00:00', _sum: {solar_generation: 400}, _avg: {capacity_factor: 0.2}},
                {timestamp: '2026-06-15T13:00:00', _sum: {solar_generation: 565.23}, _avg: {capacity_factor: 0.268}},
            ]);

            const result = await service.getByDate('2026-06-15');

            expect(result.hourly).toHaveLength(1);
            expect(result.hourly[0].timestamp).toBe('2026-06-15T13:00:00');
        });

        it('computes daily solar_generation as the sum of the day hourly values', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2026-06-15T12:00:00', _sum: {solar_generation: 200}, _avg: {capacity_factor: 0.2}},
                {timestamp: '2026-06-15T13:00:00', _sum: {solar_generation: 300}, _avg: {capacity_factor: 0.3}},
            ]);

            const result = await service.getByDate('2026-06-15');

            expect(result.daily.solar_generation).toBe(500);
            expect(result.daily.capacity_factor).toBe(0.25);
        });

        it('identifies the correct peak hour of the day', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2026-06-15T12:00:00', _sum: {solar_generation: 200}, _avg: {capacity_factor: 0.2}},
                {timestamp: '2026-06-15T13:00:00', _sum: {solar_generation: 565.23}, _avg: {capacity_factor: 0.268}},
                {timestamp: '2026-06-15T14:00:00', _sum: {solar_generation: 300}, _avg: {capacity_factor: 0.15}},
            ]);

            const result = await service.getByDate('2026-06-15');

            expect(result.peak.timestamp).toBe('2026-06-15T13:00:00');
            expect(result.peak.solar_generation).toBe(565.23);
        });

        it('attaches matching weather data by timestamp, with a zeroed fallback if missing', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2026-06-15T13:00:00', _sum: {solar_generation: 300}, _avg: {capacity_factor: 0.2}},
                {timestamp: '2026-06-15T14:00:00', _sum: {solar_generation: 200}, _avg: {capacity_factor: 0.1}},
            ]);

            const result = await service.getByDate('2026-06-15');

            expect(result.hourly[0].weather).toEqual(mockWeather[0]);
            expect(result.hourly[1].weather).toEqual({
                temperature: 0,
                relative_humidity: 0,
                cloud_cover: 0,
                shortwave_radiation: 0,
                diffuse_radiation: 0,
            });
        });

        it('handles null solar_generation and capacity_factor from Prisma aggregation', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2026-06-15T13:00:00', _sum: {solar_generation: null}, _avg: {capacity_factor: null}},
            ]);

            const result = await service.getByDate('2026-06-15');

            expect(result.hourly[0].production.solar_generation).toBe(0);
            expect(result.hourly[0].production.capacity_factor).toBe(0);
        });

        it('returns a valid empty payload when no predictions exist for the date', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);
            mockWeatherService.getByDate.mockResolvedValue([]);

            const result = await service.getByDate('2026-06-15');

            expect(result).toEqual({
                date: '2026-06-15',
                daily: {solar_generation: 0, capacity_factor: 0},
                monthly_avg: {solar_generation: 0, capacity_factor: 0},
                peak: {timestamp: null, solar_generation: 0},
                hourly: [],
            });
        });
    });

    describe('getByDateAndSite', () => {
        it('filters predictions by both date and site_id', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2026-06-15T13:00:00', _sum: {solar_generation: 565.23}, _avg: {capacity_factor: 0.268}},
            ]);

            const result = await service.getByDateAndSite('2026-06-15', '0Y6D');

            expect(mockPrismaService.prediction.groupBy).toHaveBeenCalledWith(
                expect.objectContaining({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    where: expect.objectContaining({site_id: '0Y6D'}),
                }),
            );
            expect(result.site_id).toBe('0Y6D');
        });

        it('does not include site_id in the response when called without a site', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);

            const result = await service.getByDate('2026-06-15');

            expect(result).not.toHaveProperty('site_id');
        });

        it('returns a valid empty payload for a site when no predictions exist', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);
            mockWeatherService.getByDate.mockResolvedValue([]);

            const result = await service.getByDateAndSite('2026-06-15', '0Y6D');

            expect(result).toEqual({
                date: '2026-06-15',
                site_id: '0Y6D',
                daily: {solar_generation: 0, capacity_factor: 0},
                monthly_avg: {solar_generation: 0, capacity_factor: 0},
                peak: {timestamp: null, solar_generation: 0},
                hourly: [],
            });
        });
    });

    describe('getLastPredictionStatus', () => {
        it('returns null when no predictions exist in the database', async () => {
            mockPrismaService.prediction.findFirst.mockResolvedValue(null);

            const result = await service.getLastPredictionStatus();

            expect(result).toBeNull();
        });

        it('marks status as complete only when both counts match expected totals', async () => {
            mockPrismaService.prediction.findFirst.mockResolvedValue({
                timestamp: '2026-06-15T13:00:00',
                fetched_at: new Date('2026-06-15T01:02:34.000Z'),
            });
            mockPrismaService.prediction.count.mockResolvedValue(504);
            mockPrismaService.weather.count.mockResolvedValue(24);

            const result = await service.getLastPredictionStatus();

            expect(result?.is_complete).toBe(true);
            expect(result?.date).toBe('2026-06-15');
        });

        it('marks status as incomplete when prediction count is below 504', async () => {
            mockPrismaService.prediction.findFirst.mockResolvedValue({
                timestamp: '2026-06-15T13:00:00',
                fetched_at: new Date('2026-06-15T01:02:34.000Z'),
            });
            mockPrismaService.prediction.count.mockResolvedValue(312);
            mockPrismaService.weather.count.mockResolvedValue(24);

            const result = await service.getLastPredictionStatus();

            expect(result?.is_complete).toBe(false);
            expect(result?.prediction_count).toBe(312);
        });
    });

    describe('addTodayPredictions', () => {
        it('skips fetching if data for today is already complete', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(504);
            mockPrismaService.weather.count.mockResolvedValue(24);

            const result = await service.addTodayPredictions();

            expect(result.success).toBe(true);
            expect(result.message).toContain('already exists');
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockedAxios.get).toHaveBeenCalledTimes(0);
        });

        it('fetches and inserts predictions when data is missing', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(0);
            mockPrismaService.weather.count.mockResolvedValue(0);
            mockedAxios.get.mockResolvedValue(mockFastApiResponse);
            mockPrismaService.weather.createMany.mockResolvedValue({count: 24});
            mockPrismaService.prediction.createMany.mockResolvedValue({count: 504});

            const result = await service.addTodayPredictions();

            expect(result.success).toBe(true);
            expect(result.message).toContain('inserted');
        });
    });

    describe('addPredictionByDate', () => {
        it('returns incomplete when inserted counts do not reach expected totals', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(0);
            mockPrismaService.weather.count.mockResolvedValue(0);
            mockedAxios.get.mockResolvedValue(mockFastApiResponse);
            mockPrismaService.weather.createMany.mockResolvedValue({count: 10});
            mockPrismaService.prediction.createMany.mockResolvedValue({count: 300});

            const result = await service.addPredictionByDate('2026-06-15');

            expect(result.success).toBe(false);
            expect(result.message).toContain('Incomplete');
        });
    });
});
