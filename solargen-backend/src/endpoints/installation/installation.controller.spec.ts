import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {InstallationController} from './installation.controller';
import {InstallationService} from './installation.service';
import {InstallationDto} from './dto/installation.dto';

const mockInstallation: InstallationDto = {
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

const mockInstallationService = {
    getInstallationInfos: jest.fn().mockResolvedValue(mockInstallation),
};

describe('InstallationController', () => {
    let controller: InstallationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InstallationController],
            providers: [{provide: InstallationService, useValue: mockInstallationService}],
        }).compile();

        controller = module.get<InstallationController>(InstallationController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findInstallation', () => {
        it('should return installation info', async () => {
            const result = await controller.findInstallation();
            expect(result).toEqual(mockInstallation);
            expect(mockInstallationService.getInstallationInfos).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when installation not found', async () => {
            mockInstallationService.getInstallationInfos.mockResolvedValueOnce(null);
            await expect(controller.findInstallation()).rejects.toThrow(NotFoundException);
        });
    });
});
