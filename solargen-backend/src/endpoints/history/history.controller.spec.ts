import {BadRequestException, NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {HistoryController} from './history.controller';
import {HistoryService} from './history.service';
import {PrismaService} from '../../prisma/prisma.service';

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

const mockSite = {id: '0Y6D', kwp: 94.24};

const mockHistoryService = {
    getByMonth: jest.fn().mockResolvedValue(mockGlobalHistory),
    getByMonthAndSite: jest.fn().mockResolvedValue(mockSiteHistory),
};

const mockPrismaService = {
    site: {
        findUnique: jest.fn().mockResolvedValue(mockSite),
    },
};

describe('HistoryController', () => {
    let controller: HistoryController;

    beforeEach(async () => {
        mockPrismaService.site.findUnique.mockResolvedValue(mockSite);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoryController],
            providers: [
                {provide: HistoryService, useValue: mockHistoryService},
                {provide: PrismaService, useValue: mockPrismaService},
            ],
        }).compile();

        controller = module.get<HistoryController>(HistoryController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findByMonth', () => {
        it('should return global history for a valid month', () => {
            const result = controller.findByMonth({month: '06'});
            expect(mockHistoryService.getByMonth).toHaveBeenCalledWith('06');
            return expect(result).resolves.toEqual(mockGlobalHistory);
        });

        it('should throw BadRequestException for invalid month format', () => {
            expect(() => controller.findByMonth({month: '13'})).toThrow(BadRequestException);
        });

        it('should throw BadRequestException for future month', () => {
            const futureMonth = String(new Date().getMonth() + 2).padStart(2, '0');
            expect(() => controller.findByMonth({month: futureMonth})).toThrow(BadRequestException);
        });
    });

    describe('findByMonthAndSite', () => {
        it('should return site history for a valid month and existing site', async () => {
            const result = await controller.findByMonthAndSite({month: '06', siteId: '0Y6D'});
            expect(result).toEqual(mockSiteHistory);
            expect(mockHistoryService.getByMonthAndSite).toHaveBeenCalledWith('06', '0Y6D');
        });

        it('should throw BadRequestException for invalid month format', async () => {
            await expect(controller.findByMonthAndSite({month: '13', siteId: '0Y6D'})).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw NotFoundException when site does not exist', async () => {
            mockPrismaService.site.findUnique.mockResolvedValueOnce(null);
            await expect(controller.findByMonthAndSite({month: '06', siteId: 'UNKNOWN'})).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should validate month before checking the site', async () => {
            await expect(controller.findByMonthAndSite({month: '13', siteId: 'UNKNOWN'})).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException for future month', async () => {
            const futureMonth = String(new Date().getMonth() + 2).padStart(2, '0');
            await expect(controller.findByMonthAndSite({month: futureMonth, siteId: '0Y6D'})).rejects.toThrow(
                BadRequestException,
            );
        });
    });
});
