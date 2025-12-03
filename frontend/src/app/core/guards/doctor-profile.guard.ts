import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { DoctorsService } from '../services/doctors.service';

@Injectable({ providedIn: 'root' })
export class DoctorProfileGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private doctors: DoctorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const current = this.auth.getCurrentUser();

    const ensureAndCheck = (user: any) => {
      if (!user || !user.id) {
        // Not authenticated properly; redirect to login
        void this.router.navigate(['/auth/login']);
        return of(false);
      }

      return this.doctors.getDoctorProfile(user.id).pipe(
        map(() => true),
        catchError((err) => {
          // If backend responds that doctor profile missing, redirect to settings
          try {
            const body = err && err.error ? err.error : err;
            const msg = typeof body === 'string' ? body : body?.message;
            const lower = String(msg || '').toLowerCase();
            if (
              lower.includes('doctor profile not found') ||
              lower.includes('doctor profile')
            ) {
              this.snackBar.open(
                'Doctor profile missing — redirecting to Settings...',
                undefined,
                { duration: 2000 }
              );
              void this.router.navigate(['/settings']);
              return of(false);
            }
          } catch {
            // fall through to generic handling
          }

          this.snackBar.open('Unable to verify doctor profile', 'Close', {
            duration: 4000,
          });
          // Redirect to doctor dashboard as a safe fallback
          void this.router.navigate(['/doctor/dashboard']);
          return of(false);
        })
      );
    };

    if (current) {
      return ensureAndCheck(current);
    }

    // If no in-memory user, try fetching from backend then check
    return this.auth.fetchMe().pipe(
      switchMap((user) => ensureAndCheck(user)),
      catchError(() => {
        void this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
