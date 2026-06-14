import {NotFoundException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {InstallationController} from './installation.controller';
import {InstallationService} from './installation.service';
import {InstallationDto} from './dto/installation.dto';
import {SiteDto} from './dto/sites.dto';

const mockInstallation: InstallationDto = {
    name: 'Bundoora',
    latitude: -37.71828652,
    longitude: 145.0509752,
};

const mockSites: SiteDto[] = [
    {id: 'SITE01', kwp: 25.5, panel_count: 10, panel_model: 'JA Solar JAM72S30', inverter_model: 'Fronius Symo 15.0'},
    {id: 'SITE02', kwp: 18.0, panel_count: null, panel_model: null, inverter_model: null},
];

const mockInstallationService = {
    getInstallationInfos: jest.fn().mockResolvedValue(mockInstallation),
    getSites: jest.fn().mockResolvedValue(mockSites),
    getSite: jest.fn().mockResolvedValue(mockSites[0]),
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

    describe('findAllSites', () => {
        it('should return all sites', async () => {
            const result = await controller.findAllSites();
            expect(result).toEqual(mockSites);
            expect(mockInstallationService.getSites).toHaveBeenCalledTimes(1);
        });

        it('should return empty array when no sites found', async () => {
            mockInstallationService.getSites.mockResolvedValueOnce([]);
            const result = await controller.findAllSites();
            expect(result).toEqual([]);
        });
    });

    describe('findSite', () => {
        it('should return a site by id', async () => {
            const result = await controller.findSite('SITE01');
            expect(result).toEqual(mockSites[0]);
            expect(mockInstallationService.getSite).toHaveBeenCalledWith('SITE01');
        });

        it('should throw NotFoundException when site not found', async () => {
            mockInstallationService.getSite.mockResolvedValueOnce(null);
            await expect(controller.findSite('UNKNOWN')).rejects.toThrow(NotFoundException);
        });
    });
});
