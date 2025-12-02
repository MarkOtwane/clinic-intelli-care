import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Medications</p>
          <h2>Prescription tracker</h2>
          <p class="muted">
            Review active medications, dosage reminders, and refill requests.
          </p>
        </div>
        <button mat-stroked-button color="primary" disabled>
          <mat-icon>history</mat-icon>
          View full history
        </button>
      </header>

      <div class="timeline">
        <div class="timeline-item">
          <mat-icon>medication</mat-icon>
          <div>
            <h4>Vitamin D3 · Daily</h4>
            <p>Next dose at 8:00 AM · 22 days remaining</p>
          </div>
        </div>
        <div class="timeline-item">
          <mat-icon>medication_liquid</mat-icon>
          <div>
            <h4>Antibiotic course</h4>
            <p>Take with food · Ends Sunday</p>
          </div>
        </div>
      </div>

      <mat-card class="refill-card">
        <mat-card-content>
          <div>
            <h3>Need a refill?</h3>
            <p class="muted">
              Request renewals directly from your prescribing doctor.
            </p>
          </div>
          <button mat-flat-button color="primary" disabled>
            Request refill
          </button>
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

      .timeline {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        padding-left: var(--space-2);
      }

      .timeline-item {
        display: flex;
        gap: var(--space-3);
        align-items: flex-start;
      }

      .timeline-item mat-icon {
        margin-top: 4px;
        color: var(--primary-600);
      }

      .refill-card {
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-md);
      }

      .refill-card mat-card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
      }

      @media (max-width: 768px) {
        .section-header,
        .refill-card mat-card-content {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class PatientPrescriptionsComponent {}
