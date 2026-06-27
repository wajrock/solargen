import {Controller, Get, NotFoundException} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {InstallationDto} from './dto/installation.dto';
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
}
