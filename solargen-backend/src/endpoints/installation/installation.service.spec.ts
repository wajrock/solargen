import {Test, TestingModule} from '@nestjs/testing';
import {InstallationService} from './installation.service';
import {PrismaService} from '../../prisma/prisma.service';
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

const mockPrismaService = {
    installation: {
        findFirst: jest.fn().mockResolvedValue(mockInstallation),
    },
    site: {
        findMany: jest.fn().mockResolvedValue(mockSites),
        findUnique: jest.fn().mockResolvedValue(mockSites[0]),
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
        it('should return installation info', async () => {
            const result = await service.getInstallationInfos();
            expect(result).toEqual(mockInstallation);
            expect(mockPrismaService.installation.findFirst).toHaveBeenCalledWith({
                select: {name: true, latitude: true, longitude: true},
            });
        });

        it('should return null when no installation found', async () => {
            mockPrismaService.installation.findFirst.mockResolvedValueOnce(null);
            const result = await service.getInstallationInfos();
            expect(result).toBeNull();
        });
    });

    describe('getSites', () => {
        it('should return all sites', async () => {
            const result = await service.getSites();
            expect(result).toEqual(mockSites);
            expect(mockPrismaService.site.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    kwp: true,
                    panel_count: true,
                    panel_model: true,
                    inverter_model: true,
                },
            });
        });

        it('should return empty array when no sites found', async () => {
            mockPrismaService.site.findMany.mockResolvedValueOnce([]);
            const result = await service.getSites();
            expect(result).toEqual([]);
        });
    });

    describe('getSite', () => {
        it('should return a site by id', async () => {
            const result = await service.getSite('SITE01');
            expect(result).toEqual(mockSites[0]);
            expect(mockPrismaService.site.findUnique).toHaveBeenCalledWith({
                where: {id: 'SITE01'},
                select: {
                    id: true,
                    kwp: true,
                    panel_count: true,
                    panel_model: true,
                    inverter_model: true,
                },
            });
        });

        it('should return null when site not found', async () => {
            mockPrismaService.site.findUnique.mockResolvedValueOnce(null);
            const result = await service.getSite('UNKNOWN');
            expect(result).toBeNull();
        });
    });
});
