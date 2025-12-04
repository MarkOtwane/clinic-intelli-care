import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatListModule,
  ],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Administration</p>
          <h2>Admin Settings</h2>
          <p class="muted">Manage system-wide settings and configurations</p>
        </div>
      </header>

      <mat-card>
        <mat-card-header>
          <mat-card-title>System Notifications</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>User Activity Alerts</span>
              <span matListItemLine
                >Get alerts for unusual user activities</span
              >
              <mat-slide-toggle
                [checked]="activityAlerts"
                (change)="toggleActivityAlerts()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>System Health Notifications</span>
              <span matListItemLine
                >Receive system health and performance notifications</span
              >
              <mat-slide-toggle
                [checked]="healthNotifications"
                (change)="toggleHealthNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Security Alerts</span>
              <span matListItemLine
                >Get notified of potential security issues</span
              >
              <mat-slide-toggle
                [checked]="securityAlerts"
                (change)="toggleSecurityAlerts()"
              ></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>System Configuration</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Backup Settings</span>
              <span matListItemLine>Configure automatic database backups</span>
              <button mat-button color="primary">Configure</button>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Email Configuration</span>
              <span matListItemLine>Configure system-wide email settings</span>
              <button mat-button color="primary">Configure</button>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Audit Logging</span>
              <span matListItemLine>Review system audit logs</span>
              <button mat-button color="primary">View Logs</button>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Security & Compliance</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Two-Factor Authentication</span>
              <span matListItemLine
                >Add an extra layer of security to your account</span
              >
              <button mat-button color="primary">Configure</button>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Compliance Reports</span>
              <span matListItemLine
                >Generate HIPAA and other compliance reports</span
              >
              <button mat-button color="primary">Generate</button>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .portal-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: var(--space-4);
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin: 0 0 var(--space-2);
      }

      .muted {
        color: var(--gray-600);
        margin: 0;
      }

      mat-list-item {
        margin-bottom: var(--space-2);
      }

      ::ng-deep .mat-mdc-list-item {
        height: auto !important;
        min-height: 72px;
      }
    `,
  ],
})
export class AdminSettingsComponent {
  activityAlerts = true;
  healthNotifications = true;
  securityAlerts = true;

  constructor(private snackBar: MatSnackBar) {}

  toggleActivityAlerts(): void {
    this.activityAlerts = !this.activityAlerts;
    this.snackBar.open(
      'Activity alerts ' + (this.activityAlerts ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }

  toggleHealthNotifications(): void {
    this.healthNotifications = !this.healthNotifications;
    this.snackBar.open(
      'Health notifications ' +
        (this.healthNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }

  toggleSecurityAlerts(): void {
    this.securityAlerts = !this.securityAlerts;
    this.snackBar.open(
      'Security alerts ' + (this.securityAlerts ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }
}
