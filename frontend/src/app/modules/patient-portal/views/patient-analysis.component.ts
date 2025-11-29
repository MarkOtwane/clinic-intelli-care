import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patient-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Intelligent triage</p>
          <h2>AI symptom analysis</h2>
          <p class="muted">
            Describe your symptoms and receive actionable guidance before your
            visit.
          </p>
        </div>
        <button mat-flat-button color="primary" routerLink="/ai-analysis">
          <mat-icon>psychology</mat-icon>
          Start new analysis
        </button>
      </header>

      <mat-card class="analysis-card">
        <mat-card-content>
          <div class="analysis-row">
            <div>
              <h3>Recent results</h3>
              <p class="muted">
                Keep track of up to 5 recent analyses with follow-up questions.
              </p>
            </div>
            <div class="stat">
              <span class="stat-value">3</span>
              <span class="stat-label">Pending follow-ups</span>
            </div>
          </div>
          <div class="chip-row">
            <span class="chip">Respiratory</span>
            <span class="chip">General wellness</span>
            <span class="chip">Sleep health</span>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button routerLink="/ai-analysis">View history</button>
        </mat-card-actions>
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

      .analysis-card {
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-md);
      }

      .analysis-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
      }

      .stat {
        text-align: right;
      }

      .stat-value {
        display: block;
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--secondary-700);
      }

      .stat-label {
        color: var(--gray-500);
        font-size: var(--font-size-sm);
      }

      .chip-row {
        margin-top: var(--space-4);
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }

      .chip {
        padding: 4px 12px;
        border-radius: var(--radius-full);
        background: var(--primary-50);
        color: var(--primary-800);
        font-size: var(--font-size-sm);
      }

      @media (max-width: 768px) {
        .section-header,
        .analysis-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .stat {
          text-align: left;
        }
      }
    `,
  ],
})
export class PatientAnalysisComponent {}

