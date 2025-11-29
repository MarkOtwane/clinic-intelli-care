import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const allowedRoles = route.data['roles'] as UserRole[];

    return this.authService.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        if (user && allowedRoles && allowedRoles.includes(user.role)) {
          return of(true);
        }

        if (!user && this.authService.getToken()) {
          return this.authService.fetchMe().pipe(
            map((freshUser) => {
              if (freshUser && allowedRoles?.includes(freshUser.role)) {
                return true;
              }
              return this.redirectForUser(freshUser);
            }),
            catchError(() => of(this.router.parseUrl('/auth/login')))
          );
        }

        return of(this.redirectForUser(user));
      })
    );
  }

  private redirectForUser(user: any | null): boolean | UrlTree {
    if (!user) {
      return this.router.parseUrl('/auth/login');
    }

    switch (user.role) {
      case UserRole.PATIENT:
        return this.router.parseUrl('/patient/dashboard');
      case UserRole.DOCTOR:
        return this.router.parseUrl('/doctor/dashboard');
      case UserRole.ADMIN:
        return this.router.parseUrl('/admin');
      default:
        return this.router.parseUrl('/dashboard');
    }
  }
}
