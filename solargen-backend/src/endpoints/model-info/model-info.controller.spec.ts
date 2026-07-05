import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {ModelInfoController} from './model-info.controller';
import {ModelInfoService} from './model-info.service';
import {ModelInfoDto} from './dto/model-info.dto';

const mockModelInfo: ModelInfoDto = {
    model: 'LightGBM',
    r2: 0.887,
    mae: 0.064,
    train_start: '2020-01-08',
    train_end: '2022-04-23',
    features: ['temperature', 'shortwave_radiation'],
    sites_count: 21,
};

const mockModelInfoService = {
    getModelInfo: jest.fn().mockResolvedValue(mockModelInfo),
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

    describe('findModel', () => {
        it('should return model info', async () => {
            const result = await controller.findModel();
            expect(result).toEqual(mockModelInfo);
        });

        it('should throw NotFoundException when model info not found', async () => {
            mockModelInfoService.getModelInfo.mockResolvedValueOnce(null);
            await expect(controller.findModel()).rejects.toThrow(NotFoundException);
        });
    });
});
