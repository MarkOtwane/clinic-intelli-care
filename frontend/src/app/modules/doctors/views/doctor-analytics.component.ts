import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-doctor-analytics',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Performance</p>
          <h2>Practice analytics</h2>
          <p class="muted">
            Snapshot of satisfaction, throughput, and follow-up compliance.
          </p>
        </div>
      </header>

      <div class="metrics">
        <div class="metric-card">
          <span class="metric-label">Patient satisfaction</span>
          <strong>4.8 / 5</strong>
          <mat-progress-bar color="accent" mode="determinate" [value]="96"></mat-progress-bar>
        </div>
        <div class="metric-card">
          <span class="metric-label">Follow-ups completed</span>
          <strong>86%</strong>
          <mat-progress-bar color="primary" mode="determinate" [value]="86"></mat-progress-bar>
        </div>
        <div class="metric-card">
          <span class="metric-label">Average visit time</span>
          <strong>18 min</strong>
          <mat-progress-bar color="warn" mode="determinate" [value]="60"></mat-progress-bar>
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

      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--space-4);
      }

      .metric-card {
        padding: var(--space-4);
        border-radius: var(--radius-xl);
        border: 1px solid var(--gray-200);
        background: #fff;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .metric-label {
        text-transform: uppercase;
        font-size: var(--font-size-xs);
        letter-spacing: 0.08em;
        color: var(--gray-500);
      }

      strong {
        font-size: var(--font-size-2xl);
        color: var(--gray-800);
      }
    `,
  ],
})
export class DoctorAnalyticsComponent {}

