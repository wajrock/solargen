import {BadGatewayException, INestApplication, InternalServerErrorException, ValidationPipe} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import request from 'supertest';
import {AppModule} from '../src/app.module';
import {PredictionsService} from '../src/endpoints/predictions/predictions.service';
import {InstallationService} from '../src/endpoints/installation/installation.service';
import {ModelInfoService} from '../src/endpoints/model-info/model-info.service';
import {HistoryService} from '../src/endpoints/history/history.service';
import {WeatherService} from '../src/endpoints/weather/weather.service';
import {PrismaService} from '../src/prisma/prisma.service';
import {Server} from 'node:http';

const API_KEY = process.env.BACKEND_API_KEY!;

const mockGlobalPrediction = {
    date: '2026-06-15',
    daily: {solar_generation: 2920.68, capacity_factor: 0.138},
    monthly_avg: {solar_generation: 2750.4, capacity_factor: 0.129},
    peak: {timestamp: '2026-06-15T13:00:00', solar_generation: 565.23},
    hourly: [
        {
            timestamp: '2026-06-15T13:00:00',
            production: {
                solar_generation: 565.23,
                capacity_factor: 0.268,
                monthly_avg: {solar_generation: 520.1, capacity_factor: 0.2},
            },
            weather: {
                temperature: 14.9,
                relative_humidity: 72,
                cloud_cover: 88,
                shortwave_radiation: 281,
                diffuse_radiation: 172,
            },
        },
    ],
};

const mockSitePrediction = {
    ...mockGlobalPrediction,
    site_id: '0Y6D',
};

const mockPredictionStatus = {
    date: '2026-06-15',
    fetched_at: '2026-06-15T01:02:34',
    prediction_count: 504,
    weather_count: 24,
    is_complete: true,
};

const mockInstallation = {
    name: 'Bundoora',
    latitude: -37.71828652,
    longitude: 145.0509752,
    total_capacity: 1842,
    sites: [
        {
            id: '0Y6D',
            kwp: 94.24,
            panel_model: 'Trina 310W',
            inverters: [{model: 'SolarEdge SE82.8K', quantity: 1}],
            avg_capacity_factor: 0.2807,
        },
    ],
};

const mockModelInfo = {
    model: 'LightGBM',
    r2: 0.887,
    mae: 0.064,
    train_start: '2020-01-08',
    train_end: '2022-04-23',
    features: ['temperature', 'shortwave_radiation'],
    sites_count: 21,
};

const mockGlobalHistory = {
    month: '06',
    current_year: {
        year: 2026,
        monthly: {solar_generation: 87456.32, capacity_factor: 0.138},
        daily: [{date: '2026-06-01', solar_generation: 2920.68, capacity_factor: 0.138}],
    },
    previous_year: {
        year: 2025,
        monthly: {solar_generation: 78234.12, capacity_factor: 0.124},
        daily: [{date: '2025-06-01', solar_generation: 2650.32, capacity_factor: 0.126}],
    },
};

const mockSiteHistory = {
    ...mockGlobalHistory,
    site_id: '0Y6D',
};

