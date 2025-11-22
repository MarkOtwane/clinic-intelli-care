import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
  styleUrls: ['./app.component.css']
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private loadUnreadNotifications(): void {
    if (this.currentUser) {
      this.notificationService.getUnreadCount(this.currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((count: number) => {
          this.unreadNotifications = count;
        });
    }
  }
}
