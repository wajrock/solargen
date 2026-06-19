import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import request from 'supertest';
import {AppModule} from '../src/app.module';
import {PredictionsService} from '../src/endpoints/predictions/predictions.service';
import {InstallationService} from '../src/endpoints/installation/installation.service';
import {ModelInfoService} from '../src/endpoints/model-info/model-info.service';
import {WeatherService} from '../src/endpoints/weather/weather.service';
import {PrismaService} from '../src/prisma/prisma.service';
import {Server} from 'node:http';

const API_KEY = 'test-api-key';

const mockGlobalPrediction = {
    production: [{timestamp: '2025-06-14T00:00:00', total_production_kw: 125.4}],
    weather: [
        {
            timestamp: '2025-06-14T00:00:00',
            temperature: 21.5,
            relative_humidity: 65,
            cloud_cover: 44,
            shortwave_radiation: 450.2,
            diffuse_radiation: 210,
        },
    ],
};

const mockSitePrediction = {
    production: [{site_id: 'SITE01', timestamp: '2025-06-14T00:00:00', capacity_factor: 0.8, solar_generation: 12.4}],
    weather: [
        {
            timestamp: '2025-06-14T00:00:00',
            temperature: 21.5,
            relative_humidity: 65,
            cloud_cover: 44,
            shortwave_radiation: 450.2,
            diffuse_radiation: 210,
        },
    ],
};

const mockInstallation = {
    name: 'Bundoora',
    latitude: -37.71828652,
    longitude: 145.0509752,
};

const mockSites = [
    {id: 'SITE01', kwp: 25.5, panel_count: 10, panel_model: 'JA Solar JAM72S30', inverter_model: 'Fronius Symo 15.0'},
    {id: 'SITE02', kwp: 18.0, panel_count: null, panel_model: null, inverter_model: null},
];

const mockModelInfo = {
    model: 'GradientBoosting',
    r2: 0.867,
    mae: 0.0209,
    train_start: '2020-01-08',
    train_end: '2021-12-22',
    features: ['temperature', 'relative_humidity'],
    sites_count: 21,
};

describe('AppModule (e2e)', () => {
    let app: INestApplication;
    let server: Server;

    beforeAll(async () => {
        process.env.BACKEND_API_KEY = API_KEY;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({})
            .overrideProvider(PredictionsService)
            .useValue({
                getByDate: jest.fn().mockResolvedValue(mockGlobalPrediction),
                getByDateAndSite: jest.fn().mockResolvedValue(mockSitePrediction),
                addTodayPredictions: jest.fn().mockResolvedValue({success: true, message: 'inserted'}),
                addPredictionByDate: jest.fn().mockResolvedValue({success: true, message: 'inserted'}),
            })
            .overrideProvider(InstallationService)
            .useValue({
                getInstallationInfos: jest.fn().mockResolvedValue(mockInstallation),
                getSites: jest.fn().mockResolvedValue(mockSites),
                getSite: jest.fn().mockResolvedValue(mockSites[0]),
            })
            .overrideProvider(ModelInfoService)
            .useValue({
                getModelInfos: jest.fn().mockResolvedValue(mockModelInfo),
            })
            .overrideProvider(WeatherService)
            .useValue({
                getByDate: jest.fn().mockResolvedValue(mockGlobalPrediction.weather),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        server = app.getHttpServer() as Server;
    }, 30000);

    afterAll(async () => {
        await app.close();
    }, 30000);

    describe('ApiKeyGuard', () => {
        it('should return 401 without API key', async () => {
            await request(server).get('/predictions/today').expect(401);
        });

        it('should return 401 with invalid API key', async () => {
            await request(server).get('/predictions/today').set('x-api-key', 'wrong-key').expect(401);
        });
    });

    describe('/predictions', () => {
        it('GET /predictions/today → 200', async () => {
            await request(server)
                .get('/predictions/today')
                .set('x-api-key', API_KEY)
                .expect(200)
                .expect(mockGlobalPrediction);
        });

        it('GET /predictions/today/:siteId → 200', async () => {
            await request(server)
                .get('/predictions/today/SITE01')
                .set('x-api-key', API_KEY)
                .expect(200)
                .expect(mockSitePrediction);
        });

        it('GET /predictions/past/:date → 200', async () => {
            await request(server)
                .get('/predictions/past/2024-01-01')
                .set('x-api-key', API_KEY)
                .expect(200)
                .expect(mockGlobalPrediction);
        });

        it('GET /predictions/past/:date → 400 for invalid date format', async () => {
            await request(server).get('/predictions/past/invalid-date').set('x-api-key', API_KEY).expect(400);
        });

        it('GET /predictions/past/:date → 400 for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await request(server).get(`/predictions/past/${today}`).set('x-api-key', API_KEY).expect(400);
        });

        it('GET /predictions/past/:date/:siteId → 200', async () => {
            await request(server)
                .get('/predictions/past/2024-01-01/SITE01')
                .set('x-api-key', API_KEY)
                .expect(200)
                .expect(mockSitePrediction);
        });
    });

    describe('/installation', () => {
        it('GET /installation → 200', async () => {
            await request(server).get('/installation').set('x-api-key', API_KEY).expect(200).expect(mockInstallation);
        });

        it('GET /installation/sites → 200', async () => {
            await request(server).get('/installation/sites').set('x-api-key', API_KEY).expect(200).expect(mockSites);
        });

        it('GET /installation/sites/:siteId → 200', async () => {
            await request(server)
                .get('/installation/sites/SITE01')
                .set('x-api-key', API_KEY)
                .expect(200)
                .expect(mockSites[0]);
        });

        it('GET /installation/sites/:siteId → 404 when not found', async () => {
            const module = app.get(InstallationService);
            jest.spyOn(module, 'getSite').mockResolvedValueOnce(null);

            await request(server).get('/installation/sites/UNKNOWN').set('x-api-key', API_KEY).expect(404);
        });
    });

    describe('/model-info', () => {
        it('GET /model-info → 200', async () => {
            await request(server).get('/model-info').set('x-api-key', API_KEY).expect(200).expect(mockModelInfo);
        });

        it('GET /model-info → 404 when not found', async () => {
            const module = app.get(ModelInfoService);
            jest.spyOn(module, 'getModelInfos').mockResolvedValueOnce(null);

            await request(server).get('/model-info').set('x-api-key', API_KEY).expect(404);
        });
    });
});
