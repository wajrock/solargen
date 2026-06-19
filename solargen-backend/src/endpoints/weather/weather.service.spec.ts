import {Test, TestingModule} from '@nestjs/testing';
import {WeatherService} from './weather.service';
import {PrismaService} from '../../prisma/prisma.service';
import {WeatherDto} from './dto/weather.dto';

const mockWeather: WeatherDto[] = [
    {
        timestamp: '2025-06-14T00:00:00',
        temperature: 21.5,
        relative_humidity: 65,
        cloud_cover: 44,
        shortwave_radiation: 450.2,
        diffuse_radiation: 210,
    },
    {
        timestamp: '2025-06-14T01:00:00',
        temperature: 18,
        relative_humidity: 30,
        cloud_cover: 50,
        shortwave_radiation: 0,
        diffuse_radiation: 0,
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
                temperature: true,
                relative_humidity: true,
                cloud_cover: true,
                shortwave_radiation: true,
                diffuse_radiation: true,
            },
        });
    });

    it('should return empty array when no weather data found', async () => {
        mockPrismaService.weather.findMany.mockResolvedValueOnce([]);
        const result = await service.getByDate('2099-01-01');
        expect(result).toEqual([]);
    });
});
