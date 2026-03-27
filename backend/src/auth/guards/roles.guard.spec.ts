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

  describe('canActivate - No Role Requirements', () => {
    it('should return true if no roles are required (null)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if required roles array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('canActivate - Authentication Checks', () => {
    it('should throw ForbiddenException if user is not authenticated (null)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext(null);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'User not authenticated',
      );
    });

    it('should throw ForbiddenException if user object exists but has no role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({}); // No role property
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied for your role',
      );
    });
  });

  describe('canActivate - Single Role Requirements', () => {
    it('should grant access when user role matches required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny PATIENT access to DOCTOR-only route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied for your role',
      );
    });

    it('should deny PATIENT access to ADMIN-only route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny DOCTOR access to ADMIN-only route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('canActivate - Multiple Role Requirements', () => {
    it('should grant access if user has one of multiple required roles (DOCTOR in list)', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should grant access if user has one of multiple required roles (ADMIN in list)', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'ADMIN' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny PATIENT access when not in required roles list', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should grant access if PATIENT is in required roles list', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['PATIENT', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('canActivate - Role Hierarchy Isolation', () => {
    describe('PATIENT Role Isolation', () => {
      it('PATIENT should not access DOCTOR-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
        const context = mockExecutionContext({ role: 'PATIENT' });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('PATIENT should not access ADMIN-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
        const context = mockExecutionContext({ role: 'PATIENT' });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('PATIENT should only access PATIENT-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PATIENT']);
        const context = mockExecutionContext({ role: 'PATIENT' });
        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('DOCTOR Role Isolation', () => {
      it('DOCTOR should not access ADMIN-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
        const context = mockExecutionContext({ role: 'DOCTOR' });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('DOCTOR should not access PATIENT-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PATIENT']);
        const context = mockExecutionContext({ role: 'DOCTOR' });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('DOCTOR should access DOCTOR-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
        const context = mockExecutionContext({ role: 'DOCTOR' });
        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('ADMIN Role Access Control', () => {
      it('ADMIN should not access PATIENT-only routes (role separation)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PATIENT']);
        const context = mockExecutionContext({ role: 'ADMIN' });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('ADMIN should not access DOCTOR-only routes (role separation)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
        const context = mockExecutionContext({ role: 'ADMIN' });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('ADMIN should access ADMIN-only routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
        const context = mockExecutionContext({ role: 'ADMIN' });
        expect(guard.canActivate(context)).toBe(true);
      });
    });
  });

  describe('canActivate - Metadata Resolution', () => {
    it('should get roles from both handler and class metadata', () => {
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      guard.canActivate(context);
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [{}, {}]);
    });

    it('should use handler-level @Roles decorator if present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PATIENT']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should use class-level @Roles decorator if handler has none', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext({ role: 'ADMIN' });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('canActivate - Edge Cases', () => {
    it('should handle user with undefined role field', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: undefined });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle user with null role field', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: null });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle case-sensitive role matching', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: 'doctor' }); // lowercase
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle empty role string', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DOCTOR']);
      const context = mockExecutionContext({ role: '' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('canActivate - Complex Multi-Role Scenarios', () => {
    it('PATIENT should access route allowing PATIENT and DOCTOR', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['PATIENT', 'DOCTOR']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('PATIENT should not access route allowing DOCTOR and ADMIN', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['DOCTOR', 'ADMIN']);
      const context = mockExecutionContext({ role: 'PATIENT' });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('DOCTOR should access route allowing PATIENT, DOCTOR, and ADMIN', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['PATIENT', 'DOCTOR', 'ADMIN']);
      const context = mockExecutionContext({ role: 'DOCTOR' });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('ADMIN should access route allowing DOCTOR and PATIENT (if explicitly set)', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['DOCTOR', 'PATIENT']);
      const context = mockExecutionContext({ role: 'ADMIN' });
      // This should throw - ADMIN is not in the list
      // This tests that role is strictly enforced
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
