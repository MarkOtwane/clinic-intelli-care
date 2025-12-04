import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

// Services
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

// Models
import { User } from './core/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    // Material modules
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Clinic IntelliCare';

  // Authentication state
  isAuthenticated = false;
  currentUser: User | null = null;
  unreadNotifications = 0;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;

        if (user) {
          this.loadUnreadNotifications();
        }
      });

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.authService.fetchMe().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToProfile(): void {
    if (!this.currentUser) return;

    // Navigate to role-specific profile page
    switch (this.currentUser.role) {
      case 'PATIENT':
        this.router.navigate(['/patient/profile']);
        break;
      case 'DOCTOR':
        this.router.navigate(['/doctor/profile']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/profile']);
        break;
      default:
        this.router.navigate(['/settings']);
    }
  }

  goToSettings(): void {
    if (!this.currentUser) return;

    // Navigate to role-specific settings page
    switch (this.currentUser.role) {
      case 'PATIENT':
        this.router.navigate(['/patient/settings']);
        break;
      case 'DOCTOR':
        this.router.navigate(['/doctor/settings']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/settings']);
        break;
      default:
        this.router.navigate(['/settings']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private loadUnreadNotifications(): void {
    if (this.currentUser) {
      this.notificationService
        .getUnreadCount(this.currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((count: number) => {
          this.unreadNotifications = count;
        });
    }
  }
}
