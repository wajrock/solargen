import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
import {SiteDto} from '../../types/site.types';
import {SitesService} from './sites.service';

@Controller('sites')
export class SitesController {
    constructor(private readonly sitesService: SitesService) {}

    @Get()
    async findAll(): Promise<SiteDto[]> {
        return this.sitesService.getAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<SiteDto> {
        const site = await this.sitesService.getOne(id);
        if (!site) {
            throw new NotFoundException(`Site ${id} not found.`);
        }
        return site;
    }
}
