import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { interval, Observable, Subject } from 'rxjs';
import {
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    LayoutModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <div class="sidenav-header">
          <div class="logo-container">
            <mat-icon class="logo-icon">local_hospital</mat-icon>
            <span class="logo-text">Clinic IntelliCare</span>
          </div>
        </div>

        <mat-nav-list>
          <!-- Dashboard Link (Dynamic based on role) -->
          <a
            mat-list-item
            routerLink="/dashboard"
            routerLinkActive="active-link"
            (click)="closeDrawerOnMobile()"
          >
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <!-- Patient Links -->
          <ng-container *ngIf="currentUser?.role === 'PATIENT'">
            <a
              mat-list-item
              routerLink="/patient/analysis"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>health_and_safety</mat-icon>
              <span matListItemTitle>AI Symptom Analysis</span>
            </a>
            <a
              mat-list-item
              routerLink="/appointments"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Appointments</span>
            </a>
            <a
              mat-list-item
              routerLink="/doctor/prescriptions"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>medication</mat-icon>
              <span matListItemTitle>Prescriptions</span>
            </a>
            <a
              mat-list-item
              routerLink="/blogs"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>article</mat-icon>
              <span matListItemTitle>Health Articles</span>
            </a>
          </ng-container>

          <!-- Doctor Links -->
          <ng-container *ngIf="currentUser?.role === 'DOCTOR'">
            <a
              mat-list-item
              routerLink="/doctor/patients"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>folder_shared</mat-icon>
              <span matListItemTitle>Patient Cases</span>
            </a>
            <a
              mat-list-item
              routerLink="/doctor/appointments"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Schedule</span>
            </a>
            <a
              mat-list-item
              routerLink="/doctor/blog"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>edit_note</mat-icon>
              <span matListItemTitle>My Blogs</span>
            </a>
            <a
              mat-list-item
              routerLink="/prescriptions"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>medication</mat-icon>
              <span matListItemTitle>Prescriptions</span>
            </a>
          </ng-container>

          <!-- Admin Links -->
          <ng-container *ngIf="currentUser?.role === 'ADMIN'">
            <a
              mat-list-item
              routerLink="/admin/users"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Manage Users</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/doctors"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>local_hospital</mat-icon>
              <span matListItemTitle>Manage Doctors</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/patients"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Manage Patients</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/analytics"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>analytics</mat-icon>
              <span matListItemTitle>Analytics</span>
            </a>
            <a
              mat-list-item
              routerLink="/admin/reports"
              routerLinkActive="active-link"
              (click)="closeDrawerOnMobile()"
            >
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Reports</span>
            </a>
          </ng-container>

          <mat-divider></mat-divider>

          <a
            mat-list-item
            routerLink="/settings"
            routerLinkActive="active-link"
            (click)="closeDrawerOnMobile()"
          >
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info-mini">
            <div class="user-avatar-mini">
              {{ currentUser?.firstName?.charAt(0) || 'U' }}
            </div>
            <div class="user-details-mini">
              <span class="user-name-mini"
                >{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span
              >
              <span class="user-role-mini">{{
                currentUser?.role | titlecase
              }}</span>
            </div>
          </div>
          <button mat-icon-button (click)="logout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="main-toolbar">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <span class="toolbar-title">{{ getPageTitle() }}</span>

          <span class="spacer"></span>

          <!-- Desktop Header Actions -->
          <div class="header-actions">
            <button
              mat-icon-button
              class="notification-btn"
              aria-label="Notifications"
              [matMenuTriggerFor]="notificationMenu"
            >
              <mat-icon
                [matBadge]="unreadCount"
                [matBadgeHidden]="unreadCount === 0"
                matBadgeColor="warn"
                matBadgeSize="small"
                >notifications</mat-icon
              >
            </button>

            <button
              mat-icon-button
              [matMenuTriggerFor]="userMenu"
              class="profile-btn"
            >
              <div class="avatar-circle">
                {{ currentUser?.firstName?.charAt(0) || 'U' }}
              </div>
            </button>
          </div>

          <!-- Notification Menu -->
          <mat-menu #notificationMenu="matMenu" class="notification-menu">
            <div class="notification-header" (click)="$event.stopPropagation()">
              <h3>Notifications</h3>
              <button
                mat-button
                color="primary"
                (click)="markAllAsRead()"
                *ngIf="unreadCount > 0"
              >
                Mark all read
              </button>
            </div>
            <mat-divider></mat-divider>
            <div class="notification-list" *ngIf="notifications.length > 0">
              <button
                mat-menu-item
                *ngFor="let notification of notifications.slice(0, 5)"
                [class.unread]="!notification.isRead"
                (click)="handleNotificationClick(notification)"
              >
                <mat-icon [color]="getNotificationIconColor(notification)">{{
                  getNotificationIcon(notification)
                }}</mat-icon>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">
                    {{ notification.message }}
                  </div>
                  <div class="notification-time">
                    {{ getTimeAgo(notification.createdAt) }}
                  </div>
                </div>
              </button>
            </div>
            <div
              class="notification-empty"
              *ngIf="notifications.length === 0"
              (click)="$event.stopPropagation()"
            >
              <mat-icon>notifications_none</mat-icon>
              <p>No notifications</p>
            </div>
            <mat-divider *ngIf="notifications.length > 0"></mat-divider>
            <button
              mat-menu-item
              routerLink="/notifications"
              *ngIf="notifications.length > 0"
            >
              <mat-icon>view_list</mat-icon>
              View All Notifications
            </button>
          </mat-menu>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
        background-color: var(--gray-50, #f9fafb);
      }

      .sidenav {
        width: 260px;
        box-shadow: 1px 0 0 rgba(0, 0, 0, 0.05); /* Subtle border */
        border: none;
        background: white;

        .mat-drawer-inner-container {
          display: flex;
          flex-direction: column;
        }
      }

      .sidenav-header {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        border-bottom: 1px solid var(--gray-200, #e5e7eb);
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--primary-600, #4a7aff);

        .logo-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        .logo-text {
          font-weight: 700;
          font-size: 18px;
          color: var(--gray-900, #111827);
          letter-spacing: -0.02em;
        }
      }

      .mat-nav-list {
        flex: 1;
        padding-top: 16px;
      }

      .mat-divider {
        margin: 8px 16px;
      }

      /* Active Link Styles */
      ::ng-deep .mat-mdc-list-item.active-link {
        --mdc-list-list-item-label-text-color: var(--primary-700, #3e69f0);
        --mdc-list-list-item-leading-icon-color: var(--primary-700, #3e69f0);
        background: var(--primary-50, #f0f8ff);
        border-right: 3px solid var(--primary-600, #4a7aff);
      }

      ::ng-deep .mat-mdc-list-item {
        margin: 4px 8px;
        border-radius: 8px;

        &:hover:not(.active-link) {
          background-color: var(--gray-100, #f3f4f6);
        }
      }

      .main-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid var(--gray-200, #e5e7eb);
        color: var(--gray-800, #1f2937);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Minimal shadow */
      }

      .spacer {
        flex: 1 1 auto;
      }

      .content-wrapper {
        padding: 24px;
        max-width: 1600px;
        margin: 0 auto;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .avatar-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--primary-100, #e1f0ff);
        color: var(--primary-700, #3e69f0);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }

      .sidenav-footer {
        padding: 16px;
        border-top: 1px solid var(--gray-200, #e5e7eb);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--gray-50, #f9fafb);
      }

      .user-info-mini {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-avatar-mini {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--primary-600, #4a7aff);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
      }

      .user-details-mini {
        display: flex;
        flex-direction: column;

        .user-name-mini {
          font-weight: 600;
          font-size: 14px;
          color: var(--gray-900, #111827);
        }

        .user-role-mini {
          font-size: 12px;
          color: var(--gray-500, #6b7280);
        }
      }

      @media (max-width: 600px) {
        .content-wrapper {
          padding: 16px;
        }
      }

      ::ng-deep .notification-menu {
        max-width: 400px;
        min-width: 350px;
      }

      .notification-header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .notification-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .notification-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .notification-list button {
        height: auto !important;
        padding: 12px 16px;
        white-space: normal;
        line-height: 1.4;
      }

      .notification-list button.unread {
        background-color: rgba(63, 81, 181, 0.05);
      }

      .notification-content {
        flex: 1;
        margin-left: 12px;
        text-align: left;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .notification-message {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      }

      .notification-time {
        font-size: 12px;
        color: #999;
      }

      .notification-empty {
        padding: 32px;
        text-align: center;
        color: #999;
      }

      .notification-empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
      }

      .notification-empty p {
        margin: 0;
      }
    `,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  @ViewChild('drawer') drawer!: MatSidenav;

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  currentUser: User | null = null;
  notifications: any[] = [];
  unreadCount = 0;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadNotifications();
        this.startNotificationPolling();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications() {
    if (!this.currentUser?.id) return;

    this.notificationService.findByUser(this.currentUser.id).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter((n: any) => !n.isRead).length;
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
      },
    });
  }

  private startNotificationPolling() {
    // Poll for new notifications every 30 seconds
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (!this.currentUser?.id) return [];
          return this.notificationService.findByUser(this.currentUser.id);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadCount = notifications.filter((n: any) => !n.isRead).length;
        },
        error: (error) => {
          console.error('Notification polling error:', error);
        },
      });
  }

  handleNotificationClick(notification: any) {
    // Mark as read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
      });
    }

    // Navigate to related page if applicable
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  markAllAsRead() {
    if (!this.currentUser?.id) return;

    // Mark all notifications as read locally
    this.notifications.forEach((n) => {
      if (!n.isRead) {
        this.notificationService.markAsRead(n.id).subscribe();
      }
    });

    this.notifications = this.notifications.map((n) => ({
      ...n,
      isRead: true,
    }));
    this.unreadCount = 0;
  }

  getNotificationIcon(notification: any): string {
    const iconMap: any = {
      APPOINTMENT_REMINDER: 'event',
      APPOINTMENT_CONFIRMED: 'event_available',
      APPOINTMENT_CANCELLED: 'event_busy',
      APPOINTMENT_RESCHEDULED: 'update',
      AI_ANALYSIS_COMPLETE: 'psychology',
      NEW_PRESCRIPTION: 'medication',
      BLOG_POST_UPDATE: 'article',
      SYSTEM_ANNOUNCEMENT: 'campaign',
      EMERGENCY_ALERT: 'warning',
    };
    return iconMap[notification.type] || 'notifications';
  }

  getNotificationIconColor(notification: any): string {
    const colorMap: any = {
      APPOINTMENT_CONFIRMED: 'primary',
      APPOINTMENT_CANCELLED: 'warn',
      EMERGENCY_ALERT: 'warn',
      AI_ANALYSIS_COMPLETE: 'accent',
    };
    return colorMap[notification.type] || '';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  closeDrawerOnMobile() {
    this.isHandset$.subscribe((isHandset) => {
      if (isHandset) {
        this.drawer.close();
      }
    });
  }

  getPageTitle(): string {
    // Simple logic to get title from URL (can be improved with Route Data)
    const url = this.router.url.split('/')[1];
    if (!url) return 'Dashboard';
    return url.charAt(0).toUpperCase() + url.slice(1).replace('-', ' ');
  }
}
