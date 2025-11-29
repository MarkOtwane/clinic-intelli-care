import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Doctor } from '../../../core/models/doctor.model';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
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
      *ngIf="!isLoading && doctor; else loadingTemplate"
    >
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="dashboard-title">Welcome back, Dr. {{ doctor.name }}!</h1>
          <p class="dashboard-subtitle">
            Manage your practice and connect with patients from your centralized
            dashboard
          </p>
        </div>
        <div class="quick-stats">
          <div class="stat-card">
            <mat-icon class="stat-icon icon-success">event_available</mat-icon>
            <div class="stat-content">
              <div class="stat-number">{{ stats?.todayAppointments || 0 }}</div>
              <div class="stat-label">Today's Appointments</div>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon icon-medical">people</mat-icon>
            <div class="stat-content">
              <div class="stat-number">{{ stats?.totalPatients || 0 }}</div>
              <div class="stat-label">Total Patients</div>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon icon-warning">assignment</mat-icon>
            <div class="stat-content">
              <div class="stat-number">
                {{ stats?.pendingPrescriptions || 0 }}
              </div>
              <div class="stat-label">Pending Prescriptions</div>
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
              View and manage your upcoming appointments, reschedule visits, and
              track patient consultations. Stay organized with your practice
              schedule.
            </p>
            <div class="card-stats">
              <div class="stat-item">
                <mat-icon class="stat-item-icon">today</mat-icon>
                <span>{{ stats?.todayAppointments || 0 }} today</span>
              </div>
              <div class="stat-item">
                <mat-icon class="stat-item-icon icon-warning"
                  >schedule</mat-icon
                >
                <span
                  >{{ stats?.totalAppointments || 0 }} total this month</span
                >
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="/doctor/appointments"
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
                >people</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title"
                >Patient Records</mat-card-title
              >
              <mat-card-subtitle class="card-subtitle"
                >Medical history & profiles</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              Access patient medical records, update treatment plans, and
              maintain comprehensive health documentation for better care
              delivery.
            </p>
            <div class="card-features">
              <div class="feature-item">
                <mat-icon class="feature-icon icon-success"
                  >folder_shared</mat-icon
                >
                <span>{{ stats?.totalPatients || 0 }} active patients</span>
              </div>
              <div class="feature-item">
                <mat-icon class="feature-icon icon-medical">history</mat-icon>
                <span>Medical history tracking</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="/doctor/patients"
              class="btn-secondary"
            >
              <mat-icon>people</mat-icon>
              View Patients
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
              Create and manage prescriptions, track medication refills, and
              ensure patients receive appropriate treatment plans.
            </p>
            <div class="prescription-alerts">
              <div class="alert-item">
                <mat-icon class="alert-icon">warning</mat-icon>
                <div class="alert-info">
                  <div class="alert-title">
                    {{ stats?.pendingPrescriptions || 0 }} pending reviews
                  </div>
                  <div class="alert-desc">Prescriptions awaiting approval</div>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="/doctor/prescriptions"
              class="btn-primary"
            >
              <mat-icon>vaccines</mat-icon>
              Manage Prescriptions
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card slide-up"
          style="animation-delay: 0.4s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-blog"
                >article</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title">Medical Blog</mat-card-title>
              <mat-card-subtitle class="card-subtitle"
                >Share knowledge & insights</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              Write and publish medical articles, share health tips, and
              contribute to the medical community. Help educate patients and
              colleagues.
            </p>
            <div class="blog-stats">
              <div class="blog-item">
                <mat-icon class="blog-icon">edit</mat-icon>
                <span>Draft new articles</span>
              </div>
              <div class="blog-item">
                <mat-icon class="blog-icon">publish</mat-icon>
                <span>Publish content</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="/doctor/blog/create"
              class="btn-blog"
            >
              <mat-icon>create</mat-icon>
              Write Blog Post
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card slide-up"
          style="animation-delay: 0.5s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-warning"
                >notifications</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title">Notifications</mat-card-title>
              <mat-card-subtitle class="card-subtitle"
                >Stay updated</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              Receive important updates about patient appointments, prescription
              renewals, and system notifications. Never miss critical
              information.
            </p>
            <div class="notification-summary">
              <div class="notification-item urgent">
                <mat-icon class="notification-icon">priority_high</mat-icon>
                <span>2 urgent patient updates</span>
              </div>
              <div class="notification-item info">
                <mat-icon class="notification-icon">info</mat-icon>
                <span>5 general notifications</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="/doctor/notifications"
              class="btn-outline"
            >
              <mat-icon>notifications</mat-icon>
              View Notifications
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card slide-up"
          style="animation-delay: 0.6s"
        >
          <mat-card-header>
            <div class="card-icon-container">
              <mat-icon mat-card-avatar class="card-icon icon-analytics"
                >analytics</mat-icon
              >
            </div>
            <div class="card-title-section">
              <mat-card-title class="card-title"
                >Practice Analytics</mat-card-title
              >
              <mat-card-subtitle class="card-subtitle"
                >Performance insights</mat-card-subtitle
              >
            </div>
          </mat-card-header>
          <mat-card-content class="card-content">
            <p class="card-description">
              Monitor your practice performance, patient satisfaction ratings,
              and treatment outcomes. Make data-driven decisions to improve care
              quality.
            </p>
            <div class="analytics-preview">
              <div class="metric">
                <div class="metric-value">{{ doctor.rating || 0 }}/5</div>
                <div class="metric-label">Patient Rating</div>
              </div>
              <div class="metric">
                <div class="metric-value">
                  {{ stats?.totalAppointments || 0 }}
                </div>
                <div class="metric-label">Monthly Appointments</div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button
              mat-raised-button
              routerLink="/doctor/analytics"
              class="btn-analytics"
            >
              <mat-icon>analytics</mat-icon>
              View Analytics
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading">
        <mat-spinner></mat-spinner>
        <p>Loading doctor profile...</p>
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
        font-weight: 400;
        max-width: 600px;
      }

      .quick-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-4);
        margin-top: var(--space-6);
      }

      .stat-card {
        background: white;
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--gray-200);
        display: flex;
        align-items: center;
        gap: var(--space-4);
        transition: all 0.2s ease;
      }

      .stat-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
      }

      .stat-number {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--gray-800);
        line-height: 1;
      }

      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        margin-top: var(--space-1);
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

      .prescription-alerts {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .alert-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        background: var(--warning-50);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--warning-500);
      }

      .alert-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--warning-600);
      }

      .alert-info {
        flex: 1;
      }

      .alert-title {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--gray-800);
      }

      .alert-desc {
        font-size: var(--font-size-xs);
        color: var(--gray-500);
      }

      .blog-stats {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .blog-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--gray-700);
      }

      .blog-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--primary-600);
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

      .analytics-preview {
        display: flex;
        justify-content: space-around;
        gap: var(--space-4);
      }

      .metric {
        text-align: center;
      }

      .metric-value {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--gray-800);
      }

      .metric-label {
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin-top: var(--space-1);
      }

      .card-actions {
        padding: var(--space-4) var(--space-6) var(--space-6) var(--space-6);
        gap: var(--space-2);
      }

      .btn-blog {
        background-color: var(--primary-600);
        color: white;
      }

      .btn-blog:hover {
        background-color: var(--primary-700);
      }

      .btn-analytics {
        background-color: var(--secondary-600);
        color: white;
      }

      .btn-analytics:hover {
        background-color: var(--secondary-700);
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

        .analytics-preview {
          flex-direction: column;
          gap: var(--space-2);
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

      .icon-blog {
        color: var(--primary-600);
      }

      .icon-analytics {
        color: var(--secondary-600);
      }
    `,
  ],
})
export class DoctorDashboardComponent implements OnInit {
  doctor: Doctor | null = null;
  stats: {
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingPrescriptions: number;
  } | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user && user.role === 'DOCTOR') {
        const doctorId = user.doctorId || user.id;
        this.doctorService.getDoctorById(doctorId).subscribe({
          next: (doctor) => {
            this.doctor = doctor;
            this.loadStats(doctorId);
          },
          error: (error) => {
            console.error('Error loading doctor:', error);
            this.isLoading = false;
          },
        });
      } else {
        this.isLoading = false;
      }
    });
  }

  private loadStats(doctorId: string): void {
    this.doctorService.getDoctorStats(doctorId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      },
    });
  }
}
