import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Appointment } from '../../../core/models/appointment.model';
import { Patient } from '../../../core/models/patient.model';
import { Prescription } from '../../../core/models/prescription.model';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { PrescriptionService } from '../../../core/services/prescription.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div
      class="dashboard-container"
      *ngIf="!isLoading && patient; else loadingOrErrorTemplate"
    >
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="dashboard-title">
            Welcome back, {{ patient.firstName }}!
          </h1>
          <p class="dashboard-subtitle">
            Manage your healthcare journey from one centralized location
          </p>
        </div>
        <div class="quick-stats">
          <div class="stat-card">
            <mat-icon class="stat-icon icon-success">event_available</mat-icon>
            <div class="stat-content">
              <div class="stat-number">{{ appointments.length }}</div>
              <div class="stat-label">Upcoming Appointments</div>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon icon-medical">medication</mat-icon>
            <div class="stat-content">
              <div class="stat-number">{{ prescriptions.length }}</div>
              <div class="stat-label">Active Prescriptions</div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <mat-card
          class="dashboard-card healthcare-card healthcare-card-primary slide-up"
          style="animation-delay: 0.1s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-medical"
                >event</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title">Appointments</mat-card-title>
              <mat-card-subtitle class="card-subtitle"
                >Schedule & manage visits</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              View and schedule your upcoming appointments with healthcare
              providers. Manage your visit history and upcoming consultations.
            </p>
            <div class="card-stats">
              <div class="stat-item">
                <mat-icon class="stat-item-icon">check_circle</mat-icon>
                <span>{{ confirmedAppointments }} confirmed</span>
              </div>
              <div class="stat-item">
                <mat-icon class="stat-item-icon icon-warning"
                  >schedule</mat-icon
                >
                <span>{{ pendingAppointments }} pending</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="appointments"
              class="btn-primary"
            >
              <mat-icon>arrow_forward</mat-icon>
              Manage Appointments
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card healthcare-card-secondary slide-up"
          style="animation-delay: 0.2s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-health"
                >psychology</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title"
                >AI Health Analysis</mat-card-title
              >
              <mat-card-subtitle class="card-subtitle"
                >Symptom assessment</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              Get AI-powered insights about your symptoms and health conditions.
              Receive personalized recommendations for your wellbeing.
            </p>
            <div class="card-features">
              <div class="feature-item">
                <mat-icon class="feature-icon icon-success">smart_toy</mat-icon>
                <span>AI-powered analysis</span>
              </div>
              <div class="feature-item">
                <mat-icon class="feature-icon icon-medical">security</mat-icon>
                <span>Privacy focused</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="analysis"
              class="btn-secondary"
            >
              <mat-icon>psychology</mat-icon>
              Start Analysis
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card healthcare-card-success slide-up"
          style="animation-delay: 0.3s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-success"
                >vaccines</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title">Prescriptions</mat-card-title>
              <mat-card-subtitle class="card-subtitle"
                >Medication management</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              View your prescriptions, track medication schedules, and set
              reminders. Keep your treatment plan organized and up-to-date.
            </p>
            <div class="card-medications">
              <div
                class="medication-item"
                *ngFor="
                  let medication of prescriptions | slice: 0 : 3;
                  let i = index
                "
              >
                <mat-icon class="medication-icon">pill</mat-icon>
                <div class="medication-info">
                  <div class="medication-name">
                    {{ medication.medications[0].name || 'Medication' }}
                  </div>
                  <div class="medication-schedule">
                    {{ medication.medications[0].frequency || 'Not specified' }}
                  </div>
                </div>
              </div>
              <div class="medication-item" *ngIf="prescriptions.length === 0">
                <mat-icon class="medication-icon">info</mat-icon>
                <div class="medication-info">
                  <div class="medication-name">No active prescriptions</div>
                  <div class="medication-schedule">
                    You'll see prescriptions here when available
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="prescriptions"
              class="btn-primary"
            >
              <mat-icon>vaccines</mat-icon>
              View Prescriptions
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card slide-up"
          style="animation-delay: 0.4s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-warning"
                >notifications</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title"
                >Health Notifications</mat-card-title
              >
              <mat-card-subtitle class="card-subtitle"
                >Stay informed</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              Receive important health reminders, test results, and updates from
              your healthcare providers. Never miss critical information.
            </p>
            <div class="notification-summary">
              <div class="notification-item urgent">
                <mat-icon class="notification-icon">priority_high</mat-icon>
                <span>1 urgent message</span>
              </div>
              <div class="notification-item info">
                <mat-icon class="notification-icon">info</mat-icon>
                <span>3 general updates</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="notifications"
              class="btn-outline"
            >
              <mat-icon>notifications</mat-icon>
              View Notifications
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>

    <ng-template #loadingOrErrorTemplate>
      <div class="loading" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
        <p>Loading patient profile...</p>
      </div>
      <div class="error-state" *ngIf="!isLoading && !patient">
        <mat-icon class="error-icon">info</mat-icon>
        <h2>Welcome to Your Health Dashboard</h2>
        <p>
          Your patient profile is being set up. Please contact your healthcare
          provider to complete your registration.
        </p>
        <p class="error-details">
          If you believe this is an error, please try refreshing the page or
          contact support.
        </p>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .dashboard-container {
        padding: var(--space-8);
        max-width: 1400px;
        margin: 0 auto;
        background: var(--gray-50);
        min-height: 100vh;
      }

      .dashboard-header {
        margin-bottom: var(--space-10);
      }

      .welcome-section {
        margin-bottom: var(--space-8);
      }

      .dashboard-title {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--gray-800);
        margin: 0 0 var(--space-3) 0;
        font-family: var(--font-family);
        line-height: 1.2;
      }

      .dashboard-subtitle {
        font-size: var(--font-size-lg);
        color: var(--gray-600);
        margin: 0;
        line-height: 1.6;
        max-width: 600px;
      }

      .quick-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-6);
      }

      .stat-card {
        background: white;
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        display: flex;
        gap: var(--space-4);
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        border: 1px solid var(--gray-200);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--primary-500);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -4px rgb(0 0 0 / 0.1);
      }

      .stat-card:hover::before {
        transform: scaleX(1);
      }

      .stat-card.primary::before {
        background: var(--primary-500);
      }

      .stat-card.success::before {
        background: var(--success-500);
      }

      .stat-card.info::before {
        background: var(--secondary-500);
      }

      .stat-icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.3s ease;
      }

      .stat-card.primary .stat-icon-wrapper {
        background: linear-gradient(
          135deg,
          var(--primary-100),
          var(--primary-200)
        );
      }

      .stat-card.success .stat-icon-wrapper {
        background: linear-gradient(
          135deg,
          var(--success-50),
          var(--success-100)
        );
      }

      .stat-card.info .stat-icon-wrapper {
        background: linear-gradient(
          135deg,
          var(--secondary-100),
          var(--secondary-200)
        );
      }

      .stat-card:hover .stat-icon-wrapper {
        transform: scale(1.1) rotate(5deg);
      }

      .stat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stat-card.primary .stat-icon {
        color: var(--primary-600);
      }

      .stat-card.success .stat-icon {
        color: var(--success-600);
      }

      .stat-card.info .stat-icon {
        color: var(--secondary-600);
      }

      .stat-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-number {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--gray-900);
        line-height: 1;
      }

      .stat-change {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-size-xs);
        color: var(--gray-500);
      }

      .stat-change mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .stat-change.positive {
        color: var(--success-600);
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: var(--space-6);
      }

      .dashboard-card {
        border-radius: var(--radius-xl);
        overflow: hidden;
        border: none;
        transition: all 0.3s ease;
        min-height: 320px;
        display: flex;
        flex-direction: column;
      }

      .dashboard-card:hover {
        transform: translateY(-4px);
      }

      .card-icon-container {
        background: linear-gradient(
          135deg,
          var(--primary-50) 0%,
          var(--secondary-50) 100%
        );
        border-radius: var(--radius-lg);
        padding: var(--space-2);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        margin-right: var(--space-4);
      }

      .card-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .card-title-section {
        flex: 1;
      }

      .card-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--gray-800);
        margin: 0 0 var(--space-1) 0;
      }

      .card-subtitle {
        font-size: var(--font-size-sm);
        color: var(--gray-500);
        margin: 0;
        font-weight: 400;
      }

      .card-content {
        flex: 1;
        padding: var(--space-6) var(--space-6) var(--space-4) var(--space-6);
      }

      .card-description {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        line-height: 1.6;
        margin: 0 0 var(--space-4) 0;
      }

      .card-stats {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--gray-700);
      }

      .stat-item-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .card-features {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--gray-700);
      }

      .feature-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .card-medications {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .medication-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        background: var(--gray-50);
        border-radius: var(--radius-md);
      }

      .medication-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--success-600);
      }

      .medication-info {
        flex: 1;
      }

      .medication-name {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--gray-800);
      }

      .medication-schedule {
        font-size: var(--font-size-xs);
        color: var(--gray-500);
      }

      .notification-summary {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .notification-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--gray-700);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        background: var(--gray-50);
      }

      .notification-item.urgent {
        background: var(--error-50);
        border-left: 3px solid var(--error-500);
      }

      .notification-item.info {
        background: var(--primary-50);
        border-left: 3px solid var(--primary-500);
      }

      .notification-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .card-actions {
        padding: var(--space-4) var(--space-6) var(--space-6) var(--space-6);
        gap: var(--space-2);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .dashboard-container {
          padding: var(--space-4);
        }

        .dashboard-title {
          font-size: var(--font-size-2xl);
        }

        .dashboard-grid {
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        .quick-stats {
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }

        .stat-card {
          padding: var(--space-4);
        }
      }

      @media (max-width: 480px) {
        .dashboard-title {
          font-size: var(--font-size-xl);
        }

        .dashboard-subtitle {
          font-size: var(--font-size-base);
        }
      }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        gap: 16px;
      }

      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        gap: 24px;
        text-align: center;
        max-width: 600px;
        margin: 0 auto;
      }

      .error-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--gray-400);
      }

      .error-state h2 {
        font-size: var(--font-size-2xl);
        font-weight: 600;
        color: var(--gray-800);
        margin: 0;
      }

      .error-state p {
        font-size: var(--font-size-base);
        color: var(--gray-600);
        line-height: 1.6;
        margin: 0;
      }

      .error-details {
        font-size: var(--font-size-sm) !important;
        color: var(--gray-500) !important;
        font-style: italic;
      }
    `,
  ],
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  patient: Patient | null = null;
  appointments: Appointment[] = [];
  prescriptions: Prescription[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  get confirmedAppointments(): number {
    return this.appointments.filter((a) => a.status === 'CONFIRMED').length;
  }

  get pendingAppointments(): number {
    return this.appointments.filter((a) => a.status === 'SCHEDULED').length;
  }

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private appointmentsService: AppointmentsService,
    private prescriptionService: PrescriptionService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user && user.role === 'PATIENT') {
          this.loadPatientData();
        } else {
          this.isLoading = false;
        }
      });
  }

  private loadPatientData(): void {
    // Load patient profile
    this.patientService
      .getMyDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.patient = patient;
        },
        error: (error) => {
          console.error('Error loading patient dashboard:', error);
          this.patient = null;
          this.isLoading = false;
        },
      });

    // Load appointments
    this.appointmentsService
      .getMyAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments || [];
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.appointments = [];
          this.checkLoadingComplete();
        },
      });

    // Load prescriptions
    this.prescriptionService
      .getMyPrescriptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prescriptions) => {
          this.prescriptions = prescriptions || [];
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading prescriptions:', error);
          this.prescriptions = [];
          this.checkLoadingComplete();
        },
      });
  }

  private checkLoadingComplete(): void {
    // Check if all data has been loaded
    if (
      this.patient !== null &&
      this.appointments.length >= 0 &&
      this.prescriptions.length >= 0
    ) {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}
