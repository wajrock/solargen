import {BadRequestException, Controller, Get, NotFoundException, Param} from '@nestjs/common';
import {ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {HistoryParamDto} from './dto/history.param.dto';
import {PrismaService} from '../../prisma/prisma.service';
import {getTodayDate} from '../../common/utils/utils';
import {GlobalHistoryDto, SiteHistoryDto} from './dto/history.dto';
import {HistoryService} from './history.service';
import {ErrorDto} from '../../common/dto/error.dto';

@ApiTags('history')
@Controller('history')
export class HistoryController {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly historyService: HistoryService,
    ) {}

    @Get(':month')
    @ApiParam({name: 'month', example: '02'})
    @ApiResponse({status: 200, type: GlobalHistoryDto})
    @ApiResponse({
        status: 404,
        type: ErrorDto,
        example: {statusCode: 404, error: 'invalid_month', message: 'Month must be in MM format (01-12).'},
    })
    findByMonth(@Param() params: HistoryParamDto): Promise<GlobalHistoryDto> {
        if (!/^(0[1-9]|1[0-2])$/.test(params.month!)) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_month',
                message: 'Month must be in MM format (01-12).',
            });
        }

        const currentMonth = new Date(getTodayDate()).getMonth() + 1;

        if (parseInt(params.month!) > currentMonth) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_month',
                message: 'Month must not be in the future.',
            });
        }

        return this.historyService.getByMonth(params.month!);
    }

    @Get(':month/:siteId')
    @ApiParam({name: 'month', example: '02'})
    @ApiParam({name: 'siteId', example: '0Y6D'})
    @ApiResponse({status: 200, type: SiteHistoryDto})
    async findByMonthAndSite(@Param() params: HistoryParamDto): Promise<SiteHistoryDto> {
        if (!/^(0[1-9]|1[0-2])$/.test(params.month!)) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_month',
                message: 'Month must be in MM format (01-12).',
            });
        }
        const currentMonth = new Date(getTodayDate()).getMonth() + 1;

        if (parseInt(params.month!) > currentMonth) {
            throw new BadRequestException({
                statusCode: 400,
                error: 'invalid_month',
                message: 'Month must not be in the future.',
            });
        }

        const site = await this.prismaService.site.findUnique({where: {id: params.siteId}});

        if (!site) {
            throw new NotFoundException({
                statusCode: 404,
                error: 'site_not_found',
                message: `Site ${params.siteId!} not found`,
            });
        }
        return this.historyService.getByMonthAndSite(params.month!, params.siteId!);
    }
}
