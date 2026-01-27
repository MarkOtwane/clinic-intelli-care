import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

interface LoginResponse {
  accessToken: string;
  user: any;
  requirePasswordChange?: boolean;
}

interface SignupResponse {
  user: any;
  message: string;
}

interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  private persistSession(user: any, accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

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
          this.persistSession(response.user, response.accessToken);
        }),
      );
  }

  signup(dto: SignupRequest): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(`${this.apiUrl}/signup`, dto, {
        withCredentials: true,
      })
      .pipe(map((response) => response));
  }

  /**
   * Calls backend refresh endpoint which reads httpOnly refresh cookie and
   * returns a new access token + user. Ensure `withCredentials` so cookie is sent.
   */
  refresh(): Observable<{ accessToken: string; user: any }> {
    return this.http
      .post<{
        accessToken: string;
        user: any;
      }>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.persistSession(res.user, res.accessToken);
        }),
      );
  }

  logout(): void {
    // Clear local state immediately for instant UI feedback
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Notify backend to clear refresh cookie in background
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          // Backend logout successful
        },
        error: () => {
          // Backend logout failed, but local state is already cleared
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
      .pipe(
        tap((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
      );
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/change-password`,
      { currentPassword, newPassword },
      { withCredentials: true },
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
