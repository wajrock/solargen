import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {WeatherDto} from './dto/weather.dto';

@Injectable()
export class WeatherService {
    constructor(private readonly prismaService: PrismaService) {}

    getByDate(date: string): Promise<WeatherDto[]> {
        return this.prismaService.weather.findMany({
            where: {timestamp: {startsWith: date}},
            orderBy: {timestamp: 'asc'},
            select: {
                timestamp: true,
                apparent_temperature: true,
                relative_humidity: true,
                dew_point_temperature: true,
                shortwave_radiation: true,
            },
        });
    }
}
