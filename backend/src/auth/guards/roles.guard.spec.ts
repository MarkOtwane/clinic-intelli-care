import { ForbiddenException, INestExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY, UserRole } from '../roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (
    user: any,
    requiredRoles: UserRole[] = [],
  ): INestExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as INestExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if required roles array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if user role matches required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if user has one of multiple required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user has no role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({});
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext(null);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user role does not match required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user role is not in required roles list', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should get roles from both handler and class', () => {
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      guard.canActivate(context);
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [{}, {}]);
    });
  });
});
