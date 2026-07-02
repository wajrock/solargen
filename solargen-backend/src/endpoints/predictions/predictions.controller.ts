import {BadRequestException, Controller, Get, NotFoundException, Param, Post, UseGuards} from '@nestjs/common';
import {ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ApiKeyGuard} from '../../guards/api-key.guard';
import {PredictionParamDto} from './dto/prediction.param.dto';
import {GlobalPredictionDto, SitePredictionDto} from './dto/predictions.dto';
import {PredictionsService} from './predictions.service';
import {PrismaService} from '../../prisma/prisma.service';
import {getTodayDate} from '../../common/utils/utils';
import {ErrorDto} from '../../common/dto/error.dto';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionsController {
    constructor(
        private readonly predictionsService: PredictionsService,
        private readonly prismaService: PrismaService,
    ) {}

    @Get('today')
    @ApiResponse({status: 200, type: GlobalPredictionDto})
    findToday(): Promise<GlobalPredictionDto> {
        return this.predictionsService.getByDate(getTodayDate());
    }

    @Get('today/:siteId')
    @ApiParam({name: 'siteId', example: '0Y6D', description: 'Unique site identifier'})
    @ApiResponse({status: 200, type: SitePredictionDto})
    @ApiResponse({
        status: 404,
        type: ErrorDto,
        example: {statusCode: 404, error: 'site_not_found', message: 'Site 0Y6D not found'},
    })
    async findTodayBySite(@Param('siteId') siteId: string): Promise<SitePredictionDto> {
        const site = await this.prismaService.site.findUnique({where: {id: siteId}});
        if (!site) {
            throw new NotFoundException({
                statusCode: 404,
                error: 'site_not_found',
                message: `Site ${siteId} not found`,
            });
        }
        return this.predictionsService.getByDateAndSite(getTodayDate(), siteId);
    }

    @Get(':date')
    @ApiParam({name: 'date', example: '2025-06-25', description: 'Date in YYYY-MM-DD format'})
    @ApiResponse({status: 200, type: GlobalPredictionDto})
    @ApiResponse({
        status: 400,
        type: ErrorDto,
        example: {
            statusCode: 400,
            error: 'invalid_date',
            message: 'Date must be in the past.',
        },
    })
    findByDate(@Param() params: PredictionParamDto): Promise<GlobalPredictionDto> {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date!)) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_date',
                message: 'Date must be in YYYY-MM-DD format.',
            });
        }
        if (params.date! >= getTodayDate()) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_date',
                message: 'Date must be in the past.',
            });
        }
        return this.predictionsService.getByDate(params.date!);
    }

    @Get(':date/:siteId')
    @ApiParam({name: 'date', example: '2025-06-25', description: 'Date in YYYY-MM-DD format'})
    @ApiParam({name: 'siteId', example: '0Y6D', description: 'Unique site identifier'})
    @ApiResponse({status: 200, type: SitePredictionDto})
    @ApiResponse({
        status: 404,
        type: ErrorDto,
        example: {
            statusCode: 404,
            error: 'site_not_found',
            message: 'Site 0Y6D not found',
        },
    })
    @ApiResponse({
        status: 400,
        type: ErrorDto,
        example: {
            statusCode: 400,
            error: 'invalid_date',
            message: 'Date must be in YYYY-MM-DD format.',
        },
    })
    async findByDateAndSite(@Param() params: PredictionParamDto): Promise<SitePredictionDto> {
        const site = await this.prismaService.site.findUnique({where: {id: params.siteId}});
        if (!site) {
            throw new NotFoundException({
                statusCode: 404,
                error: 'site_not_found',
                message: `Site ${params.siteId!} not found`,
            });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date!)) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_date',
                message: 'Date must be in YYYY-MM-DD format.',
            });
        }
        if (params.date! >= getTodayDate()) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_date',
                message: 'Date must be in the past.',
            });
        }
        return this.predictionsService.getByDateAndSite(params.date!, params.siteId!);
    }

    @Post(':date')
    @UseGuards(ApiKeyGuard)
    @ApiParam({name: 'date', example: '2025-06-25', description: 'Date in YYYY-MM-DD format'})
    @ApiResponse({
        status: 400,
        type: ErrorDto,
        example: {
            statusCode: 400,
            error: 'invalid_date',
            message: 'Date must be in YYYY-MM-DD format.',
        },
    })
    insertPredictionByDate(@Param() params: PredictionParamDto): Promise<{success: boolean; message: string}> {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date!)) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_date',
                message: 'Date must be in YYYY-MM-DD format.',
            });
        }
        if (params.date! >= getTodayDate()) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_date',
                message: 'Date must be in the past.',
            });
        }
        return this.predictionsService.addPredictionByDate(params.date!);
    }
}
