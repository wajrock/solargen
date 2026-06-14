import {Module} from '@nestjs/common';
import {WeatherModule} from '../weather/weather.module';
import {PredictionsController} from './predictions.controller';
import {PredictionsService} from './predictions.service';

@Module({
    imports: [WeatherModule],
    providers: [PredictionsService],
    controllers: [PredictionsController],
})
export class PredictionsModule {}
