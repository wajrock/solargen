import {Module} from '@nestjs/common';
import {PrismaModule} from './prisma/prisma.module';
import {ConfigModule} from '@nestjs/config';
import {ModelInfoModule} from './endpoints/model-info/model-info.module';
import {PredictionsModule} from './endpoints/predictions/predictions.module';
import {WeatherModule} from './endpoints/weather/weather.module';
import {ScheduleModule} from '@nestjs/schedule';
import {InstallationModule} from './endpoints/installation/installation.module';

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
    providers: [],
})
export class AppModule {}
