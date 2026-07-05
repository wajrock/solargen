import {BadRequestException, NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {PredictionsController} from './predictions.controller';
import {PredictionsService} from './predictions.service';
import {PrismaService} from '../../prisma/prisma.service';

const mockGlobalPrediction = {
    date: '2026-07-01',
    daily: {solar_generation: 2920.68, capacity_factor: 0.138},
    monthly_avg: {solar_generation: 2750.4, capacity_factor: 0.129},
    peak: {timestamp: '2026-07-01T13:00:00', solar_generation: 565.23},
    hourly: [
        {
            timestamp: '2026-07-01T13:00:00',
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
    date: '2026-07-01',
    fetched_at: '2026-07-01T01:02:34',
    prediction_count: 504,
    weather_count: 24,
    is_complete: true,
};

const mockSite = {id: '0Y6D', kwp: 94.24};

const mockPredictionsService = {
    getByDate: jest.fn().mockResolvedValue(mockGlobalPrediction),
    getByDateAndSite: jest.fn().mockResolvedValue(mockSitePrediction),
    addPredictionByDate: jest.fn().mockResolvedValue({success: true, message: 'Predictions for 2026-07-01 inserted'}),
    getLastPredictionStatus: jest.fn().mockResolvedValue(mockPredictionStatus),
};

const mockPrismaService = {
    site: {
        findUnique: jest.fn().mockResolvedValue(mockSite),
    },
};

describe('PredictionsController', () => {
    let controller: PredictionsController;

    beforeEach(async () => {
        mockPrismaService.site.findUnique.mockResolvedValue(mockSite);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PredictionsController],
            providers: [
                {provide: PredictionsService, useValue: mockPredictionsService},
                {provide: PrismaService, useValue: mockPrismaService},
            ],
        }).compile();

        controller = module.get<PredictionsController>(PredictionsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('lastPredictionStatus', () => {
        it('should return the last prediction status', async () => {
            const result = await controller.lastPredictionStatus();
            expect(result).toEqual(mockPredictionStatus);
        });

        it('should throw NotFoundException when no status found', async () => {
            mockPredictionsService.getLastPredictionStatus.mockResolvedValueOnce(null);
            await expect(controller.lastPredictionStatus()).rejects.toThrow(NotFoundException);
        });
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
            const result = await controller.findTodayBySite('0Y6D');
            expect(result).toEqual(mockSitePrediction);
            expect(mockPredictionsService.getByDateAndSite).toHaveBeenCalledWith(expect.any(String), '0Y6D');
        });

        it('should throw NotFoundException when site does not exist', async () => {
            mockPrismaService.site.findUnique.mockResolvedValueOnce(null);
            await expect(controller.findTodayBySite('UNKNOWN')).rejects.toThrow(NotFoundException);
        });

        it('should validate date before checking the site', async () => {
            await expect(controller.findByDateAndSite({date: 'invalid', siteId: 'UNKNOWN'})).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('findByDate', () => {
        it('should return global prediction for a past date', async () => {
            const result = await controller.findByDate({date: '2024-01-01'});
            expect(result).toEqual(mockGlobalPrediction);
            expect(mockPredictionsService.getByDate).toHaveBeenCalledWith('2024-01-01');
        });

        it('should throw BadRequestException for invalid date format', () => {
            expect(() => controller.findByDate({date: 'invalid'})).toThrow(BadRequestException);
        });

        it('should throw BadRequestException for today or future date', () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            expect(() => controller.findByDate({date: today})).toThrow(BadRequestException);
        });
    });

    describe('findByDateAndSite', () => {
        it('should return site prediction for a past date', async () => {
            const result = await controller.findByDateAndSite({date: '2024-01-01', siteId: '0Y6D'});
            expect(result).toEqual(mockSitePrediction);
            expect(mockPredictionsService.getByDateAndSite).toHaveBeenCalledWith('2024-01-01', '0Y6D');
        });

        it('should throw NotFoundException when site does not exist', async () => {
            mockPrismaService.site.findUnique.mockResolvedValueOnce(null);
            await expect(controller.findByDateAndSite({date: '2024-01-01', siteId: 'UNKNOWN'})).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw BadRequestException for invalid date format', async () => {
            await expect(controller.findByDateAndSite({date: 'invalid', siteId: '0Y6D'})).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException for today or future date', async () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            await expect(controller.findByDateAndSite({date: today, siteId: '0Y6D'})).rejects.toThrow(
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

        it('should throw BadRequestException for invalid date format', () => {
            expect(() => controller.insertPredictionByDate({date: 'invalid'})).toThrow(BadRequestException);
        });

        it('should throw BadRequestException for today or future date', () => {
            const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Australia/Melbourne'});
            expect(() => controller.insertPredictionByDate({date: today})).toThrow(BadRequestException);
        });
    });
});
