import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {InstallationDto, SiteDto} from '../../types/installation.types';

@Injectable()
export class InstallationService {
    constructor(private readonly prismaService: PrismaService) {}

    async getInstallationInfos(): Promise<InstallationDto | null> {
        const result = await this.prismaService.installation.findFirst({
            select: {name: true, latitude: true, longitude: true},
        });

        if (!result) return null;

        return result;
    }

    async getSites(): Promise<SiteDto[]> {
        return await this.prismaService.site.findMany();
    }

    async getSite(siteId: string): Promise<SiteDto | null> {
        return await this.prismaService.site.findUnique({where: {id: siteId}});
    }
}
