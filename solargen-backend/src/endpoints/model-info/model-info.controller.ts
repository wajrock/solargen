import {Controller, Get, NotFoundException} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {ModelInfoDto} from './dto/model-info.dto';
import {ModelInfoService} from './model-info.service';

@ApiTags('model-info')
@Controller('model-info')
export class ModelInfoController {
    constructor(private readonly modelInfoService: ModelInfoService) {}

    @Get()
    @ApiResponse({status: 200, type: [ModelInfoDto]})
    async findModel(): Promise<ModelInfoDto> {
        const modelInfos = await this.modelInfoService.getModelInfos();
        if (!modelInfos) {
            throw new NotFoundException('Model informations not found');
        }
        return modelInfos;
    }
}
