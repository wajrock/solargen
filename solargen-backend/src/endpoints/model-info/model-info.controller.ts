import {Controller, Get, NotFoundException} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {ModelInfoDto} from './dto/model-info.dto';
import {ModelInfoService} from './model-info.service';
import {ErrorDto} from '../../common/dto/error.dto';

@ApiTags('model-info')
@Controller('model-info')
export class ModelInfoController {
    constructor(private readonly modelInfoService: ModelInfoService) {}

    @Get()
    @ApiResponse({status: 200, type: ModelInfoDto})
    @ApiResponse({
        status: 404,
        type: ErrorDto,
        example: {statusCode: 404, error: 'model_not_found', message: 'Model information not found.'},
    })
    async findModel(): Promise<ModelInfoDto> {
        const modelInfo = await this.modelInfoService.getModelInfo();
        if (!modelInfo) {
            throw new NotFoundException({
                statusCode: 404,
                error: 'model_not_found',
                message: 'Model information not found.',
            });
        }
        return modelInfo;
    }
}
