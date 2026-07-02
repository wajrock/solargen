import {Controller, Get, NotFoundException} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {InstallationDto} from './dto/installation.dto';
import {InstallationService} from './installation.service';
import {ErrorDto} from '../../common/dto/error.dto';

@ApiTags('installation')
@Controller('installation')
export class InstallationController {
    constructor(private readonly installationService: InstallationService) {}

    @Get()
    @ApiResponse({status: 200, type: InstallationDto})
    @ApiResponse({
        status: 404,
        type: ErrorDto,
        example: {statusCode: 404, error: 'installation_not_found', message: 'Installation not found'},
    })
    async findInstallation(): Promise<InstallationDto> {
        const installationInfos = await this.installationService.getInstallationInfos();

        if (!installationInfos) {
            throw new NotFoundException({
                statusCode: 404,
                error: 'installation_not_found',
                message: 'Installation not found',
            });
        }
        return installationInfos;
    }
}
