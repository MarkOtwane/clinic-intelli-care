import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { AiAnalysisService } from '../../../core/services/ai-analysis.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorsService } from '../../../core/services/doctors.service';
import { AvailabilityDialogComponent } from './availability-dialog.component';

// Models
import { AIAnalysis } from '../../../core/models/ai-analysis.model';
import {
  Appointment,
  AppointmentStatus,
} from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';

interface PatientCase {
  id: string;
  patientId: string;
  patient?: {
    name?: string;
    age?: number;
    gender?: string;
    phone?: string;
  };
  reason?: string;
  status: string;
  date?: Date | string;
  time?: string;
  symptoms?: {
    symptoms: string[];
  };
  confidence: number;
}

interface DoctorDashboard {
  pendingCases: PatientCase[];
  patientAnalyses: any[];
  todayAppointments: Appointment[];
  weeklyStats: {
    totalAppointments: number;
    completedConsultations: number;
    newPatients: number;
    aiAnalysesReviewed: number;
  };
  recentActivity: {
    type: 'appointment' | 'analysis' | 'prescription' | 'blog';
    title: string;
    description: string;
    timestamp: Date;
    status?: string;
  }[];
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    // Material modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="doctor-dashboard-container">
      <!-- Professional Header -->
      <div class="professional-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="doctor-name">
              Dr. {{ currentUser?.firstName }} {{ currentUser?.lastName }}
            </h1>
            <p class="header-subtitle">Practice Management Dashboard</p>
          </div>
          <div class="header-right">
            <div class="date-time">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ currentDate | date: 'EEEE, MMMM d, y' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Metrics Banner -->
      <div class="kpi-banner">
        <div class="kpi-card pending">
          <div class="kpi-icon">
            <mat-icon>hourglass_empty</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-value">
              {{ dashboardData?.pendingCases?.length || 0 }}
            </div>
            <div class="kpi-label">Cases Pending</div>
          </div>
        </div>

        <div class="kpi-card scheduled">
          <div class="kpi-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-value">
              {{ dashboardData?.todayAppointments?.length || 0 }}
            </div>
            <div class="kpi-label">Today's Schedule</div>
          </div>
        </div>

        <div class="kpi-card patients">
          <div class="kpi-icon">
            <mat-icon>group</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-value">
              {{ dashboardData?.weeklyStats?.totalAppointments || 0 }}
            </div>
            <div class="kpi-label">Weekly Total</div>
          </div>
        </div>

