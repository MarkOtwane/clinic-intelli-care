import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  template: `
    <div class="profile-container" *ngIf="!isLoading && patient; else loadingTemplate">
      <!-- Header Section -->
      <mat-card class="profile-header">
        <div class="header-content">
          <div class="patient-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="patient-info">
            <h1>{{ patient.firstName }} {{ patient.lastName }}</h1>
            <p class="patient-id">Patient ID: #{{ patient.id.slice(-8) }}</p>
            <mat-chip [color]="getStatusColor(patient.status)" selected>
              {{ patient.status }}
            </mat-chip>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="editPatient()">
              <mat-icon>edit</mat-icon>
              Edit Profile
            </button>
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item>
                <mat-icon>print</mat-icon>
                <span>Print Profile</span>
              </button>
              <button mat-menu-item>
                <mat-icon>download</mat-icon>
                <span>Export Data</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-card>

      <!-- Tabs Section -->
      <mat-tab-group class="profile-tabs">
        <!-- Personal Information Tab -->
        <mat-tab label="Personal Information">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Contact Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <mat-icon>email</mat-icon>
                    <div>
                      <label>Email</label>
                      <p>{{ patient.email || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>phone</mat-icon>
                    <div>
                      <label>Phone</label>
                      <p>{{ patient.phone || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>cake</mat-icon>
                    <div>
                      <label>Date of Birth</label>
                      <p>{{ (patient.dateOfBirth | date:'mediumDate') || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>wc</mat-icon>
                    <div>
                      <label>Gender</label>
                      <p>{{ patient.gender || 'Not provided' }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Address</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item full-width">
                    <mat-icon>home</mat-icon>
                    <div>
                      <label>Street Address</label>
                      <p>{{ patient.address || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>location_city</mat-icon>
                    <div>
                      <label>City</label>
                      <p>{{ patient.city || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>map</mat-icon>
                    <div>
                      <label>State</label>
                      <p>{{ patient.state || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>pin_drop</mat-icon>
                    <div>
                      <label>Zip Code</label>
                      <p>{{ patient.zipCode || 'Not provided' }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Medical Information Tab -->
        <mat-tab label="Medical Information">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Medical Details</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <mat-icon>bloodtype</mat-icon>
                    <div>
                      <label>Blood Group</label>
                      <p>{{ patient.bloodGroup || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="info-item full-width">
                    <mat-icon>warning</mat-icon>
                    <div>
                      <label>Allergies</label>
                      <div class="chips-container">
                        <mat-chip *ngFor="let allergy of patient.allergies" color="warn" selected>
                          {{ allergy }}
                        </mat-chip>
                        <p *ngIf="!patient.allergies || patient.allergies.length === 0">No known allergies</p>
                      </div>
                    </div>
                  </div>
                  <div class="info-item full-width">
                    <mat-icon>medical_services</mat-icon>
                    <div>
                      <label>Medical Conditions</label>
                      <div class="chips-container">
                        <mat-chip *ngFor="let condition of patient.conditions" color="primary" selected>
                          {{ condition }}
                        </mat-chip>
                        <p *ngIf="!patient.conditions || patient.conditions.length === 0">No known conditions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card *ngIf="medicalHistory && medicalHistory.length > 0">
              <mat-card-header>
                <mat-card-title>Medical History</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="history-timeline">
                  <div class="history-item" *ngFor="let record of medicalHistory">
                    <div class="history-date">
                      {{ record.date | date:'mediumDate' }}
                    </div>
                    <div class="history-content">
                      <h4>{{ record.diagnosis }}</h4>
                      <p>{{ record.treatment }}</p>
                      <p class="history-notes" *ngIf="record.notes">{{ record.notes }}</p>
                      <p class="history-doctor">Dr. {{ record.doctorName }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Emergency Contact Tab -->
        <mat-tab label="Emergency Contact">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Emergency Contact Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid" *ngIf="patient.emergencyContact; else noEmergencyContact">
                  <div class="info-item">
                    <mat-icon>person</mat-icon>
                    <div>
                      <label>Name</label>
                      <p>{{ patient.emergencyContact.name }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>family_restroom</mat-icon>
                    <div>
                      <label>Relationship</label>
                      <p>{{ patient.emergencyContact.relationship }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>phone</mat-icon>
                    <div>
                      <label>Phone</label>
                      <p>{{ patient.emergencyContact.phone }}</p>
                    </div>
                  </div>
                </div>
                <ng-template #noEmergencyContact>
                  <p class="no-data">No emergency contact information provided</p>
                </ng-template>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Insurance Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid" *ngIf="patient.insuranceInfo; else noInsurance">
                  <div class="info-item">
                    <mat-icon>business</mat-icon>
                    <div>
                      <label>Provider</label>
                      <p>{{ patient.insuranceInfo.provider }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>badge</mat-icon>
                    <div>
                      <label>Policy Number</label>
                      <p>{{ patient.insuranceInfo.policyNumber }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>group</mat-icon>
                    <div>
                      <label>Group Number</label>
                      <p>{{ patient.insuranceInfo.groupNumber || 'N/A' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <mat-icon>event</mat-icon>
                    <div>
                      <label>Expiry Date</label>
                      <p>{{ (patient.insuranceInfo.expiryDate | date:'mediumDate') || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
                <ng-template #noInsurance>
                  <p class="no-data">No insurance information provided</p>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Appointments Tab -->
        <mat-tab label="Appointments">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Appointment History</mat-card-title>
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  Schedule Appointment
                </button>
              </mat-card-header>
              <mat-card-content>
                <p class="no-data">Appointment history will be displayed here</p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Prescriptions Tab -->
        <mat-tab label="Prescriptions">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Prescription History</mat-card-title>
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  New Prescription
                </button>
              </mat-card-header>
              <mat-card-content>
                <p class="no-data">Prescription history will be displayed here</p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading">
        <mat-spinner></mat-spinner>
        <p>Loading patient profile...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .patient-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .patient-avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .patient-info {
      flex: 1;
    }

    .patient-info h1 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .patient-id {
      margin: 0 0 8px 0;
      color: #7f8c8d;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .profile-tabs {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item mat-icon {
      color: #667eea;
      margin-top: 4px;
    }

    .info-item label {
      display: block;
      font-size: 12px;
      color: #7f8c8d;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .info-item p {
      margin: 0;
      color: #2c3e50;
      font-size: 16px;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .history-timeline {
      position: relative;
      padding-left: 32px;
    }

    .history-timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e0e0e0;
    }

    .history-item {
      position: relative;
      margin-bottom: 24px;
    }

    .history-item::before {
      content: '';
      position: absolute;
      left: -28px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #667eea;
      border: 2px solid white;
      box-shadow: 0 0 0 2px #667eea;
    }

    .history-date {
      font-size: 12px;
      color: #7f8c8d;
      margin-bottom: 8px;
    }

    .history-content h4 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .history-content p {
      margin: 0 0 4px 0;
      color: #555;
    }

    .history-notes {
      font-style: italic;
      color: #7f8c8d;
    }

    .history-doctor {
      font-size: 12px;
      color: #667eea;
      font-weight: 600;
    }

    .no-data {
      text-align: center;
      color: #7f8c8d;
      padding: 48px;
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
      .profile-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PatientProfileComponent implements OnInit, OnDestroy {
  @Input() patientId?: string;
  
  patient: Patient | null = null;
  medicalHistory: any[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.patientId || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPatientProfile(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPatientProfile(id: string): void {
    this.isLoading = true;
    
    this.patientService.getPatientById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.patient = patient;
          this.loadMedicalHistory(id);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading patient:', error);
          this.snackBar.open('Failed to load patient profile', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  private loadMedicalHistory(patientId: string): void {
    this.patientService.getPatientMedicalHistory(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.medicalHistory = history;
        },
        error: (error) => {
          console.error('Error loading medical history:', error);
        }
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'critical': return 'warn';
      case 'inactive': return '';
      default: return '';
    }
  }

  editPatient(): void {
    if (this.patient) {
      this.router.navigate(['/patients', this.patient.id, 'edit']);
    }
  }
}
