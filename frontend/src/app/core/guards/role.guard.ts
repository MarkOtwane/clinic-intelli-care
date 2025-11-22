import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { map, take } from 'rxjs/operators';

export const RoleGuard = (allowedRoles: UserRole[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && allowedRoles.includes(user.role)) {
        return true;
      } else {
        // Redirect to appropriate dashboard based on user role or login
        if (user) {
          // User is authenticated but doesn't have permission
          switch (user.role) {
            case UserRole.PATIENT:
              router.navigate(['/patient']);
              break;
            case UserRole.DOCTOR:
              router.navigate(['/doctor']);
              break;
            case UserRole.ADMIN:
              router.navigate(['/admin']);
              break;
            default:
              router.navigate(['/dashboard']);
          }
        } else {
          router.navigate(['/auth/login']);
        }
        return false;
      }
    })
  );
};