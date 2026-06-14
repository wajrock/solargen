import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PrismaModule} from './prisma/prisma.module';
import {SitesModule} from './endpoints/sites/sites.module';
import {ConfigModule} from '@nestjs/config';
import {ModelInfoModule} from './endpoints/model-info/model-info.module';
import {PredictionsModule} from './endpoints/predictions/predictions.module';
import {WeatherModule} from './endpoints/weather/weather.module';

@Module({
    imports: [ConfigModule.forRoot({isGlobal: true}), PrismaModule, SitesModule, ModelInfoModule, PredictionsModule, WeatherModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
