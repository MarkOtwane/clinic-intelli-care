import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-doctor-settings',
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
          <p class="muted">
            Manage your account preferences and clinic settings
          </p>
        </div>
      </header>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Notification Preferences</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Patient Appointment Reminders</span>
              <span matListItemLine
                >Get notified when patients book appointments</span
              >
              <mat-slide-toggle
                [checked]="appointmentNotifications"
                (change)="toggleAppointmentNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Patient Messages</span>
              <span matListItemLine
                >Receive notifications for new patient messages</span
              >
              <mat-slide-toggle
                [checked]="messageNotifications"
                (change)="toggleMessageNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>System Updates</span>
              <span matListItemLine
                >Get notified about system updates and maintenance</span
              >
              <mat-slide-toggle
                [checked]="systemNotifications"
                (change)="toggleSystemNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Clinic Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Consultation Availability</span>
              <span matListItemLine
                >Configure your available consultation times</span
              >
              <button mat-button color="primary">Configure</button>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Consultation Fee</span>
              <span matListItemLine>Update your consultation fee</span>
              <button mat-button color="primary">Update</button>
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
              <span matListItemTitle>Patient Privacy</span>
              <span matListItemLine>Configure HIPAA compliance settings</span>
              <button mat-button color="primary">Configure</button>
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
export class DoctorSettingsComponent {
  appointmentNotifications = true;
  messageNotifications = true;
  systemNotifications = false;

  constructor(private snackBar: MatSnackBar) {}

  toggleAppointmentNotifications(): void {
    this.appointmentNotifications = !this.appointmentNotifications;
    this.snackBar.open(
      'Appointment notifications ' +
        (this.appointmentNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }

  toggleMessageNotifications(): void {
    this.messageNotifications = !this.messageNotifications;
    this.snackBar.open(
      'Message notifications ' +
        (this.messageNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }

  toggleSystemNotifications(): void {
    this.systemNotifications = !this.systemNotifications;
    this.snackBar.open(
      'System notifications ' +
        (this.systemNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 }
    );
  }
}
