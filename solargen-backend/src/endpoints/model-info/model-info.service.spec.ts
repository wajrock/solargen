import {Test, TestingModule} from '@nestjs/testing';
import {ModelInfoService} from './model-info.service';
import {PrismaService} from '../../prisma/prisma.service';
import {ModelInfoDto} from './dto/model-info.dto';

const mockModelInfo: ModelInfoDto = {
    model: 'GradientBoosting',
    r2: 0.867,
    mae: 0.0209,
    train_start: '2020-01-08',
    train_end: '2021-12-22',
    features: ['temperature', 'relative_humidity', 'shortwave_radiation'],
    sites_count: 21,
};

const mockPrismaService = {
    modelInfo: {
        findFirst: jest.fn().mockResolvedValue(mockModelInfo),
    },
};

describe('ModelInfoService', () => {
    let service: ModelInfoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ModelInfoService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<ModelInfoService>(ModelInfoService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getModelInfos', () => {
        it('should return model info', async () => {
            const result = await service.getModelInfos();
            expect(result).toEqual(mockModelInfo);
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

        it('should return null when no model info found', async () => {
            mockPrismaService.modelInfo.findFirst.mockResolvedValueOnce(null);
            const result = await service.getModelInfos();
            expect(result).toBeNull();
        });
    });
});
