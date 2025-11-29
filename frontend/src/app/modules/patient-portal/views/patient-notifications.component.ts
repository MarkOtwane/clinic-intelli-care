import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatListModule, MatIconModule],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Updates</p>
          <h2>Notifications</h2>
          <p class="muted">
            Stay informed about lab results, appointment reminders, and billing
            alerts.
          </p>
        </div>
        <button mat-button color="primary" routerLink="/notifications">
          <mat-icon>mark_email_read</mat-icon>
          Open inbox
        </button>
      </header>

      <mat-list class="notification-list">
        <mat-list-item>
          <mat-icon matListItemIcon color="primary">priority_high</mat-icon>
          <div matListItemTitle>Prescription refill approved</div>
          <div matListItemLine>Dr. Lee · 10 minutes ago</div>
        </mat-list-item>
        <mat-list-item>
          <mat-icon matListItemIcon color="accent">event</mat-icon>
          <div matListItemTitle>Appointment reminder</div>
          <div matListItemLine>Tomorrow at 9:00 AM</div>
        </mat-list-item>
        <mat-list-item>
          <mat-icon matListItemIcon color="warn">lab_panel</mat-icon>
          <div matListItemTitle>Lab results ready</div>
          <div matListItemLine>View secure report</div>
        </mat-list-item>
      </mat-list>
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
        align-items: center;
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

      .notification-list {
        border-radius: var(--radius-xl);
        border: 1px solid var(--gray-200);
        background: #fff;
      }

      mat-list-item {
        padding: var(--space-3) var(--space-4);
      }

      @media (max-width: 768px) {
        .section-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class PatientNotificationsComponent {}

