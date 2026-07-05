import {Test, TestingModule} from '@nestjs/testing';
import {WeatherService} from './weather.service';
import {PrismaService} from '../../prisma/prisma.service';

const mockPrismaService = {
    weather: {
        findMany: jest.fn(),
    },
};

describe('WeatherService', () => {
    let service: WeatherService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WeatherService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<WeatherService>(WeatherService);
        jest.clearAllMocks();
    });

    describe('getByDate', () => {
        it('queries weather data filtered by date and ordered chronologically', async () => {
            mockPrismaService.weather.findMany.mockResolvedValue([]);

            await service.getByDate('2026-06-15');

            expect(mockPrismaService.weather.findMany).toHaveBeenCalledWith({
                where: {timestamp: {startsWith: '2026-06-15'}},
                orderBy: {timestamp: 'asc'},
                select: {
                    timestamp: true,
                    temperature: true,
                    relative_humidity: true,
                    cloud_cover: true,
                    shortwave_radiation: true,
                    diffuse_radiation: true,
                },
            });
        });

        it('returns the weather records as-is', async () => {
            const mockWeather = [
                {
                    timestamp: '2026-06-15T13:00:00',
                    temperature: 14.9,
                    relative_humidity: 72,
                    cloud_cover: 88,
                    shortwave_radiation: 281,
                    diffuse_radiation: 172,
                },
            ];
            mockPrismaService.weather.findMany.mockResolvedValue(mockWeather);

            const result = await service.getByDate('2026-06-15');

            expect(result).toEqual(mockWeather);
        });
    });
});
