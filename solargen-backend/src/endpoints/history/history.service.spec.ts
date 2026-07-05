/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Test, TestingModule} from '@nestjs/testing';
import {HistoryService} from './history.service';
import {PrismaService} from '../../prisma/prisma.service';
import {getTodayDate} from '../../common/utils/utils';

const mockPrismaService = {
    prediction: {
        groupBy: jest.fn(),
    },
};

describe('HistoryService', () => {
    let service: HistoryService;
    const currentYear = Number(getTodayDate().slice(0, 4));
    const previousYear = currentYear - 1;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HistoryService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
        jest.clearAllMocks();
    });

    describe('getByMonth', () => {
        it('aggregates hourly predictions into daily and monthly totals', async () => {
            mockPrismaService.prediction.groupBy
                .mockResolvedValueOnce([
                    {timestamp: '2026-06-01T12:00:00', _sum: {solar_generation: 200}, _avg: {capacity_factor: 0.2}},
                    {timestamp: '2026-06-01T13:00:00', _sum: {solar_generation: 300}, _avg: {capacity_factor: 0.3}},
                    {timestamp: '2026-06-02T12:00:00', _sum: {solar_generation: 150}, _avg: {capacity_factor: 0.15}},
                ])
                .mockResolvedValueOnce([
                    {timestamp: '2025-06-01T12:00:00', _sum: {solar_generation: 180}, _avg: {capacity_factor: 0.18}},
                ]);

            const result = await service.getByMonth('06');

            expect(result.current_year.daily).toEqual([
                {date: '2026-06-01', solar_generation: 500, capacity_factor: 0.25},
                {date: '2026-06-02', solar_generation: 150, capacity_factor: 0.15},
            ]);
            expect(result.current_year.monthly).toEqual({solar_generation: 650, capacity_factor: 0.2});
            expect(result.previous_year.daily).toEqual([
                {date: '2025-06-01', solar_generation: 180, capacity_factor: 0.18},
            ]);
        });

        it('averages capacity_factor across multiple hours of the same day, not just sums it', async () => {
            mockPrismaService.prediction.groupBy
                .mockResolvedValueOnce([
                    {timestamp: '2026-06-01T10:00:00', _sum: {solar_generation: 100}, _avg: {capacity_factor: 0.4}},
                    {timestamp: '2026-06-01T11:00:00', _sum: {solar_generation: 100}, _avg: {capacity_factor: 0.2}},
                ])
                .mockResolvedValueOnce([]);

            const result = await service.getByMonth('06');

            expect(result.current_year.daily[0].capacity_factor).toBe(0.3);
        });

        it('handles null solar_generation and capacity_factor from Prisma aggregation', async () => {
            mockPrismaService.prediction.groupBy
                .mockResolvedValueOnce([
                    {timestamp: '2026-06-01T00:00:00', _sum: {solar_generation: null}, _avg: {capacity_factor: null}},
                ])
                .mockResolvedValueOnce([]);

            const result = await service.getByMonth('06');

            expect(result.current_year.daily[0]).toEqual({
                date: '2026-06-01',
                solar_generation: 0,
                capacity_factor: 0,
            });
        });

        it('returns month as string in the response', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);
            const result = await service.getByMonth('03');
            expect(result.month).toBe('03');
        });

        it('returns zeroed monthly data when no predictions exist for the month', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

            const result = await service.getByMonth('06');

            expect(result.current_year).toEqual({
                year: currentYear,
                monthly: {solar_generation: 0, capacity_factor: 0},
                daily: [],
            });
            expect(result.previous_year).toEqual({
                year: previousYear,
                monthly: {solar_generation: 0, capacity_factor: 0},
                daily: [],
            });
        });
    });

    describe('getByMonthAndSite', () => {
        it('filters predictions by site_id', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);

            await service.getByMonthAndSite('06', '0Y6D');

            expect(mockPrismaService.prediction.groupBy).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({site_id: '0Y6D'}),
                }),
            );
        });

        it('includes site_id in the response', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);
            const result = await service.getByMonthAndSite('06', '0Y6D');
            expect(result.site_id).toBe('0Y6D');
        });

        it('does not filter by site_id when calling getByMonth', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);

            await service.getByMonth('06');

            expect(mockPrismaService.prediction.groupBy).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.not.objectContaining({site_id: expect.anything()}),
                }),
            );
        });
    });
});
