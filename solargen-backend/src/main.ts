import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('SolarGen Backend API')
        .setDescription(
            'REST API for the backend layer of the SolarGen project, providing solar power predictions and weather monitoring for the RMIT Bundoora Campus. ' +
                'It exposes endpoints to retrieve hourly predictions across 25 solar sites, historical weather data, site configuration, and ML model metadata.',
        )
        .setVersion('1.0.0')
        .addTag('model-info', 'ML model metadata and performance metrics')
        .addTag('installation', 'Installation and solar site configuration and metadata')
        .addTag('predictions', 'Hourly solar power predictions and weather data over 24 hours, by date and site')
        .addApiKey({type: 'apiKey', name: 'x-api-key', in: 'header'}, 'x-api-key')
        .addSecurityRequirements('x-api-key')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
