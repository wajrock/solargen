import {Controller, Get, NotFoundException, UseGuards} from '@nestjs/common';
import {ModelInfoService} from './model-info.service';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {ModelInfoDto} from './dto/model-info.dto';
import {ApiKeyGuard} from '../../guards/api-key.guard';

@ApiTags('model-info')
@Controller('model-info')
export class ModelInfoController {
    constructor(private readonly modelInfoService: ModelInfoService) {}

    @Get()
    @UseGuards(ApiKeyGuard)
    @ApiResponse({status: 200, type: [ModelInfoDto]})
    async findModel(): Promise<ModelInfoDto> {
        const modelInfos = await this.modelInfoService.getModelInfos();
        if (!modelInfos) {
            throw new NotFoundException('Model informations not found');
        }
        return modelInfos;
    }
}
