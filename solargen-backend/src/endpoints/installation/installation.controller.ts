import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
import {InstallationDto, SiteDto} from '../../types/installation.types';
import {InstallationService} from './installation.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('installation')
@Controller('installation')
export class InstallationController {
    constructor(private readonly installationService: InstallationService) {}

    @Get()
    async findInstallation(): Promise<InstallationDto> {
        const installationInfos = await this.installationService.getInstallationInfos();

        if (!installationInfos) {
            throw new NotFoundException('Installation not found');
        }
        return installationInfos;
    }

    @Get('sites')
    async findAllSites(): Promise<SiteDto[]> {
        return await this.installationService.getSites();
    }

    @Get('sites/:siteId')
    async findSite(@Param('siteId') siteId: string): Promise<SiteDto> {
        const siteInfos = await this.installationService.getSite(siteId);

        if (!siteInfos) {
            throw new NotFoundException('Site not found');
        }
        return siteInfos;
    }
}
