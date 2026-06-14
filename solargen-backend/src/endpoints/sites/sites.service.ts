import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {SiteDto} from '../../types/site.types';

@Injectable()
export class SitesService {
    constructor(private readonly prismaService: PrismaService) {}

    getAll(): Promise<SiteDto[]> {
        return this.prismaService.site.findMany();
    }

    getOne(id: string): Promise<SiteDto | null> {
        return this.prismaService.site.findUnique({where: {id}});
    }
}
