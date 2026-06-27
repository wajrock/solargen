import {Test, TestingModule} from '@nestjs/testing';
import {InstallationService} from './installation.service';
import {PrismaService} from '../../prisma/prisma.service';

const mockPrismaInstallation = {
    name: 'Bundoora',
    latitude: -37.71828652,
    longitude: 145.0509752,
    sites: [
        {
            id: '0Y6D',
            kwp: 94.24,
            panel_model: 'Trina 310W',
            inverters: [{model: 'SolarEdge SE82.8K', quantity: 1}],
        },
    ],
};

const mockCapacityFactorPerSite = [{site_id: '0Y6D', _avg: {capacity_factor: 0.2807}}];

const mockPrismaService = {
    installation: {
        findFirst: jest.fn().mockResolvedValue(mockPrismaInstallation),
    },
    prediction: {
        groupBy: jest.fn().mockResolvedValue(mockCapacityFactorPerSite),
    },
};

describe('InstallationService', () => {
    let service: InstallationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [InstallationService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<InstallationService>(InstallationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getInstallationInfos', () => {
        it('should return installation info with computed fields', async () => {
            const result = await service.getInstallationInfos();
            expect(result).toEqual({
                name: 'Bundoora',
                latitude: -37.71828652,
                longitude: 145.0509752,
                total_capacity: 94.24,
                sites: [
                    {
                        id: '0Y6D',
                        kwp: 94.24,
                        panel_model: 'Trina 310W',
                        inverters: [{model: 'SolarEdge SE82.8K', quantity: 1}],
                        avg_capacity_factor: 0.2807,
                    },
                ],
            });
        });

        it('should return null when no installation found', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValueOnce(null);
            const result = await service.getInstallationInfos();
            expect(result).toBeNull();
        });

        it('should return 0 avg_capacity_factor when site has no predictions', async () => {
            mockPrismaService.prediction.groupBy.mockResolvedValueOnce([]);
            const result = await service.getInstallationInfos();
            expect(result?.sites[0].avg_capacity_factor).toBe(0);
        });
    });
});
