import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const auth = this.injector.get(AuthService);

    const token = localStorage.getItem('accessToken');

    // Do not add auth header for refresh/login/signup/logout endpoints
    const skipAuth = /\/api\/auth\/(refresh|login|signup|logout)/.test(req.url);

    let authReq = req;
    if (token && !skipAuth) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: req.withCredentials ?? true,
      });
    } else {
      // ensure credentials are sent for auth endpoints to allow httpOnly cookies
      authReq = req.clone({ withCredentials: req.withCredentials ?? true });
    }

    return next.handle(authReq).pipe(
      catchError((err: any) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          !skipAuth
        ) {
          // attempt refresh once
          return auth.refresh().pipe(
            switchMap((res) => {
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` },
                withCredentials: req.withCredentials ?? true,
              });
              return next.handle(newReq);
            }),
            catchError((refreshErr) => {
              // Refresh failed (likely missing/expired refresh cookie). Clear session.
              auth.logout();
              return throwError(() => refreshErr);
            }),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
