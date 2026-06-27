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
        timestamp: '2025-06-14T06:00:00',
        temperature: 21.5,
        relative_humidity: 65,
        cloud_cover: 44,
        shortwave_radiation: 450.2,
        diffuse_radiation: 210,
    },
];

const mockFastApiResponse: {data: FastApiPredictionResponse} = {
    data: {
        date: '2025-06-14',
        fetched_at: '2025-06-14T00:00:00',
        weather: mockWeather,
        sites: [
            {
                site_id: 'SITE01',
                kwp: 25.5,
                total_solar_generation: 13.2,
                productions: [{timestamp: '2025-06-14T06:00:00', capacity_factor: 0.8, solar_generation: 12.4}],
            },
        ],
    },
};

const mockPrismaService = {
    prediction: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getByDate', () => {
        it('should return aggregated production and weather', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {
                    timestamp: '2025-06-14T06:00:00',
                    _sum: {solar_generation: 125.4},
                    _avg: {capacity_factor: 0.28},
                },
            ]);

            const result = await service.getByDate('2025-06-14');

            expect(result.date).toBe('2025-06-14');
            expect(result.production[0].timestamp).toBe('2025-06-14T06:00:00');
            expect(result.production[0].total_solar_generation).toBe(125.4);
            expect(result.weather).toEqual(mockWeather);
        });

        it('should handle null solar_generation sum', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {
                    timestamp: '2025-06-14T06:00:00',
                    _sum: {solar_generation: null},
                    _avg: {capacity_factor: 0},
                },
            ]);

            const result = await service.getByDate('2025-06-14');
            expect(result.production[0].total_solar_generation).toBe(0);
        });
    });

    describe('getByDateAndSite', () => {
        it('should return site production and weather', async () => {
            const mockProduction = [
                {
                    site_id: 'SITE01',
                    timestamp: '2025-06-14T06:00:00',
                    capacity_factor: 0.8,
                    solar_generation: 12.4,
                },
            ];
            mockPrismaService.prediction.findMany.mockResolvedValue(mockProduction);

            const result = await service.getByDateAndSite('2025-06-14', 'SITE01');

            expect(result.site_id).toBe('SITE01');
            expect(result.production).toEqual(mockProduction);
            expect(result.weather).toEqual(mockWeather);
        });

        it('should compute daily_solar_generation correctly', async () => {
            mockPrismaService.prediction.findMany.mockResolvedValue([
                {site_id: 'SITE01', timestamp: '2025-06-14T06:00:00', capacity_factor: 0.8, solar_generation: 10},
                {site_id: 'SITE01', timestamp: '2025-06-14T07:00:00', capacity_factor: 0.6, solar_generation: 5},
            ]);

            const result = await service.getByDateAndSite('2025-06-14', 'SITE01');
            expect(result.daily_solar_generation).toBe(15);
        });
    });

    describe('addTodayPredictions', () => {
        it('should return already exists if data is complete', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(504);
            mockPrismaService.weather.count.mockResolvedValue(24);

            const result = await service.addTodayPredictions();
            expect(result.success).toBe(true);
            expect(result.message).toContain('already exists');
        });

        it('should fetch and insert if data is missing', async () => {
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
        it('should return already exists if data is complete', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(504);
            mockPrismaService.weather.count.mockResolvedValue(24);

            const result = await service.addPredictionByDate('2025-06-14');
            expect(result.success).toBe(true);
            expect(result.message).toContain('already exists');
        });

        it('should fetch and insert predictions for a specific date', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(0);
            mockPrismaService.weather.count.mockResolvedValue(0);
            mockedAxios.get.mockResolvedValue(mockFastApiResponse);
            mockPrismaService.weather.createMany.mockResolvedValue({count: 24});
            mockPrismaService.prediction.createMany.mockResolvedValue({count: 504});

            const result = await service.addPredictionByDate('2025-06-14');
            expect(result.success).toBe(true);
        });

        it('should return incomplete if not all data inserted', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(0);
            mockPrismaService.weather.count.mockResolvedValue(0);
            mockedAxios.get.mockResolvedValue(mockFastApiResponse);
            mockPrismaService.weather.createMany.mockResolvedValue({count: 10});
            mockPrismaService.prediction.createMany.mockResolvedValue({count: 300});

            const result = await service.addPredictionByDate('2025-06-14');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Incomplete');
        });
    });
});
