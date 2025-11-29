import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const redirectToLogin = () => router.parseUrl('/auth/login');

  return authService.currentUser$.pipe(
    take(1),
    switchMap((user) => {
      if (user) {
        return of(true);
      }

      if (!authService.getToken()) {
        return of(redirectToLogin());
      }

      return authService.fetchMe().pipe(
        map(() => true),
        catchError(() => of(redirectToLogin()))
      );
    })
  );
};
