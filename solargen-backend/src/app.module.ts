import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PrismaModule} from './prisma/prisma.module';
import {SitesModule} from './endpoints/sites/sites.module';
import {ConfigModule} from '@nestjs/config';
import {ModelInfoModule} from './endpoints/model-info/model-info.module';
import {PredictionsModule} from './endpoints/predictions/predictions.module';
import {WeatherModule} from './endpoints/weather/weather.module';
import {ScheduleModule} from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        PrismaModule,
        SitesModule,
        ModelInfoModule,
        PredictionsModule,
        WeatherModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
