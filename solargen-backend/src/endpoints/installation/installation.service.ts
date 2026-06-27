import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {InstallationDto} from './dto/installation.dto';
import {InverterDto} from './dto/sites.dto';

@Injectable()
export class InstallationService {
    constructor(private readonly prismaService: PrismaService) {}

    async getInstallationInfos(): Promise<InstallationDto | null> {
        const [installation, capacityFactorPerSite] = await Promise.all([
            this.prismaService.installation.findFirst({
                include: {
                    sites: {
                        select: {id: true, kwp: true, panel_model: true, inverters: true},
                    },
                },
            }),
            this.prismaService.prediction.groupBy({
                by: ['site_id'],
                where: {capacity_factor: {gt: 0}},
                _avg: {capacity_factor: true},
            }),
        ]);

        if (!installation) return null;

        const avgCapacityFactorBySiteId = new Map(
            capacityFactorPerSite.map((entry) => [entry.site_id, entry._avg.capacity_factor ?? 0]),
        );

        const totalCapacity = installation.sites.reduce((sum, site) => sum + site.kwp, 0);

        return {
            name: installation.name,
            latitude: installation.latitude,
            longitude: installation.longitude,
            total_capacity: totalCapacity,
            sites: installation.sites.map((site) => ({
                id: site.id,
                kwp: site.kwp,
                panel_model: site.panel_model,
                inverters: site.inverters as unknown as InverterDto[],
                avg_capacity_factor: parseFloat((avgCapacityFactorBySiteId.get(site.id) ?? 0).toFixed(3)),
            })),
        };
    }
}
