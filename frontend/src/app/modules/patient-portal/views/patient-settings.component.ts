import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-patient-settings',
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
          <p class="eyebrow">Preferences</p>
          <h2>Settings</h2>
          <p class="muted">Manage your account preferences and notifications</p>
        </div>
      </header>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Notification Preferences</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Email Notifications</span>
              <span matListItemLine
                >Receive appointment reminders and updates via email</span
              >
              <mat-slide-toggle
                [checked]="emailNotifications"
                (change)="toggleEmailNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>SMS Notifications</span>
              <span matListItemLine
                >Receive SMS updates for urgent matters</span
              >
              <mat-slide-toggle
                [checked]="smsNotifications"
                (change)="toggleSmsNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Appointment Reminders</span>
              <span matListItemLine>Get reminded before your appointments</span>
              <mat-slide-toggle
                [checked]="appointmentReminders"
                (change)="toggleAppointmentReminders()"
              ></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Privacy & Security</mat-card-title>
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
              <span matListItemTitle>Session Timeout</span>
              <span matListItemLine
                >Automatically log out after 30 minutes of inactivity</span
              >
              <mat-slide-toggle checked="true"></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Data & Privacy</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="button-group">
            <button mat-stroked-button>Download Your Data</button>
            <button mat-stroked-button color="warn">Delete Account</button>
          </div>
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

      .button-group {
        display: flex;
        gap: var(--space-3);
        margin-top: var(--space-2);
      }

      ::ng-deep .mat-mdc-list-item {
        height: auto !important;
        min-height: 72px;
      }
    `,
  ],
})
export class PatientSettingsComponent {
  emailNotifications = true;
  smsNotifications = false;
  appointmentReminders = true;

  constructor(private snackBar: MatSnackBar) {}

  toggleEmailNotifications(): void {
    this.emailNotifications = !this.emailNotifications;
    this.snackBar.open(
      'Email notifications ' +
        (this.emailNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }

  toggleSmsNotifications(): void {
    this.smsNotifications = !this.smsNotifications;
    this.snackBar.open(
      'SMS notifications ' + (this.smsNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }

  toggleAppointmentReminders(): void {
    this.appointmentReminders = !this.appointmentReminders;
    this.snackBar.open(
      'Appointment reminders ' +
        (this.appointmentReminders ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }
}
