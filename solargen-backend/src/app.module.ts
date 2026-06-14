import {Module} from '@nestjs/common';
import {PrismaModule} from './prisma/prisma.module';
import {ConfigModule} from '@nestjs/config';
import {ModelInfoModule} from './endpoints/model-info/model-info.module';
import {PredictionsModule} from './endpoints/predictions/predictions.module';
import {WeatherModule} from './endpoints/weather/weather.module';
import {ScheduleModule} from '@nestjs/schedule';
import {InstallationModule} from './endpoints/installation/installation.module';
import {ApiKeyGuard} from './guards/api-key.guard';
import {APP_GUARD} from '@nestjs/core';

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
    providers: [
        {
            provide: APP_GUARD,
            useClass: ApiKeyGuard,
        },
    ],
})
export class AppModule {}
