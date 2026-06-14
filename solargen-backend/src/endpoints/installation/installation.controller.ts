import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
import {ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {InstallationDto} from './dto/installation.dto';
import {SiteDto} from './dto/sites.dto';
import {InstallationService} from './installation.service';

@ApiTags('installation')
@Controller('installation')
export class InstallationController {
    constructor(private readonly installationService: InstallationService) {}

    @Get()
    @ApiResponse({status: 200, type: [InstallationDto]})
    async findInstallation(): Promise<InstallationDto> {
        const installationInfos = await this.installationService.getInstallationInfos();

        if (!installationInfos) {
            throw new NotFoundException('Installation not found');
        }
        return installationInfos;
    }

    @Get('sites')
    @ApiResponse({status: 200, type: [SiteDto]})
    async findAllSites(): Promise<SiteDto[]> {
        return await this.installationService.getSites();
    }

    @Get('sites/:siteId')
    @ApiParam({name: 'siteId', example: 'SITE01'})
    async findSite(@Param('siteId') siteId: string): Promise<SiteDto> {
        const siteInfos = await this.installationService.getSite(siteId);

        if (!siteInfos) {
            throw new NotFoundException('Site not found');
        }
        return siteInfos;
    }
}
