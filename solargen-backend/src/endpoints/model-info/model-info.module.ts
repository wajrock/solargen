import {Module} from '@nestjs/common';
import {ModelInfoService} from './model-info.service';
import {ModelInfoController} from './model-info.controller';

@Module({
    providers: [ModelInfoService],
    controllers: [ModelInfoController],
})
export class ModelInfoModule {}
