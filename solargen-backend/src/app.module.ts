import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ScheduleModule} from '@nestjs/schedule';
import {AppController} from './app.controller';
import {InstallationModule} from './endpoints/installation/installation.module';
import {ModelInfoModule} from './endpoints/model-info/model-info.module';
import {PredictionsModule} from './endpoints/predictions/predictions.module';
import {WeatherModule} from './endpoints/weather/weather.module';
import {PrismaModule} from './prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        PrismaModule,
        ModelInfoModule,
        PredictionsModule,
        WeatherModule,
        InstallationModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
