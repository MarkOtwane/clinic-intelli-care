import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles = route.data['roles'] as UserRole[];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && allowedRoles && allowedRoles.includes(user.role)) {
          return true;
        } else {
          // Redirect to appropriate dashboard based on user role or login
          if (user) {
            // User is authenticated but doesn't have permission
            switch (user.role) {
              case UserRole.PATIENT:
                this.router.navigate(['/patient']);
                break;
              case UserRole.DOCTOR:
                this.router.navigate(['/doctor']);
                break;
              case UserRole.ADMIN:
                this.router.navigate(['/admin']);
                break;
              default:
                this.router.navigate(['/dashboard']);
            }
          } else {
            this.router.navigate(['/auth/login']);
          }
          return false;
        }
      })
    );
  }
}