        <div class="kpi-card analytics">
          <div class="kpi-icon">
            <mat-icon>bar_chart</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-value">
              {{ dashboardData?.weeklyStats?.newPatients || 0 }}
            </div>
            <div class="kpi-label">New Patients</div>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <button
          mat-raised-button
          color="primary"
          (click)="openAvailabilityDialog()"
        >
          <mat-icon>edit_calendar</mat-icon>
          Manage Schedule
        </button>
        <button mat-raised-button routerLink="/doctor/patients">
          <mat-icon>people</mat-icon>
          Patient Records
        </button>
        <button mat-raised-button routerLink="/doctor/blogs">
          <mat-icon>create</mat-icon>
          Write Article
        </button>
        <button mat-raised-button routerLink="/doctor/analytics">
          <mat-icon>trending_up</mat-icon>
          Analytics
        </button>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content">
        <!-- Left Column: Cases & Appointments -->
        <div class="left-column">
          <!-- Pending Cases Kanban -->
          <div class="section-container">
            <div class="section-header">
              <h2>
                <mat-icon>assignment</mat-icon>
                Pending Cases
              </h2>
              <span class="badge">{{
                dashboardData?.pendingCases?.length || 0
              }}</span>
            </div>
            <div class="cases-board">
              <div
                *ngIf="!dashboardData?.pendingCases?.length"
                class="empty-board"
              >
                <mat-icon>check_circle</mat-icon>
                <p>All cases reviewed</p>
              </div>
              <div
                class="case-card"
                *ngFor="let case of dashboardData?.pendingCases | slice: 0 : 5"
              >
                <div class="case-header-mini">
                  <span class="case-id">{{
                    case.patient?.name || 'Patient'
                  }}</span>
                  <mat-chip
                    [color]="getConfidenceColor(case.confidence)"
                    selected
                  >
                    {{ case.status }}
                  </mat-chip>
                </div>
                <div class="case-body">
                  <p class="patient-name">
                    <mat-icon class="small-icon">person</mat-icon>
                    Age: {{ case.patient?.age || 'N/A' }}
                    <span *ngIf="case.patient?.gender" class="separator"
                      >•</span
                    >
                    {{ case.patient?.gender || '' }}
                  </p>
                  <p class="patient-contact" *ngIf="case.patient?.phone">
                    <mat-icon class="small-icon">phone</mat-icon>
                    {{ case.patient?.phone }}
                  </p>
                  <div class="symptoms-tags" *ngIf="case.reason">
                    <span class="tag">{{ case.reason }}</span>
                  </div>
                  <p class="case-time" *ngIf="case.date">
                    <mat-icon class="small-icon">schedule</mat-icon>
                    {{ case.date | date: 'MMM d' }} at {{ case.time }}
                  </p>
                </div>
                <div class="case-actions">
                  <button mat-icon-button (click)="viewAppointment(case)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="updateStatus(case)">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Appointments -->
          <div class="section-container">
            <div class="section-header">
              <h2>
                <mat-icon>today</mat-icon>
                Today's Schedule
              </h2>
              <span class="time-info">{{ currentDate | date: 'EEEE' }}</span>
            </div>
            <div class="appointments-timeline">
              <div
                *ngIf="!dashboardData?.todayAppointments?.length"
                class="empty-state-inline"
              >
                <p>No appointments scheduled</p>
              </div>
              <div
                class="appointment-card"
                *ngFor="
                  let apt of dashboardData?.todayAppointments | slice: 0 : 4
                "
              >
                <div class="time-slot">
                  <div class="time">{{ apt.startTime }}</div>
                </div>
                <div class="apt-details">
                  <div class="apt-patient">
                    {{ apt.reason || 'Appointment' }}
                  </div>
                  <div class="apt-type">{{ apt.status || 'Scheduled' }}</div>
                  <mat-chip
                    [color]="getStatusColor(apt.status)"
                    selected
                    size="small"
                  >
                    {{ apt.status }}
                  </mat-chip>
                </div>
                <div class="apt-menu">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewAppointment(apt)">
                      <mat-icon>visibility</mat-icon>
                      <span>View</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(apt)">
                      <mat-icon>edit</mat-icon>
                      <span>Update</span>
                    </button>
                    <button mat-menu-item (click)="createPrescription(apt)">
                      <mat-icon>medication</mat-icon>
                      <span>Prescription</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Analytics & Activity -->
        <div class="right-column">
          <!-- Performance Metrics -->
          <div class="section-container">
            <div class="section-header">
              <h2>
                <mat-icon>assessment</mat-icon>
                Weekly Performance
              </h2>
            </div>
            <div class="metrics-list">
              <div class="metric-row">
                <span class="metric-name">Total Appointments</span>
                <span class="metric-value">{{
                  dashboardData?.weeklyStats?.totalAppointments || 0
                }}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Completed Consultations</span>
                <span class="metric-value">{{
                  dashboardData?.weeklyStats?.completedConsultations || 0
                }}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">New Patients</span>
                <span class="metric-value">{{
                  dashboardData?.weeklyStats?.newPatients || 0
                }}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">AI Cases Reviewed</span>
                <span class="metric-value">{{
                  dashboardData?.weeklyStats?.aiAnalysesReviewed || 0
                }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity Feed -->
          <div class="section-container">
            <div class="section-header">
              <h2>
                <mat-icon>history</mat-icon>
                Activity Feed
              </h2>
            </div>
            <div class="activity-feed">
              <div
                *ngIf="!dashboardData?.recentActivity?.length"
                class="empty-state-inline"
              >
                <p>No recent activity</p>
              </div>
              <div
                class="activity-entry"
                *ngFor="
                  let activity of dashboardData?.recentActivity | slice: 0 : 5
                "
              >
                <div
                  class="activity-icon"
                  [ngClass]="'activity-' + activity.type"
                >
                  <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                </div>
                <div class="activity-info">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-desc">{{ activity.description }}</div>
                  <div class="activity-time">
                    {{ activity.timestamp | date: 'short' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .doctor-dashboard-container {
        background: #f5f7fa;
        min-height: 100vh;
        padding: 20px;
      }

      .professional-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 12px;
        margin-bottom: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
      }

      .header-left h1 {
        font-size: 28px;
        margin: 0 0 5px 0;
        font-weight: 600;
      }

      .header-subtitle {
        margin: 0;
        opacity: 0.9;
        font-size: 14px;
      }

      .date-time {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .kpi-banner {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
        max-width: 1400px;
        margin-left: auto;
        margin-right: auto;
      }

      .kpi-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        display: flex;
        gap: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
      }

      .kpi-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      }

      .kpi-card.pending {
        border-left: 4px solid #e74c3c;
      }

      .kpi-card.scheduled {
        border-left: 4px solid #3498db;
      }

      .kpi-card.patients {
        border-left: 4px solid #2ecc71;
      }

      .kpi-card.analytics {
        border-left: 4px solid #f39c12;
      }

      .kpi-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .kpi-card.pending .kpi-icon {
        background: #ffe0e0;
        color: #e74c3c;
      }

      .kpi-card.scheduled .kpi-icon {
        background: #e3f2fd;
        color: #3498db;
      }

      .kpi-card.patients .kpi-icon {
        background: #e8f5e9;
        color: #2ecc71;
      }

      .kpi-card.analytics .kpi-icon {
        background: #fff3e0;
        color: #f39c12;
      }

      .kpi-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .kpi-value {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
      }

      .kpi-label {
        font-size: 12px;
        color: #7f8c8d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 4px;
      }

      .action-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 30px;
        max-width: 1400px;
        margin-left: auto;
        margin-right: auto;
        flex-wrap: wrap;
      }

