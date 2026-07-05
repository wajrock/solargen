import {Test, TestingModule} from '@nestjs/testing';
import {ModelInfoService} from './model-info.service';
import {PrismaService} from '../../prisma/prisma.service';

const mockRawModelInfo = {
    model: 'LightGBM',
    r2: 0.887,
    mae: 0.064,
    train_start: '2020-01-08',
    train_end: '2022-04-23',
    features: ['temperature', 'relative_humidity', 'shortwave_radiation'],
    sites_count: 21,
};

const mockPrismaService = {
    modelInfo: {
        findFirst: jest.fn(),
    },
};

describe('ModelInfoService', () => {
    let service: ModelInfoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ModelInfoService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<ModelInfoService>(ModelInfoService);
        jest.clearAllMocks();
    });

    describe('getModelInfo', () => {
        it('should return model info with the correct select fields', async () => {
            mockPrismaService.modelInfo.findFirst.mockResolvedValue(mockRawModelInfo);

            const result = await service.getModelInfo();

            expect(result).toEqual(mockRawModelInfo);
            expect(mockPrismaService.modelInfo.findFirst).toHaveBeenCalledWith({
                select: {
                    model: true,
                    r2: true,
                    mae: true,
                    train_start: true,
                    train_end: true,
                    features: true,
                    sites_count: true,
                },
            });
        });

        it('should return null when no model info exists in the database', async () => {
            mockPrismaService.modelInfo.findFirst.mockResolvedValue(null);

            const result = await service.getModelInfo();

            expect(result).toBeNull();
        });
    });
});
