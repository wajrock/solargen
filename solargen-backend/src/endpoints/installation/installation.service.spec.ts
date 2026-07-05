import {Test, TestingModule} from '@nestjs/testing';
import {InstallationService} from './installation.service';
import {PrismaService} from '../../prisma/prisma.service';

const mockPrismaService = {
    installation: {
        findFirst: jest.fn(),
    },
    prediction: {
        groupBy: jest.fn(),
    },
};

describe('InstallationService', () => {
    let service: InstallationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [InstallationService, {provide: PrismaService, useValue: mockPrismaService}],
        }).compile();

        service = module.get<InstallationService>(InstallationService);
        jest.clearAllMocks();
    });

    describe('getInstallationInfos', () => {
        it('returns null when no installation exists', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValue(null);
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);

            const result = await service.getInstallationInfos();

            expect(result).toBeNull();
        });

        it('sums kwp across all sites for total_capacity', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValue({
                name: 'Bundoora',
                latitude: -37.7,
                longitude: 145.0,
                sites: [
                    {id: 'A', kwp: 94.24, panel_model: 'Trina 310W', inverters: []},
                    {id: 'B', kwp: 58.9, panel_model: 'Trina 310W', inverters: []},
                ],
            });
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);

            const result = await service.getInstallationInfos();

            expect(result?.total_capacity).toBe(153.14);
        });

        it('maps avg_capacity_factor per site from groupBy results', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValue({
                name: 'Bundoora',
                latitude: -37.7,
                longitude: 145.0,
                sites: [{id: '0Y6D', kwp: 94.24, panel_model: 'Trina 310W', inverters: []}],
            });
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {site_id: '0Y6D', _avg: {capacity_factor: 0.2807}},
            ]);

            const result = await service.getInstallationInfos();

            expect(result?.sites[0].avg_capacity_factor).toBe(0.281);
        });

        it('defaults avg_capacity_factor to 0 when site has no predictions', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValue({
                name: 'Bundoora',
                latitude: -37.7,
                longitude: 145.0,
                sites: [{id: 'NEWSITE', kwp: 10, panel_model: 'Trina 310W', inverters: []}],
            });
            mockPrismaService.prediction.groupBy.mockResolvedValue([]);

            const result = await service.getInstallationInfos();

            expect(result?.sites[0].avg_capacity_factor).toBe(0);
        });

        it('correctly matches capacity factor to the right site when multiple sites exist', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValue({
                name: 'Bundoora',
                latitude: -37.7,
                longitude: 145.0,
                sites: [
                    {id: 'A', kwp: 10, panel_model: 'Trina 310W', inverters: []},
                    {id: 'B', kwp: 20, panel_model: 'Trina 310W', inverters: []},
                ],
            });
            mockPrismaService.prediction.groupBy.mockResolvedValue([
                {site_id: 'A', _avg: {capacity_factor: 0.1}},
                {site_id: 'B', _avg: {capacity_factor: 0.9}},
            ]);

            const result = await service.getInstallationInfos();

            expect(result?.sites.find((s) => s.id === 'A')?.avg_capacity_factor).toBe(0.1);
            expect(result?.sites.find((s) => s.id === 'B')?.avg_capacity_factor).toBe(0.9);
        });
    });
});