describe('AppModule (e2e)', () => {
    let app: INestApplication;
    let server: Server;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({
                site: {
                    findUnique: jest.fn().mockResolvedValue({id: '0Y6D', kwp: 94.24}),
                },
            })
            .overrideProvider(PredictionsService)
            .useValue({
                getByDate: jest.fn().mockResolvedValue(mockGlobalPrediction),
                getByDateAndSite: jest.fn().mockResolvedValue(mockSitePrediction),
                getLastPredictionStatus: jest.fn().mockResolvedValue(mockPredictionStatus),
                addPredictions: jest.fn().mockResolvedValue({success: true, message: 'inserted'}),
            })
            .overrideProvider(InstallationService)
            .useValue({
                getInstallationInfos: jest.fn().mockResolvedValue(mockInstallation),
            })
            .overrideProvider(ModelInfoService)
            .useValue({
                getModelInfo: jest.fn().mockResolvedValue(mockModelInfo),
            })
            .overrideProvider(HistoryService)
            .useValue({
                getByMonth: jest.fn().mockResolvedValue(mockGlobalHistory),
                getByMonthAndSite: jest.fn().mockResolvedValue(mockSiteHistory),
            })
            .overrideProvider(WeatherService)
            .useValue({
                getByDate: jest.fn().mockResolvedValue(mockGlobalPrediction.hourly.map((h) => h.weather)),
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

    afterEach(() => {
        jest.clearAllMocks();
        const predictionsService = app.get(PredictionsService);
        (predictionsService.addPredictions as jest.Mock).mockResolvedValue({success: true, message: 'inserted'});
    });

    describe('/predictions', () => {
        it('GET /predictions/status → 200', async () => {
            await request(server).get('/predictions/status').expect(200).expect(mockPredictionStatus);
        });

        it('GET /predictions/today → 200', async () => {
            await request(server).get('/predictions/today').expect(200).expect(mockGlobalPrediction);
        });

        it('GET /predictions/today/:siteId → 200', async () => {
            await request(server).get('/predictions/today/0Y6D').expect(200).expect(mockSitePrediction);
        });

        it('GET /predictions/:date → 200', async () => {
            await request(server).get('/predictions/2024-01-01').expect(200).expect(mockGlobalPrediction);
        });

        it('GET /predictions/:date → 400 for invalid date format', async () => {
            await request(server).get('/predictions/invalid-date').expect(400);
        });

        it('GET /predictions/:date → 400 for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await request(server).get(`/predictions/${today}`).expect(400);
        });

        it('GET /predictions/:date/:siteId → 200', async () => {
            await request(server).get('/predictions/2024-01-01/0Y6D').expect(200).expect(mockSitePrediction);
        });

        it('POST /predictions/today → 401 without API key', async () => {
            await request(server).post('/predictions/today').expect(401);
        });

        it('POST /predictions/today → 201 with valid API key', async () => {
            await request(server)
                .post('/predictions/today')
                .set('x-api-key', API_KEY)
                .expect(201)
                .expect({success: true, message: 'inserted'});
        });

        it('POST /predictions/today → 502 when the FastAPI request fails', async () => {
            const predictionsService = app.get(PredictionsService);
            (predictionsService.addPredictions as jest.Mock).mockRejectedValueOnce(
                new BadGatewayException({
                    statusCode: 502,
                    error: 'fastapi_fetch_failed',
                    message: 'Failed to fetch predictions for 2026-07-10 from solargen-model.',
                }),
            );

            const response = await request(server).post('/predictions/today').set('x-api-key', API_KEY).expect(502);

            expect((response.body as {error: string}).error).toBe('fastapi_fetch_failed');
        });

        it('POST /predictions/today → 500 when inserted data is incomplete', async () => {
            const predictionsService = app.get(PredictionsService);
            (predictionsService.addPredictions as jest.Mock).mockRejectedValueOnce(
                new InternalServerErrorException({
                    statusCode: 500,
                    error: 'incomplete_predictions_data',
                    message: 'Incomplete data for 2026-07-10.',
                }),
            );

            const response = await request(server).post('/predictions/today').set('x-api-key', API_KEY).expect(500);

            expect((response.body as {error: string}).error).toBe('incomplete_predictions_data');
        });

        it('POST /predictions/:date → 401 without API key', async () => {
            await request(server).post('/predictions/2024-01-01').expect(401);
        });

        it('POST /predictions/:date → 201 with valid API key', async () => {
            await request(server)
                .post('/predictions/2024-01-01')
                .set('x-api-key', API_KEY)
                .expect(201)
                .expect({success: true, message: 'inserted'});
        });

        it('POST /predictions/:date → 400 for invalid date format', async () => {
            await request(server).post('/predictions/invalid-date').set('x-api-key', API_KEY).expect(400);
        });

        it('POST /predictions/:date → 400 for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await request(server).post(`/predictions/${today}`).set('x-api-key', API_KEY).expect(400);
        });

        it('POST /predictions/:date → 502 when the FastAPI request fails', async () => {
            const predictionsService = app.get(PredictionsService);
            (predictionsService.addPredictions as jest.Mock).mockRejectedValueOnce(
                new BadGatewayException({
                    statusCode: 502,
                    error: 'fastapi_fetch_failed',
                    message: 'Failed to fetch predictions for 2024-01-01 from solargen-model.',
                }),
            );

            const response = await request(server)
                .post('/predictions/2024-01-01')
                .set('x-api-key', API_KEY)
                .expect(502);

            expect((response.body as {error: string}).error).toBe('fastapi_fetch_failed');
        });

        it('POST /predictions/:date → 500 when inserted data is incomplete', async () => {
            const predictionsService = app.get(PredictionsService);
            (predictionsService.addPredictions as jest.Mock).mockRejectedValueOnce(
                new InternalServerErrorException({
                    statusCode: 500,
                    error: 'incomplete_predictions_data',
                    message: 'Incomplete data for 2024-01-01.',
                }),
            );

            const response = await request(server)
                .post('/predictions/2024-01-01')
                .set('x-api-key', API_KEY)
                .expect(500);

            expect((response.body as {error: string}).error).toBe('incomplete_predictions_data');
        });
    });

    describe('/installation', () => {
        it('GET /installation → 200', async () => {
            await request(server).get('/installation').expect(200).expect(mockInstallation);
        });

        it('GET /installation → 404 when not found', async () => {
            const service = app.get(InstallationService);
            jest.spyOn(service, 'getInstallationInfos').mockResolvedValueOnce(null);

            await request(server).get('/installation').expect(404);
        });
    });

    describe('/model-info', () => {
        it('GET /model-info → 200', async () => {
            await request(server).get('/model-info').expect(200).expect(mockModelInfo);
        });

        it('GET /model-info → 404 when not found', async () => {
            const service = app.get(ModelInfoService);
            jest.spyOn(service, 'getModelInfo').mockResolvedValueOnce(null);

            await request(server).get('/model-info').expect(404);
        });
    });

    describe('/history', () => {
        it('GET /history/:month → 200', async () => {
            await request(server).get('/history/06').expect(200).expect(mockGlobalHistory);
        });

        it('GET /history/:month → 400 for invalid month format', async () => {
            await request(server).get('/history/13').expect(400);
        });

        it('GET /history/:month/:siteId → 200', async () => {
            await request(server).get('/history/06/0Y6D').expect(200).expect(mockSiteHistory);
        });

        it('GET /history/:month/:siteId → 404 when site not found', async () => {
            const prisma = app.get(PrismaService);
            jest.spyOn(prisma.site, 'findUnique').mockResolvedValueOnce(null);

            await request(server).get('/history/06/UNKNOWN').expect(404);
        });
    });
});
