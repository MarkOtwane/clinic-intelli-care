import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription, Medication } from '../../../core/models/prescription.model';

interface MedicationSchedule {
  medication: Medication;
  prescriptionId: string;
  diagnosis: string;
  taken: boolean;
  time: string;
}

@Component({
  selector: 'app-medication-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  template: `
    <div class="tracker-container">
      <mat-card class="tracker-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>schedule</mat-icon>
            Medication Tracker
          </mat-card-title>
          <mat-card-subtitle>Track daily medication schedule</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="!isLoading; else loadingTemplate">
            <!-- Today's Schedule -->
            <div class="section">
              <h3>Today's Medications</h3>
              <div class="schedule-list" *ngIf="todaySchedule.length > 0; else noMedications">
                <div class="schedule-item" *ngFor="let item of todaySchedule" 
                     [class.taken]="item.taken">
                  <mat-checkbox [(ngModel)]="item.taken" (change)="markAsTaken(item)">
                    <div class="medication-info">
                      <div class="med-name">
                        <mat-icon>medication</mat-icon>
                        <strong>{{ item.medication.name }}</strong>
                      </div>
                      <div class="med-details">
                        <span class="dosage">{{ item.medication.dosage }}</span>
                        <span class="frequency">{{ item.medication.frequency }}</span>
                        <span class="time">{{ item.time }}</span>
                      </div>
                      <div class="diagnosis-tag">
                        <mat-chip size="small">{{ item.diagnosis }}</mat-chip>
                      </div>
                    </div>
                  </mat-checkbox>
                </div>
              </div>

              <ng-template #noMedications>
                <div class="empty-state">
                  <mat-icon>check_circle</mat-icon>
                  <p>No medications scheduled for today</p>
                </div>
              </ng-template>
            </div>

            <!-- Active Medications Summary -->
            <div class="section">
              <h3>Active Medications</h3>
              <div class="medications-grid">
                <mat-card class="med-card" *ngFor="let prescription of activePrescriptions">
                  <mat-card-header>
                    <mat-card-title>{{ prescription.diagnosis }}</mat-card-title>
                    <mat-card-subtitle>
                      Issued: {{ prescription.issuedAt | date:'mediumDate' }}
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="med-list">
                      <div class="med-item" *ngFor="let med of prescription.medications">
                        <div class="med-header">
                          <mat-icon>medication</mat-icon>
                          <span>{{ med.name }}</span>
                        </div>
                        <div class="med-info">
                          <p><strong>Dosage:</strong> {{ med.dosage }}</p>
                          <p><strong>Frequency:</strong> {{ med.frequency }}</p>
                          <p><strong>Duration:</strong> {{ med.duration }}</p>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>

            <!-- Adherence Stats -->
            <div class="section">
              <h3>Adherence Statistics</h3>
              <div class="stats-grid">
                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon color="primary">check_circle</mat-icon>
                      <div class="stat-info">
                        <h4>{{ adherenceRate }}%</h4>
                        <p>Adherence Rate</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon color="accent">medication</mat-icon>
                      <div class="stat-info">
                        <h4>{{ activeMedicationsCount }}</h4>
                        <p>Active Medications</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading">
              <mat-spinner></mat-spinner>
              <p>Loading medication schedule...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .tracker-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .tracker-card {
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

    .schedule-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .schedule-item {
      background: #fff;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s ease;
    }

    .schedule-item.taken {
      background: #f0f8f0;
      border-color: #4caf50;
      opacity: 0.7;
    }

    .medication-info {
      margin-left: 8px;
      width: 100%;
    }

    .med-name {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #2c3e50;
    }

    .med-name mat-icon {
      color: #667eea;
    }

    .med-details {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 14px;
      color: #555;
      margin-bottom: 8px;
    }

    .med-details span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .time {
      color: #667eea;
      font-weight: 600;
    }

    .diagnosis-tag {
      margin-top: 8px;
    }

    .medications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .med-card {
      border-left: 4px solid #667eea;
    }

    .med-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .med-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
    }

    .med-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .med-header mat-icon {
      color: #667eea;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .med-info p {
      margin: 4px 0;
      font-size: 14px;
      color: #555;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      border-left: 4px solid #667eea;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h4 {
      margin: 0;
      font-size: 2rem;
      color: #2c3e50;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #7f8c8d;
      font-size: 14px;
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
      color: #4caf50;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .tracker-container {
        padding: 16px;
      }

      .medications-grid {
        grid-template-columns: 1fr;
      }

      .med-details {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class MedicationTrackerComponent implements OnInit, OnDestroy {
  @Input() patientId!: string;

  activePrescriptions: Prescription[] = [];
  todaySchedule: MedicationSchedule[] = [];
  isLoading = false;
  adherenceRate = 0;
  activeMedicationsCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private prescriptionService: PrescriptionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.patientId) {
      this.loadMedicationData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMedicationData(): void {
    this.isLoading = true;

    this.prescriptionService.getActivePrescriptions(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prescriptions) => {
          this.activePrescriptions = prescriptions;
          this.generateTodaySchedule(prescriptions);
          this.calculateStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading medications:', error);
          this.snackBar.open('Failed to load medication data', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  private generateTodaySchedule(prescriptions: Prescription[]): void {
    this.todaySchedule = [];
    
    prescriptions.forEach(prescription => {
      prescription.medications.forEach(medication => {
        // Generate schedule based on frequency
        const times = this.getScheduleTimes(medication.frequency);
        times.forEach(time => {
          this.todaySchedule.push({
            medication,
            prescriptionId: prescription.id,
            diagnosis: prescription.diagnosis,
            taken: false,
            time
          });
        });
      });
    });

    // Sort by time
    this.todaySchedule.sort((a, b) => a.time.localeCompare(b.time));
  }

  private getScheduleTimes(frequency: string): string[] {
    const times: string[] = [];
    
    switch (frequency.toLowerCase()) {
      case 'once daily':
        times.push('08:00 AM');
        break;
      case 'twice daily':
        times.push('08:00 AM', '08:00 PM');
        break;
      case 'three times daily':
        times.push('08:00 AM', '02:00 PM', '08:00 PM');
        break;
      case 'four times daily':
        times.push('08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM');
        break;
      case 'every 4 hours':
        times.push('08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM', '12:00 AM');
        break;
      case 'every 6 hours':
        times.push('08:00 AM', '02:00 PM', '08:00 PM', '02:00 AM');
        break;
      case 'every 8 hours':
        times.push('08:00 AM', '04:00 PM', '12:00 AM');
        break;
      case 'before meals':
        times.push('07:30 AM', '12:30 PM', '06:30 PM');
        break;
      case 'after meals':
        times.push('09:00 AM', '02:00 PM', '08:00 PM');
        break;
      default:
        times.push('08:00 AM');
    }
    
    return times;
  }

  private calculateStats(): void {
    this.activeMedicationsCount = this.activePrescriptions.reduce(
      (count, prescription) => count + prescription.medications.length,
      0
    );

    // Calculate adherence rate (mock calculation)
    const takenCount = this.todaySchedule.filter(item => item.taken).length;
    this.adherenceRate = this.todaySchedule.length > 0
      ? Math.round((takenCount / this.todaySchedule.length) * 100)
      : 100;
  }

  markAsTaken(item: MedicationSchedule): void {
    this.calculateStats();
    const status = item.taken ? 'marked as taken' : 'unmarked';
    this.snackBar.open(`Medication ${status}`, 'Close', { duration: 2000 });
  }
}
