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
});
