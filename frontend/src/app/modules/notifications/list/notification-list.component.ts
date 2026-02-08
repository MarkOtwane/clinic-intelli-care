import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { Notification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
  ],
  template: `
    <div class="notifications-container">
      <h1>Notifications</h1>
      <p class="subtitle">Stay updated with your health reminders and alerts</p>

      <mat-card>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let notification of notifications">
              <mat-icon matListItemIcon>notifications</mat-icon>
              <div matListItemTitle>{{ notification.title }}</div>
              <div matListItemLine>{{ notification.message }}</div>
              <div matListItemMeta>
                {{ notification.createdAt | date: 'short' }}
              </div>
            </mat-list-item>

            <mat-list-item *ngIf="notifications.length === 0">
              <div matListItemTitle>No notifications</div>
              <div matListItemLine>You're all caught up!</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        color: #333;
        margin-bottom: 8px;
      }

      .subtitle {
        color: #666;
        margin-bottom: 32px;
      }

      mat-list-item {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications;
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
      },
    });
  }
}
