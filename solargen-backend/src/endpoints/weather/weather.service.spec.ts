import {Test, TestingModule} from '@nestjs/testing';
import {WeatherService} from './weather.service';
import {PrismaService} from '../../prisma/prisma.service';
import {WeatherDto} from './dto/weather.dto';

const mockWeather: WeatherDto[] = [
    {
        timestamp: '2025-06-14T00:00:00',
        apparent_temperature: 21.5,
        relative_humidity: 65,
        dew_point_temperature: 12.3,
        shortwave_radiation: 450.2,
    },
    {
        timestamp: '2025-06-14T01:00:00',
        apparent_temperature: 20.1,
        relative_humidity: 70,
        dew_point_temperature: 11.8,
        shortwave_radiation: 0,
    },
];

const mockPrismaService = {
    weather: {
        findMany: jest.fn().mockResolvedValue(mockWeather),
    },
};

describe('WeatherService', () => {
    let service: WeatherService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WeatherService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<WeatherService>(WeatherService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return weather data for a given date', async () => {
        const result = await service.getByDate('2025-06-14');
        expect(result).toEqual(mockWeather);
        expect(mockPrismaService.weather.findMany).toHaveBeenCalledWith({
            where: {timestamp: {startsWith: '2025-06-14'}},
            orderBy: {timestamp: 'asc'},
            select: {
                timestamp: true,
                apparent_temperature: true,
                relative_humidity: true,
                dew_point_temperature: true,
                shortwave_radiation: true,
            },
        });
    });

    it('should return empty array when no weather data found', async () => {
        mockPrismaService.weather.findMany.mockResolvedValueOnce([]);
        const result = await service.getByDate('2099-01-01');
        expect(result).toEqual([]);
    });
});
