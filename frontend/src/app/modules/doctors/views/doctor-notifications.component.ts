import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-doctor-notifications',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Team updates</p>
          <h2>Notifications</h2>
          <p class="muted">Operational alerts from schedulers and admins.</p>
        </div>
      </header>

      <div class="alerts">
        <div class="alert-card">
          <mat-icon>campaign</mat-icon>
          <div>
            <strong>Scheduler note</strong>
            <p class="muted">Patient rescheduled for 3 PM slot.</p>
          </div>
          <mat-chip color="primary" selected>New</mat-chip>
        </div>
        <div class="alert-card">
          <mat-icon>sms</mat-icon>
          <div>
            <strong>Nurse station</strong>
            <p class="muted">Vitals ready for room 04.</p>
          </div>
          <mat-chip color="accent" selected>Action</mat-chip>
        </div>
      </div>
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

      .alerts {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .alert-card {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        border-radius: var(--radius-xl);
        border: 1px solid var(--gray-200);
        background: #fff;
        box-shadow: var(--shadow-sm);
      }

      mat-chip {
        margin-left: auto;
      }

      @media (max-width: 768px) {
        .section-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .alert-card {
          flex-direction: column;
          align-items: flex-start;
        }

        mat-chip {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class DoctorNotificationsComponent {}

