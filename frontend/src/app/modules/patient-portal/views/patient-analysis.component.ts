import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AiAnalysisService } from '../../../core/services/ai-analysis.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-analysis',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
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
                Review your recent symptom analyses and follow up with doctors
              </p>
            </div>
            <div class="stat">
              <span class="stat-value">{{ recentAnalyses.length }}</span>
              <span class="stat-label">Total Analyses</span>
            </div>
          </div>

          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading your analysis history...</p>
          </div>

          <div
            *ngIf="!isLoading && recentAnalyses.length > 0"
            class="analysis-list"
          >
            <div
              *ngFor="let analysis of recentAnalyses.slice(0, 5)"
              class="analysis-item"
            >
              <div class="analysis-header">
                <mat-icon>{{ getAnalysisIcon(analysis) }}</mat-icon>
                <div class="analysis-info">
                  <div class="analysis-title">
                    {{
                      analysis.topPredictions?.[0]?.disease || 'Analysis Result'
                    }}
                  </div>
                  <div class="analysis-date">
                    {{ formatDate(analysis.createdAt) }}
                  </div>
                </div>
                <div class="analysis-status">
                  <span
                    [class]="'status-chip ' + analysis.status.toLowerCase()"
                  >
                    {{ analysis.status }}
                  </span>
                </div>
              </div>
              <div
                class="analysis-symptoms"
                *ngIf="analysis.symptoms?.length > 0"
              >
                <span
                  *ngFor="let symptom of analysis.symptoms.slice(0, 3)"
                  class="chip"
                >
                  {{ symptom }}
                </span>
                <span *ngIf="analysis.symptoms.length > 3" class="chip">
                  +{{ analysis.symptoms.length - 3 }} more
                </span>
              </div>
            </div>
          </div>

          <div
            *ngIf="!isLoading && recentAnalyses.length === 0"
            class="empty-state"
          >
            <mat-icon>psychology</mat-icon>
            <p>No analysis history yet</p>
            <p class="muted-small">
              Start your first symptom analysis to get AI-powered insights
            </p>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button routerLink="/ai-analysis">
            <mat-icon>history</mat-icon>
            View Full History
          </button>
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

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        gap: var(--space-4);
      }

      .analysis-list {
        margin-top: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .analysis-item {
        padding: var(--space-4);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        transition: all 0.2s;
      }

      .analysis-item:hover {
        border-color: var(--primary-300);
        box-shadow: var(--shadow-sm);
      }

      .analysis-header {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
      }

      .analysis-header mat-icon {
        color: var(--primary-600);
        margin-top: 2px;
      }

      .analysis-info {
        flex: 1;
      }

      .analysis-title {
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 4px;
      }

      .analysis-date {
        font-size: var(--font-size-sm);
        color: var(--gray-500);
      }

      .analysis-status {
        display: flex;
        align-items: center;
      }

      .status-chip {
        padding: 4px 12px;
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-chip.completed {
        background: var(--success-100);
        color: var(--success-800);
      }

      .status-chip.pending {
        background: var(--warning-100);
        color: var(--warning-800);
      }

      .status-chip.in_progress {
        background: var(--primary-100);
        color: var(--primary-800);
      }

      .analysis-symptoms {
        margin-top: var(--space-3);
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }

      .empty-state {
        text-align: center;
        padding: var(--space-8);
        color: var(--gray-500);
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: var(--space-2);
        color: var(--gray-400);
      }

      .empty-state p {
        margin: var(--space-2) 0;
      }

      .muted-small {
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
export class PatientAnalysisComponent implements OnInit {
  private aiAnalysisService = inject(AiAnalysisService);
  private authService = inject(AuthService);

  recentAnalyses: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadAnalysisHistory();
  }

  private loadAnalysisHistory() {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.isLoading = false;
      return;
    }

    this.aiAnalysisService.getPatientAnalyses(user.id).subscribe({
      next: (analyses: any) => {
        this.recentAnalyses = analyses || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load analysis history:', error);
        this.recentAnalyses = [];
        this.isLoading = false;
      },
    });
  }

  getAnalysisIcon(analysis: any): string {
    const status = analysis.status?.toLowerCase();
    if (status === 'completed') return 'check_circle';
    if (status === 'pending') return 'pending';
    if (status === 'in_progress') return 'autorenew';
    return 'psychology';
  }

  formatDate(date: any): string {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  }
}
