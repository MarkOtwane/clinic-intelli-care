import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Clinical schedule</p>
          <h2>Today's appointments</h2>
          <p class="muted">
            Monitor arrivals, tele-consults, and follow-ups from one view.
          </p>
        </div>
        <button mat-flat-button color="primary" routerLink="/appointments">
          <mat-icon>event_note</mat-icon>
          Open scheduler
        </button>
      </header>

      <div class="card-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>schedule</mat-icon>
            <mat-card-title>Morning session</mat-card-title>
            <mat-card-subtitle>08:00 - 12:00</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="stat">4 confirmed | 1 virtual</p>
            <p class="muted">
              Keep visit notes up-to-date to speed up documentation later.
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/appointments">View queue</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">priority_high</mat-icon>
            <mat-card-title>Action items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ul class="list">
              <li>Accept or decline urgent consult request.</li>
              <li>Record vitals for Case #A-302.</li>
            </ul>
          </mat-card-content>
        </mat-card>
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

      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-4);
      }

      .info-card {
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-md);
      }

      .stat {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--primary-700);
      }

      .list {
        padding-left: 1.25rem;
        color: var(--gray-600);
        margin: 0;
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
export class DoctorAppointmentsComponent {}

