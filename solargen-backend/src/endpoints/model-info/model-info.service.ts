import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {ModelInfoDto} from './dto/model-info.dto';

@Injectable()
export class ModelInfoService {
    constructor(private readonly prismaService: PrismaService) {}

    async getModelInfos(): Promise<ModelInfoDto | null> {
        const result = await this.prismaService.modelInfo.findFirst({
            select: {
                model: true,
                r2: true,
                mae: true,
                train_start: true,
                train_end: true,
                features: true,
                sites_count: true,
            },
        });

        if (!result) return null;

        return {
            ...result,
            features: result.features as object,
        };
    }
}
