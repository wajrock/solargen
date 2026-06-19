import {BadRequestException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {PredictionsController} from './predictions.controller';
import {PredictionsService} from './predictions.service';

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

const mockPredictionsService = {
    getByDate: jest.fn().mockResolvedValue(mockGlobalPrediction),
    getByDateAndSite: jest.fn().mockResolvedValue(mockSitePrediction),
    addPredictionByDate: jest.fn().mockResolvedValue({success: true, message: 'Predictions for 2025-06-14 inserted'}),
};

describe('PredictionsController', () => {
    let controller: PredictionsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PredictionsController],
            providers: [{provide: PredictionsService, useValue: mockPredictionsService}],
        }).compile();

        controller = module.get<PredictionsController>(PredictionsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findToday', () => {
        it('should return global prediction for today', async () => {
            const result = await controller.findToday();
            expect(result).toEqual(mockGlobalPrediction);
            expect(mockPredictionsService.getByDate).toHaveBeenCalledTimes(1);
        });
    });

    describe('findTodayBySite', () => {
        it('should return site prediction for today', async () => {
            const result = await controller.findTodayBySite('SITE01');
            expect(result).toEqual(mockSitePrediction);
            expect(mockPredictionsService.getByDateAndSite).toHaveBeenCalledWith(expect.any(String), 'SITE01');
        });
    });

    describe('findByDate', () => {
        it('should return global prediction for a past date', async () => {
            const result = await controller.findByDate({date: '2024-01-01'});
            expect(result).toEqual(mockGlobalPrediction);
            expect(mockPredictionsService.getByDate).toHaveBeenCalledWith('2024-01-01');
        });

        it('should throw BadRequestException for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await expect(controller.findByDate({date: today})).rejects.toThrow(BadRequestException);
        });
    });

    describe('findByDateAndSite', () => {
        it('should return site prediction for a past date', async () => {
            const result = await controller.findByDateAndSite({date: '2024-01-01', siteId: 'SITE01'});
            expect(result).toEqual(mockSitePrediction);
            expect(mockPredictionsService.getByDateAndSite).toHaveBeenCalledWith('2024-01-01', 'SITE01');
        });

        it('should throw BadRequestException for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await expect(controller.findByDateAndSite({date: today, siteId: 'SITE01'})).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('insertPredictionByDate', () => {
        it('should insert predictions for a past date', async () => {
            const result = await controller.insertPredictionByDate({date: '2024-01-01'});
            expect(result.success).toBe(true);
            expect(mockPredictionsService.addPredictionByDate).toHaveBeenCalledWith('2024-01-01');
        });

        it('should throw BadRequestException for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await expect(controller.insertPredictionByDate({date: today})).rejects.toThrow(BadRequestException);
        });
    });
});
