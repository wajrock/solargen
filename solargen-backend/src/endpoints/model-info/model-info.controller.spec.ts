import {Test, TestingModule} from '@nestjs/testing';
import {ModelInfoController} from './model-info.controller';

describe('ModelInfoController', () => {
    let controller: ModelInfoController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ModelInfoController],
        }).compile();

        controller = module.get<ModelInfoController>(ModelInfoController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
