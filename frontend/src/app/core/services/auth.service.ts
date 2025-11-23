import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

interface LoginResponse {
  accessToken: string;
  user: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: {
    email: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('accessToken', response.accessToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  signup(dto: { email: string; password: string; role?: string }) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/signup`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('accessToken', response.accessToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  /**
   * Calls backend refresh endpoint which reads httpOnly refresh cookie and
   * returns a new access token + user. Ensure `withCredentials` so cookie is sent.
   */
  refresh(): Observable<{ accessToken: string; user: any }> {
    return this.http
      .post<{ accessToken: string; user: any }>(
        `${this.apiUrl}/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
          this.currentUserSubject.next(res.user);
        })
      );
  }

  logout(): void {
    // notify backend to clear refresh cookie, include credentials so cookie present
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          localStorage.removeItem('accessToken');
          this.currentUserSubject.next(null);
        },
        error: () => {
          // still clear local state even if backend fails
          localStorage.removeItem('accessToken');
          this.currentUserSubject.next(null);
        },
      });
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /** Fetch current user from backend (uses Authorization header via interceptor) */
  fetchMe(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
