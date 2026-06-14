import {BadRequestException, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiExcludeEndpoint, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {PredictionParamDto} from './dto/prediction.param.dto';
import {PredictionsService} from './predictions.service';
import {GlobalPredictionDto, SitePredictionDto} from './dto/predictions.dto';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionsController {
    constructor(private readonly predictionsService: PredictionsService) {}

    @Get('today')
    @ApiResponse({status: 200, type: [GlobalPredictionDto]})
    async findToday(): Promise<GlobalPredictionDto> {
        return await this.predictionsService.getByDate(this.getTodayDate());
    }

    @Get('today/:siteId')
    @ApiParam({name: 'siteId', example: 'SITE01'})
    @ApiResponse({status: 200, type: [SitePredictionDto]})
    async findTodayBySite(@Param('siteId') siteId: string): Promise<SitePredictionDto> {
        return await this.predictionsService.getByDateAndSite(this.getTodayDate(), siteId);
    }

    @Get('past/:date')
    @ApiParam({name: 'date', example: '2025-06-25'})
    @ApiResponse({status: 200, type: [GlobalPredictionDto]})
    async findByDate(@Param() params: PredictionParamDto): Promise<GlobalPredictionDto> {
        if (params.date! >= this.getTodayDate()) {
            throw new BadRequestException('Date must be in the past');
        }
        return await this.predictionsService.getByDate(params.date!);
    }

    @Get('past/:date/:siteId')
    @ApiParam({name: 'date', example: '2025-06-25'})
    @ApiParam({name: 'siteId', example: 'SITE01'})
    @ApiResponse({status: 200, type: [SitePredictionDto]})
    async findByDateAndSite(@Param() params: PredictionParamDto): Promise<SitePredictionDto> {
        if (params.date! >= this.getTodayDate()) {
            throw new BadRequestException('Date must be in the past');
        }
        return await this.predictionsService.getByDateAndSite(params.date!, params.siteId!);
    }

    @Post('past/:date')
    @ApiExcludeEndpoint()
    async insertPredictionByDate(@Param() params: PredictionParamDto): Promise<{success: boolean; message: string}> {
        if (params.date! >= this.getTodayDate()) {
            throw new BadRequestException('Date must be in the past');
        }
        return await this.predictionsService.addPredictionByDate(params.date!);
    }

    private getTodayDate(): string {
        return new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
    }
}
