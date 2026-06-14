import {ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {ApiKeyGuard} from './api-key.guard';

describe('ApiKeyGuard', () => {
    let guard: ApiKeyGuard;

    beforeEach(() => {
        guard = new ApiKeyGuard();
        process.env.BACKEND_API_KEY = 'test-api-key';
    });

    const mockContext = (apiKey?: string): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {'x-api-key': apiKey},
                }),
            }),
        }) as unknown as ExecutionContext;

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true with a valid API key', () => {
        expect(guard.canActivate(mockContext('test-api-key'))).toBe(true);
    });

    it('should throw UnauthorizedException when API key is missing', () => {
        expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when API key is invalid', () => {
        expect(() => guard.canActivate(mockContext('wrong-key'))).toThrow(UnauthorizedException);
    });
});
