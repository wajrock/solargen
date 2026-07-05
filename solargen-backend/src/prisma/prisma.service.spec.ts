import {PrismaService} from './prisma.service';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeEach(() => {
        process.env.DATABASE_URL_RUNTIME = 'mysql://test:test@localhost:3306/test';
        service = new PrismaService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('connects to the database on module init', async () => {
        const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);
        await service.onModuleInit();
        expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('disconnects from the database on module destroy', async () => {
        const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
        await service.onModuleDestroy();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('disconnects from the database before application shutdown', async () => {
        const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
        await service.beforeApplicationShutdown();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
});
