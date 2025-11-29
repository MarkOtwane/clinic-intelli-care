import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Visits</p>
          <h2>Appointments</h2>
          <p class="muted">
            Review upcoming visits, confirmations, and follow-up tasks.
          </p>
        </div>
        <button mat-flat-button color="primary" routerLink="/appointments">
          <mat-icon>add_circle</mat-icon>
          Schedule appointment
        </button>
      </header>

      <div class="card-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>event_available</mat-icon>
            <mat-card-title>Upcoming visit</mat-card-title>
            <mat-card-subtitle>Next 7 days</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="highlight">2 confirmed appointments</p>
            <p class="muted">
              Get reminders, directions, and preparation checklists.
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/appointments">View schedule</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>forum</mat-icon>
            <mat-card-title>Follow-up questions</mat-card-title>
            <mat-card-subtitle>Shared with your doctor</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <ul class="list">
              <li>Prepare symptom notes before your visit.</li>
              <li>Upload lab reports to help your doctor plan care.</li>
            </ul>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/appointments">Manage visits</button>
          </mat-card-actions>
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
        margin: 0 0 var(--space-2) 0;
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

      .highlight {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--primary-700);
      }

      .list {
        padding-left: 1.25rem;
        color: var(--gray-600);
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
export class PatientAppointmentsComponent {}
