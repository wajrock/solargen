import {Controller, Get, NotFoundException} from '@nestjs/common';
import {ModelInfoDto} from '../../types/model-info.types';
import {ModelInfoService} from './model-info.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('model-info')
@Controller('model-info')
export class ModelInfoController {
    constructor(private readonly modelInfoService: ModelInfoService) {}

    @Get()
    async findModel(): Promise<ModelInfoDto> {
        const modelInfos = await this.modelInfoService.getModelInfos();
        if (!modelInfos) {
            throw new NotFoundException('Model informations not found');
        }
        return modelInfos;
    }
}