      .action-bar button {
        flex: 1;
        min-width: 180px;
      }

      .main-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 30px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .left-column,
      .right-column {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      .section-container {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e8ecf1;
      }

      .section-header h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        font-size: 18px;
        color: #2c3e50;
      }

      .section-header h2 mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: #667eea;
      }

      .badge {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      .time-info {
        font-size: 14px;
        color: #7f8c8d;
      }

      .cases-board {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .empty-board {
        text-align: center;
        padding: 40px 20px;
        color: #7f8c8d;
      }

      .empty-board mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 10px;
        color: #bdc3c7;
      }

      .case-card {
        border: 1px solid #e8ecf1;
        border-radius: 8px;
        padding: 16px;
        background: #fafbfc;
        transition: all 0.2s ease;
      }

      .case-card:hover {
        background: #f0f4f8;
        border-color: #667eea;
      }

      .case-header-mini {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .case-id {
        font-weight: 600;
        font-size: 14px;
        color: #2c3e50;
      }

      .case-body {
        margin-bottom: 12px;
      }

      .patient-name {
        margin: 0 0 8px 0;
        font-weight: 500;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }

      .patient-contact {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #7f8c8d;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .case-time {
        margin: 8px 0 0 0;
        font-size: 13px;
        color: #667eea;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }

      .small-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .separator {
        margin: 0 4px;
        color: #bdc3c7;
      }

      .symptoms-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tag {
        background: #e8eef7;
        color: #667eea;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
      }

      .tag.more {
        background: #667eea;
        color: white;
      }

      .case-actions {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }

      .appointments-timeline {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .empty-state-inline {
        text-align: center;
        padding: 40px 20px;
        color: #7f8c8d;
      }

      .appointment-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid #e8ecf1;
        border-radius: 8px;
        background: #fafbfc;
        transition: all 0.2s ease;
      }

      .appointment-card:hover {
        background: #f0f4f8;
        border-color: #667eea;
      }

      .time-slot {
        min-width: 70px;
        text-align: center;
      }

      .time {
        font-weight: 600;
        font-size: 16px;
        color: #667eea;
      }

      .apt-details {
        flex: 1;
      }

      .apt-patient {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
      }

      .apt-type {
        font-size: 13px;
        color: #7f8c8d;
        margin-bottom: 8px;
      }

      .apt-menu {
        text-align: right;
      }

      .metrics-list {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .metric-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid #e8ecf1;
      }

      .metric-row:last-child {
        border-bottom: none;
      }

      .metric-name {
        color: #7f8c8d;
        font-size: 14px;
      }

      .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: #667eea;
      }

      .activity-feed {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .activity-entry {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #fafbfc;
        transition: all 0.2s ease;
      }

      .activity-entry:hover {
        background: #f0f4f8;
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .activity-icon mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .activity-appointment {
        background: #e3f2fd;
        color: #3498db;
      }

      .activity-analysis {
        background: #f3e5f5;
        color: #9c27b0;
      }

      .activity-prescription {
        background: #e8f5e9;
        color: #2ecc71;
      }

      .activity-blog {
        background: #fff3e0;
        color: #f39c12;
      }

      .activity-info {
        flex: 1;
        min-width: 0;
      }

      .activity-title {
        margin: 0 0 4px 0;
        font-weight: 600;
        font-size: 14px;
        color: #2c3e50;
      }

      .activity-desc {
        margin: 0 0 4px 0;
        font-size: 13px;
        color: #7f8c8d;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .activity-time {
        margin: 0;
        font-size: 12px;
        color: #bdc3c7;
      }

      @media (max-width: 1024px) {
        .main-content {
          grid-template-columns: 1fr;
        }

        .action-bar button {
          min-width: 120px;
        }
      }

      @media (max-width: 599px) {
        .professional-header {
          padding: 20px;
        }

        .header-content {
          flex-direction: column;
          text-align: center;
        }

        .header-left h1 {
          font-size: 24px;
        }

        .date-time {
          margin-top: 10px;
          justify-content: center;
        }

        .kpi-banner {
          grid-template-columns: 1fr;
        }

        .action-bar {
          flex-direction: column;
        }

        .action-bar button {
          min-width: auto;
          width: 100%;
        }
      }
    `,
  ],
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dashboardData: DoctorDashboard | null = null;
  patientAnalyses: any[] = [];
  isLoading = false;
  currentDate = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private aiAnalysisService: AiAnalysisService,
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();

    // Subscribe to user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.loadDashboardData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Load doctor dashboard data from the new endpoint
    this.doctorsService
      .getDoctorDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboardData: any) => {
          // Map the backend response to our dashboard structure
          const todayAppointments = dashboardData.upcomingAppointments.filter(
            (a: any) =>
              new Date(a.date).toDateString() === new Date().toDateString(),
          );

          // Create pending cases from upcoming appointments (real patient data)
          // These represent open cases/appointments needing attention
          const pendingCases = dashboardData.upcomingAppointments
            .filter((a: any) => a.status !== 'COMPLETED')
            .slice(0, 5)
            .map((appointment: any) => ({
              id: appointment.id,
              patientId: appointment.patientId,
              patient: appointment.patient,
              reason: appointment.reason,
              status: appointment.status,
              date: appointment.date,
              time: appointment.startTime,
              symptoms: {
                symptoms: appointment.reason
                  ? appointment.reason.split(',').map((s: string) => s.trim())
                  : [],
              },
              confidence: 85, // Default confidence for appointment cases
            }));

          // Calculate weekly stats from the available data
          const weeklyStats = {
            totalAppointments: dashboardData.stats.totalAppointments,
            completedConsultations: dashboardData.recentAppointments.length,
            newPatients: dashboardData.stats.totalPatients,
            aiAnalysesReviewed: 0,
          };

          // Build recent activity from recent appointments
          const recentActivity = dashboardData.recentAppointments
            .slice(0, 5)
            .map((apt: any) => ({
              type: 'appointment' as const,
              title: `Completed with ${apt.patient?.name || 'Patient'}`,
              description: apt.reason || 'General consultation',
              timestamp: new Date(apt.date),
              status: apt.status,
            }));

          if (
            recentActivity.length === 0 &&
            dashboardData.upcomingAppointments.length > 0
          ) {
            recentActivity.push({
              type: 'appointment' as const,
              title: `Upcoming appointment with ${dashboardData.upcomingAppointments[0].patient?.name || 'patient'}`,
              description:
                dashboardData.upcomingAppointments[0].reason ||
                'Scheduled consultation',
              timestamp: new Date(dashboardData.upcomingAppointments[0].date),
            });
          }

          this.dashboardData = {
            pendingCases,
            patientAnalyses: [],
            todayAppointments,
            weeklyStats,
            recentActivity,
          };

          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Failed to load dashboard data:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to load dashboard data', 'Close', {
            duration: 3000,
          });
        },
      });

    // Load patient analyses for this doctor
    this.appointmentsService
      .getPatientAnalysesForDoctor()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analyses) => {
          this.patientAnalyses = analyses;
          if (this.dashboardData) {
            this.dashboardData.patientAnalyses = analyses;
            this.dashboardData.weeklyStats.aiAnalysesReviewed = analyses.length;
          }
        },
        error: () => {
          this.patientAnalyses = [];
        },
      });
  }

  reviewCase(analysis: AIAnalysis): void {
    this.snackBar.open(`Reviewing case ${analysis.id}`, 'Close', {
      duration: 2000,
    });
    // Navigate to detailed case review
  }

  scheduleAppointment(analysis: AIAnalysis): void {
    this.snackBar.open('Opening appointment scheduling...', 'Close', {
      duration: 2000,
    });
    // Open appointment scheduling dialog with pre-filled patient info
  }

  viewAppointment(appointment: any): void {
    this.snackBar.open(
      `Viewing appointment for ${appointment.patient?.name || appointment.patientId}`,
      'Close',
      { duration: 2000 },
    );
    // Navigate to appointment details
  }

  updateStatus(appointment: any): void {
    const newStatus =
      appointment.status === AppointmentStatus.SCHEDULED ||
      appointment.status === 'SCHEDULED'
        ? AppointmentStatus.CONFIRMED
        : AppointmentStatus.COMPLETED;

    this.appointmentsService
      .updateAppointment(appointment.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Appointment status updated', 'Close', {
            duration: 3000,
          });
          this.loadDashboardData();
        },
        error: () => {
          this.snackBar.open('Failed to update appointment status', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  createPrescription(appointment: Appointment): void {
    this.snackBar.open('Opening prescription form...', 'Close', {
      duration: 2000,
    });
    // Open prescription creation dialog
  }

  openAvailabilityDialog(): void {
    const dialogRef = this.dialog.open(AvailabilityDialogComponent, {
      width: '600px',
      data: { doctorId: this.currentUser?.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Availability updated successfully', 'Close', {
          duration: 3000,
        });
        // Reload dashboard data if needed
      }
    });
  }

  viewFullAnalysis(analysis: any): void {
    this.snackBar.open(
      `Viewing full analysis for ${analysis.patient?.name || 'patient'}`,
      'Close',
      { duration: 2000 },
    );
    // Navigate to detailed analysis view
  }

  scheduleFollowUp(analysis: any): void {
    this.snackBar.open(
      `Scheduling follow-up for ${analysis.patient?.name || 'patient'}`,
      'Close',
      { duration: 2000 },
    );
    // Open appointment scheduling dialog with patient info pre-filled
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'warn';
    if (confidence >= 60) return 'accent';
    return 'primary';
  }

  getProbabilityColor(probability: number): string {
    if (probability >= 80) return 'warn';
    if (probability >= 60) return 'accent';
    return 'primary';
  }

  getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'primary';
      case AppointmentStatus.CONFIRMED:
        return 'accent';
      case AppointmentStatus.SCHEDULED:
        return 'warn';
      default:
        return '';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'appointment':
        return 'primary';
      case 'analysis':
        return 'accent';
      case 'prescription':
        return 'warn';
      case 'blog':
        return 'primary';
      default:
        return '';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'appointment':
        return 'event';
      case 'analysis':
        return 'analytics';
      case 'prescription':
        return 'medication';
      case 'blog':
        return 'article';
      default:
        return 'info';
    }
  }
}
