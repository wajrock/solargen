import {Test, TestingModule} from '@nestjs/testing';
import {PredictionsService} from './predictions.service';
import {PrismaService} from '../../prisma/prisma.service';
import {WeatherService} from '../weather/weather.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockWeather = [
    {
        timestamp: '2025-06-14T00:00:00',
        apparent_temperature: 21.5,
        relative_humidity: 65,
        dew_point_temperature: 12.3,
        shortwave_radiation: 450.2,
    },
];

const mockFastApiResponse = {
    data: {
        date: '2025-06-14T00:00:00',
        fetched_at: '2025-06-14T00:00:00',
        weather: mockWeather,
        sites: [
            {
                site_id: 'SITE01',
                kwp: 25.5,
                productions: [{timestamp: '2025-06-14T00:00:00', efficiency: 0.8, production_kw: 12.4}],
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
        process.env.FASTAPI_URL = 'http://localhost:8000';
        process.env.FASTAPI_KEY = 'test-key';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getByDate', () => {
        it('should return aggregated production and weather', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2025-06-14T00:00:00', _sum: {production_kw: 125.4}},
            ]);

            const result = await service.getByDate('2025-06-14');

            expect(result.production).toEqual([{timestamp: '2025-06-14T00:00:00', total_production_kw: 125.4}]);
            expect(result.weather).toEqual(mockWeather);
        });

        it('should handle null production_kw sum', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {timestamp: '2025-06-14T00:00:00', _sum: {production_kw: null}},
            ]);

            const result = await service.getByDate('2025-06-14');
            expect(result.production[0].total_production_kw).toBe(0);
        });
    });

    describe('getByDateAndSite', () => {
        it('should return site production and weather', async () => {
            const mockProduction = [
                {site_id: 'SITE01', timestamp: '2025-06-14T00:00:00', efficiency: 0.8, production_kw: 12.4},
            ];
            mockPrismaService.prediction.findMany.mockResolvedValue(mockProduction);

            const result = await service.getByDateAndSite('2025-06-14', 'SITE01');

            expect(result.production).toEqual(mockProduction);
            expect(result.weather).toEqual(mockWeather);
        });
    });

    describe('addTodayPredictions', () => {
        it('should return already exists if data is complete', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(600);
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
            mockPrismaService.prediction.createMany.mockResolvedValue({count: 600});

            const result = await service.addTodayPredictions();
            expect(result.success).toBe(true);
            expect(result.message).toContain('inserted');
        });
    });

    describe('addPredictionByDate', () => {
        it('should return already exists if data is complete', async () => {
            mockPrismaService.prediction.count.mockResolvedValue(600);
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
            mockPrismaService.prediction.createMany.mockResolvedValue({count: 600});

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
