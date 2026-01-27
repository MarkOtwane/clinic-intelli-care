import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AiAnalysisService } from '../../../core/services/ai-analysis.service';

@Component({
  selector: 'app-patient-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="patient-details-dialog">
      <h2 mat-dialog-title>
        <mat-icon>person</mat-icon>
        Patient Information
      </h2>
      <mat-dialog-content>
        <!-- Patient Info Section -->
        <mat-card class="info-card">
          <mat-card-header>
            <div class="patient-header">
              <div class="patient-avatar">
                {{
                  patientData.firstName?.charAt(0).toUpperCase() ||
                    patientData.lastName?.charAt(0).toUpperCase() ||
                    'P'
                }}
              </div>
              <div class="patient-info">
                <h3>{{ patientData.firstName }} {{ patientData.lastName }}</h3>
                <p>
                  <mat-icon>email</mat-icon>
                  {{ patientData.email }}
                </p>
                <p>
                  <mat-icon>phone</mat-icon>
                  {{ patientData.phone || 'N/A' }}
                </p>
              </div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="medical-info">
              <div class="info-row" *ngIf="patientData.gender">
                <strong>Gender:</strong>
                <span>{{ patientData.gender }}</span>
              </div>
              <div class="info-row" *ngIf="patientData.dateOfBirth">
                <strong>Date of Birth:</strong>
                <span>{{ patientData.dateOfBirth | date: 'MMM d, y' }}</span>
              </div>
              <div class="info-row" *ngIf="patientData.bloodGroup">
                <strong>Blood Group:</strong>
                <span class="blood-chip">{{ patientData.bloodGroup }}</span>
              </div>
              <div class="info-row" *ngIf="patientData.allergies">
                <strong>Allergies:</strong>
                <div class="chips">
                  <mat-chip
                    *ngFor="let allergy of patientData.allergies.split(',')"
                  >
                    {{ allergy.trim() }}
                  </mat-chip>
                </div>
              </div>
              <div class="info-row" *ngIf="patientData.medicalConditions">
                <strong>Medical Conditions:</strong>
                <div class="chips">
                  <mat-chip
                    *ngFor="
                      let condition of patientData.medicalConditions.split(',')
                    "
                  >
                    {{ condition.trim() }}
                  </mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- AI Analysis Section -->
        <mat-tab-group class="analysis-tabs">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>psychology</mat-icon>
              AI Analysis History
            </ng-template>

            <div class="analysis-content">
              <div *ngIf="analysisLoading" class="loading-state">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading AI analysis history...</p>
              </div>

              <div
                *ngIf="!analysisLoading && analyses.length === 0"
                class="empty-state"
              >
                <mat-icon>info</mat-icon>
                <p>No AI analysis records found for this patient</p>
              </div>

              <div
                *ngIf="!analysisLoading && analyses.length > 0"
                class="analyses-list"
              >
                <mat-card
                  *ngFor="let analysis of analyses"
                  class="analysis-card"
                >
                  <mat-card-header>
                    <mat-card-title>
                      {{
                        analysis.topPredictions?.[0]?.disease ||
                          'Analysis Result'
                      }}
                    </mat-card-title>
                    <mat-card-subtitle>
                      {{ analysis.createdAt | date: 'MMM d, y h:mm a' }}
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="analysis-details">
                      <div *ngIf="analysis.symptoms?.length > 0">
                        <strong>Symptoms Reported:</strong>
                        <div class="chips">
                          <mat-chip
                            *ngFor="let symptom of analysis.symptoms"
                            color="primary"
                            selected
                          >
                            {{ symptom }}
                          </mat-chip>
                        </div>
                      </div>

                      <div
                        *ngIf="
                          analysis.topPredictions &&
                          analysis.topPredictions.length > 0
                        "
                        class="predictions"
                      >
                        <strong>AI Predictions:</strong>
                        <div
                          class="prediction-item"
                          *ngFor="let pred of analysis.topPredictions"
                        >
                          <div class="prediction-header">
                            <span class="disease-name">{{ pred.disease }}</span>
                            <span class="confidence">
                              {{ (pred.confidence * 100).toFixed(1) }}%
                              confidence
                            </span>
                          </div>
                          <div class="confidence-bar">
                            <div
                              class="confidence-fill"
                              [style.width.%]="pred.confidence * 100"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div *ngIf="analysis.recommendations?.length > 0">
                        <strong>Recommendations:</strong>
                        <ul class="recommendations">
                          <li *ngFor="let rec of analysis.recommendations">
                            {{ rec }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
          Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .patient-details-dialog {
        min-width: 500px;
        max-width: 700px;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .info-card {
        margin-bottom: var(--space-4);
      }

      .patient-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }

      .patient-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--primary-500),
          var(--primary-700)
        );
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 24px;
        flex-shrink: 0;
      }

      .patient-info h3 {
        margin: 0;
        color: var(--gray-900);
        font-size: 18px;
      }

      .patient-info p {
        margin: var(--space-1) 0;
        display: flex;
        align-items: center;
        gap: var(--space-1);
        color: var(--gray-600);
        font-size: 14px;
      }

      .patient-info mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .medical-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .info-row {
        display: flex;
        align-items: flex-start;
        gap: var(--space-2);
        padding: var(--space-3);
        background: var(--gray-50);
        border-radius: var(--radius-md);
        flex-wrap: wrap;
      }

      .info-row strong {
        min-width: 150px;
        color: var(--gray-900);
      }

      .blood-chip {
        background: #ffebee;
        color: #c62828;
        padding: 4px 12px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 13px;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
      }

      .analysis-tabs {
        margin-top: var(--space-4);
      }

      .analysis-content {
        padding: var(--space-4) 0;
      }

      .loading-state,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        text-align: center;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--gray-300);
        margin-bottom: var(--space-2);
      }

      .analyses-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        max-height: 400px;
        overflow-y: auto;
      }

      .analysis-card {
        border-left: 3px solid var(--secondary-500);
      }

      .analysis-details {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .analysis-details strong {
        display: block;
        margin-bottom: var(--space-2);
        color: var(--gray-900);
      }

      .predictions {
        padding: var(--space-3);
        background: var(--primary-50);
        border-radius: var(--radius-md);
      }

      .prediction-item {
        margin-bottom: var(--space-2);
      }

      .prediction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-1);
      }

      .disease-name {
        font-weight: 600;
        color: var(--gray-900);
      }

      .confidence {
        font-size: 12px;
        color: var(--primary-700);
        font-weight: 600;
      }

      .confidence-bar {
        height: 6px;
        background: var(--gray-200);
        border-radius: 3px;
        overflow: hidden;
      }

      .confidence-fill {
        height: 100%;
        background: linear-gradient(
          90deg,
          var(--primary-500),
          var(--primary-700)
        );
        transition: width 0.3s ease;
      }

      .recommendations {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .recommendations li {
        padding: var(--space-2);
        background: #f3e5f5;
        border-left: 3px solid #7b1fa2;
        border-radius: var(--radius-sm);
        color: var(--gray-800);
        font-size: 13px;
      }

      mat-dialog-actions {
        gap: var(--space-2);
      }

      @media (max-width: 768px) {
        .patient-details-dialog {
          min-width: auto;
          max-width: 100%;
        }

        .patient-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .analyses-list {
          max-height: 300px;
        }
      }
    `,
  ],
})
export class PatientDetailsDialogComponent implements OnInit {
  patientData: any;
  analyses: any[] = [];
  analysisLoading = true;

  constructor(
    public dialogRef: MatDialogRef<PatientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patient: any },
    private aiAnalysisService: AiAnalysisService,
  ) {
    this.patientData = data.patient;
  }

  ngOnInit(): void {
    this.loadPatientAnalyses();
  }

  private loadPatientAnalyses(): void {
    this.analysisLoading = true;
    this.aiAnalysisService.getPatientAnalyses(this.patientData.id).subscribe({
      next: (analyses: any) => {
        this.analyses = analyses || [];
        this.analysisLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load patient analyses:', error);
        this.analyses = [];
        this.analysisLoading = false;
      },
    });
  }
}
