import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription, PrescriptionStatus } from '../../../core/models/prescription.model';

@Component({
  selector: 'app-prescription-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="history-container">
      <mat-card class="history-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Prescription History
          </mat-card-title>
          <mat-card-subtitle>View all prescriptions for this patient</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="!isLoading; else loadingTemplate">
            <!-- Active Prescriptions -->
            <div class="section" *ngIf="activePrescriptions.length > 0">
              <h3>Active Prescriptions</h3>
              <mat-accordion>
                <mat-expansion-panel *ngFor="let prescription of activePrescriptions">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <div class="prescription-header">
                        <span class="diagnosis">{{ prescription.diagnosis }}</span>
                        <mat-chip color="primary" selected>{{ prescription.status }}</mat-chip>
                      </div>
                    </mat-panel-title>
                    <mat-panel-description>
                      Issued: {{ prescription.issuedAt | date:'mediumDate' }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="prescription-details">
                    <div class="detail-section">
                      <h4>Medications</h4>
                      <div class="medications-list">
                        <div class="medication-item" *ngFor="let med of prescription.medications">
                          <div class="med-header">
                            <mat-icon>medication</mat-icon>
                            <strong>{{ med.name }}</strong>
                          </div>
                          <div class="med-details">
                            <p><strong>Dosage:</strong> {{ med.dosage }}</p>
                            <p><strong>Frequency:</strong> {{ med.frequency }}</p>
                            <p><strong>Duration:</strong> {{ med.duration }}</p>
                            <p *ngIf="med.instructions"><strong>Instructions:</strong> {{ med.instructions }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="detail-section">
                      <h4>General Instructions</h4>
                      <p>{{ prescription.instructions }}</p>
                    </div>

                    <div class="detail-section" *ngIf="prescription.validUntil">
                      <h4>Valid Until</h4>
                      <p>{{ prescription.validUntil | date:'mediumDate' }}</p>
                    </div>

                    <div class="detail-section" *ngIf="prescription.notes">
                      <h4>Notes</h4>
                      <p>{{ prescription.notes }}</p>
                    </div>

                    <div class="prescription-actions">
                      <button mat-button color="primary" (click)="renewPrescription(prescription)">
                        <mat-icon>refresh</mat-icon>
                        Renew
                      </button>
                      <button mat-button (click)="printPrescription(prescription)">
                        <mat-icon>print</mat-icon>
                        Print
                      </button>
                      <button mat-button color="warn" (click)="cancelPrescription(prescription)">
                        <mat-icon>cancel</mat-icon>
                        Cancel
                      </button>
                    </div>
                  </div>
                </mat-expansion-panel>
              </mat-accordion>
            </div>

            <!-- Past Prescriptions -->
            <div class="section" *ngIf="pastPrescriptions.length > 0">
              <h3>Past Prescriptions</h3>
              <mat-accordion>
                <mat-expansion-panel *ngFor="let prescription of pastPrescriptions">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <div class="prescription-header">
                        <span class="diagnosis">{{ prescription.diagnosis }}</span>
                        <mat-chip [color]="getStatusColor(prescription.status)" selected>
                          {{ prescription.status }}
                        </mat-chip>
                      </div>
                    </mat-panel-title>
                    <mat-panel-description>
                      Issued: {{ prescription.issuedAt | date:'mediumDate' }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="prescription-details">
                    <div class="detail-section">
                      <h4>Medications</h4>
                      <div class="medications-list">
                        <div class="medication-item" *ngFor="let med of prescription.medications">
                          <div class="med-header">
                            <mat-icon>medication</mat-icon>
                            <strong>{{ med.name }}</strong>
                          </div>
                          <div class="med-details">
                            <p><strong>Dosage:</strong> {{ med.dosage }}</p>
                            <p><strong>Frequency:</strong> {{ med.frequency }}</p>
                            <p><strong>Duration:</strong> {{ med.duration }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <mat-divider></mat-divider>

                    <div class="detail-section">
                      <h4>General Instructions</h4>
                      <p>{{ prescription.instructions }}</p>
                    </div>

                    <div class="prescription-actions">
                      <button mat-button (click)="printPrescription(prescription)">
                        <mat-icon>print</mat-icon>
                        Print
                      </button>
                    </div>
                  </div>
                </mat-expansion-panel>
              </mat-accordion>
            </div>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="activePrescriptions.length === 0 && pastPrescriptions.length === 0">
              <mat-icon>medication</mat-icon>
              <h3>No Prescriptions Found</h3>
              <p>This patient has no prescription history</p>
            </div>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading">
              <mat-spinner></mat-spinner>
              <p>Loading prescription history...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .history-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h3 {
      color: #2c3e50;
      margin-bottom: 16px;
      font-size: 18px;
    }

    .prescription-header {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .diagnosis {
      flex: 1;
      font-weight: 600;
      color: #2c3e50;
    }

    .prescription-details {
      padding: 16px 0;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section h4 {
      color: #2c3e50;
      margin-bottom: 12px;
      font-size: 16px;
    }

    .detail-section p {
      color: #555;
      margin: 8px 0;
      line-height: 1.6;
    }

    .medications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .medication-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #667eea;
    }

    .med-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: #2c3e50;
    }

    .med-header mat-icon {
      color: #667eea;
    }

    .med-details p {
      margin: 4px 0;
      font-size: 14px;
    }

    .prescription-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #7f8c8d;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #2c3e50;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    mat-divider {
      margin: 16px 0;
    }

    @media (max-width: 768px) {
      .history-container {
        padding: 16px;
      }

      .prescription-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class PrescriptionHistoryComponent implements OnInit, OnDestroy {
  @Input() patientId!: string;

  activePrescriptions: Prescription[] = [];
  pastPrescriptions: Prescription[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private prescriptionService: PrescriptionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.patientId) {
      this.loadPrescriptionHistory();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPrescriptionHistory(): void {
    this.isLoading = true;

    this.prescriptionService.getPrescriptionsByPatient(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prescriptions) => {
          this.activePrescriptions = prescriptions.filter(
            p => p.status === PrescriptionStatus.ACTIVE
          );
          this.pastPrescriptions = prescriptions.filter(
            p => p.status !== PrescriptionStatus.ACTIVE
          );
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading prescriptions:', error);
          this.snackBar.open('Failed to load prescription history', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  getStatusColor(status: PrescriptionStatus): string {
    switch (status) {
      case PrescriptionStatus.ACTIVE:
        return 'primary';
      case PrescriptionStatus.COMPLETED:
        return 'accent';
      case PrescriptionStatus.CANCELLED:
        return 'warn';
      case PrescriptionStatus.EXPIRED:
        return '';
      default:
        return '';
    }
  }

  renewPrescription(prescription: Prescription): void {
    this.prescriptionService.renewPrescription(prescription.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Prescription renewed successfully', 'Close', { duration: 3000 });
          this.loadPrescriptionHistory();
        },
        error: (error) => {
          console.error('Error renewing prescription:', error);
          this.snackBar.open('Failed to renew prescription', 'Close', { duration: 3000 });
        }
      });
  }

  cancelPrescription(prescription: Prescription): void {
    this.prescriptionService.updatePrescriptionStatus(prescription.id, PrescriptionStatus.CANCELLED)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Prescription cancelled', 'Close', { duration: 3000 });
          this.loadPrescriptionHistory();
        },
        error: (error) => {
          console.error('Error cancelling prescription:', error);
          this.snackBar.open('Failed to cancel prescription', 'Close', { duration: 3000 });
        }
      });
  }

  printPrescription(prescription: Prescription): void {
    this.snackBar.open('Print functionality will be implemented', 'Close', { duration: 2000 });
  }
}
