import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class DoctorProfileGuard implements CanActivate {
  constructor(
    private auth: AuthService,
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

      // Check if user is a doctor
      if (user.role !== 'DOCTOR') {
        this.snackBar.open(
          'Only doctors can access this section',
          undefined,
          { duration: 4000 }
        );
        void this.router.navigate(['/']);
        return of(false);
      }

      return of(true);
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
