import {Controller, Get, Param, Post} from '@nestjs/common';
import {GlobalPredictionDto, SitePredictionDto} from '../../types/prediction.types';
import {PredictionsService} from './predictions.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionsController {
    private todayDate: string = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Australia/Melbourne',
    });

    constructor(private readonly predictionsService: PredictionsService) {}

    @Get('today')
    async findToday(): Promise<GlobalPredictionDto> {
        return await this.predictionsService.getByDate(this.todayDate);
    }

    @Get('today/:siteId')
    async findTodayBySite(@Param('siteId') siteId: string): Promise<SitePredictionDto> {
        return await this.predictionsService.getByDateAndSite(this.todayDate, siteId);
    }

    @Get('past/:date')
    async findByDate(@Param('date') date: string): Promise<GlobalPredictionDto> {
        return await this.predictionsService.getByDate(date);
    }

    @Get('past/:date/:site')
    async findByDateAndSite(@Param('date') date: string, @Param('site') site: string): Promise<SitePredictionDto> {
        return await this.predictionsService.getByDateAndSite(date, site);
    }

    @Post('past/:date')
    async insertPredictionByDate(@Param('date') date: string): Promise<any> {
        return await this.predictionsService.addPredictionByDate(date);
    }
}
