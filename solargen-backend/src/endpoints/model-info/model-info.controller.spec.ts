import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {ModelInfoController} from './model-info.controller';
import {ModelInfoService} from './model-info.service';
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

const mockModelInfoService = {
    getModelInfos: jest.fn().mockResolvedValue(mockModelInfo),
};

describe('ModelInfoController', () => {
    let controller: ModelInfoController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ModelInfoController],
            providers: [{provide: ModelInfoService, useValue: mockModelInfoService}],
        }).compile();

        controller = module.get<ModelInfoController>(ModelInfoController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findModel', () => {
        it('should return model info', async () => {
            const result = await controller.findModel();
            expect(result).toEqual(mockModelInfo);
            expect(mockModelInfoService.getModelInfos).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when no model info found', async () => {
            mockModelInfoService.getModelInfos.mockResolvedValueOnce(null);
            await expect(controller.findModel()).rejects.toThrow(NotFoundException);
        });
    });
});
