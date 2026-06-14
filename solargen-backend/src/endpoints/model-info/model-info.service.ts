import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ModelInfoDto} from '../../types/model-info.types';

@Injectable()
export class ModelInfoService {
    constructor(private readonly prismaService: PrismaService) {}

    async getModelInfos(): Promise<ModelInfoDto | null> {
        const result = await this.prismaService.modelInfo.findFirst();

        if (!result) return null;

        return {
            ...result,
            features: result.features as object,
            hyperparams: result.hyperparams as object,
        };
    }
}
