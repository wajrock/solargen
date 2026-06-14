import {Module} from '@nestjs/common';
import {InstallationService} from './installation.service';
import {InstallationController} from './installation.controller';

@Module({
    providers: [InstallationService],
    controllers: [InstallationController],
})
export class InstallationModule {}
