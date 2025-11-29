import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Orders</p>
          <h2>Prescription queue</h2>
          <p class="muted">Approve pending requests and renew expiring meds.</p>
        </div>
        <button mat-button color="primary" routerLink="/prescriptions">
          <mat-icon>vaccines</mat-icon>
          Open prescription module
        </button>
      </header>

      <mat-list class="queue">
        <mat-list-item>
          <mat-icon matListItemIcon color="warn">pending_actions</mat-icon>
          <div matListItemTitle>Metformin Renewal</div>
          <div matListItemLine>Requested by Ava Carter · due today</div>
          <button mat-button matListItemMeta>Review</button>
        </mat-list-item>
        <mat-list-item>
          <mat-icon matListItemIcon color="accent">pending</mat-icon>
          <div matListItemTitle>Blood pressure medication</div>
          <div matListItemLine>Liam Ortiz · refill reminder</div>
          <button mat-button matListItemMeta>Notify nurse</button>
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

      .queue {
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
export class DoctorPrescriptionsComponent {}

