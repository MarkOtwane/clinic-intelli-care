import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { AiAnalysisService } from '../../../core/services/ai-analysis.service';
import { DoctorsService, Doctor } from '../../../core/services/doctors.service';
import { AppointmentsService } from '../../../core/services/appointments.service';

// Models
import { AIAnalysis, AnalysisStatus } from '../../../core/models/ai-analysis.model';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';

interface DoctorDashboard {
  pendingCases: AIAnalysis[];
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
    <div class="doctor-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back, Dr. {{ currentUser?.firstName }}!</h1>
          <p class="subtitle">Here's your practice overview for today</p>
        </div>
        <div class="quick-actions">
          <button mat-raised-button color="primary" (click)="openAvailabilityDialog()">
            <mat-icon>schedule</mat-icon>
            Manage Availability
          </button>
          <button mat-raised-button color="accent" routerLink="/doctor/blogs">
            <mat-icon>edit_note</mat-icon>
            Write Blog
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card pending-cases">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="warn">pending_actions</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.pendingCases?.length || 0 }}</h3>
                <p>Pending AI Cases</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card today-appointments">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">event</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.todayAppointments?.length || 0 }}</h3>
                <p>Today's Appointments</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card weekly-consultations">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.weeklyStats?.completedConsultations || 0 }}</h3>
                <p>This Week's Consultations</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card reviews">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="warn">review</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.weeklyStats?.aiAnalysesReviewed || 0 }}</h3>
                <p>AI Reviews This Week</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content Tabs -->
      <mat-tab-group class="dashboard-tabs">
        <!-- AI Cases Tab -->
        <mat-tab label="AI Cases">
          <div class="tab-content">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Patient Cases from AI Analysis</mat-card-title>
                <mat-card-subtitle>Review and respond to AI-suggested patient cases</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="cases-grid" *ngIf="dashboardData?.pendingCases?.length; else noCases">
                  <mat-card class="case-card" *ngFor="let case of dashboardData?.pendingCases">
                    <mat-card-header>
                      <div class="case-header">
                        <mat-card-title>Patient Analysis #{{ case.id.slice(-8) }}</mat-card-title>
                        <mat-chip [color]="getConfidenceColor(case.confidence)" selected>
                          {{ case.confidence }}% confidence
                        </mat-chip>
                      </div>
                      <mat-card-subtitle>
                        Received: {{ case.createdAt | date:'short' }}
                      </mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div class="case-details">
                        <div class="symptoms-section">
                          <h4>Symptoms Reported:</h4>
                          <mat-chip-set>
                            <mat-chip *ngFor="let symptom of case.symptoms.symptoms">
                              {{ symptom }}
                            </mat-chip>
                          </mat-chip-set>
                        </div>
                        
                        <div class="predictions-section">
                          <h4>AI Predictions:</h4>
                          <div class="prediction-item" *ngFor="let prediction of case.predictions">
                            <div class="prediction-header">
                              <span class="disease-name">{{ prediction.disease }}</span>
                              <mat-chip [color]="getProbabilityColor(prediction.probability)">
                                {{ prediction.probability }}%
                              </mat-chip>
                            </div>
                          </div>
                        </div>

                        <div class="severity-info">
                          <mat-chip>{{ case.symptoms.severity }} severity</mat-chip>
                          <mat-chip>Duration: {{ case.symptoms.duration }} days</mat-chip>
                        </div>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions>
                      <button mat-button color="primary" (click)="reviewCase(case)">
                        <mat-icon>visibility</mat-icon>
                        Review Case
                      </button>
                      <button mat-button color="accent" (click)="scheduleAppointment(case)">
                        <mat-icon>event</mat-icon>
                        Schedule Appointment
                      </button>
                      <button mat-button (click)="dismissCase(case)">
                        <mat-icon>close</mat-icon>
                        Dismiss
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
                
                <ng-template #noCases>
                  <div class="empty-state">
                    <mat-icon>check_circle</mat-icon>
                    <h3>No pending AI cases</h3>
                    <p>All patient analyses have been reviewed</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Appointments Tab -->
        <mat-tab label="Appointments">
          <div class="tab-content">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Today's Schedule</mat-card-title>
                <mat-card-subtitle>{{ currentDate | date:'fullDate' }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="appointments-list" *ngIf="dashboardData?.todayAppointments?.length; else noAppointments">
                  <div class="appointment-item" *ngFor="let appointment of dashboardData?.todayAppointments">
                    <div class="appointment-time">
                      <strong>{{ appointment.startTime }}</strong>
                      <span class="duration">{{ appointment.endTime }}</span>
                    </div>
                    
                    <div class="appointment-info">
                      <h4>Patient Appointment</h4>
                      <p>{{ appointment.reason }}</p>
                      <mat-chip [color]="getStatusColor(appointment.status)" selected>
                        {{ appointment.status }}
                      </mat-chip>
                    </div>
                    
                    <div class="appointment-actions">
                      <button mat-icon-button [matMenuTriggerFor]="appointmentMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #appointmentMenu="matMenu">
                        <button mat-menu-item (click)="viewAppointment(appointment)">
                          <mat-icon>visibility</mat-icon>
                          <span>View Details</span>
                        </button>
                        <button mat-menu-item (click)="updateStatus(appointment)">
                          <mat-icon>edit</mat-icon>
                          <span>Update Status</span>
                        </button>
                        <button mat-menu-item (click)="createPrescription(appointment)">
                          <mat-icon>medication</mat-icon>
                          <span>Create Prescription</span>
                        </button>
                      </mat-menu>
                    </div>
                  </div>
                </div>
                
                <ng-template #noAppointments>
                  <div class="empty-state">
                    <mat-icon>event_available</mat-icon>
                    <h3>No appointments today</h3>
                    <p>Your schedule is clear for today</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Analytics Tab -->
        <mat-tab label="Analytics">
          <div class="tab-content">
            <div class="analytics-grid">
              <mat-card class="analytics-card">
                <mat-card-header>
                  <mat-card-title>Weekly Overview</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="metric-item">
                    <span class="metric-label">Total Appointments</span>
                    <span class="metric-value">{{ dashboardData?.weeklyStats?.totalAppointments || 0 }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Completed Consultations</span>
                    <span class="metric-value">{{ dashboardData?.weeklyStats?.completedConsultations || 0 }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">New Patients</span>
                    <span class="metric-value">{{ dashboardData?.weeklyStats?.newPatients || 0 }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">AI Cases Reviewed</span>
                    <span class="metric-value">{{ dashboardData?.weeklyStats?.aiAnalysesReviewed || 0 }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="analytics-card">
                <mat-card-header>
                  <mat-card-title>Recent Activity</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="activity-list">
                    <div class="activity-item" *ngFor="let activity of dashboardData?.recentActivity">
                      <mat-icon [color]="getActivityColor(activity.type)">
                        {{ getActivityIcon(activity.type) }}
                      </mat-icon>
                      <div class="activity-content">
                        <h4>{{ activity.title }}</h4>
                        <p>{{ activity.description }}</p>
                        <small>{{ activity.timestamp | date:'short' }}</small>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .doctor-dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .welcome-section h1 {
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .subtitle {
      color: #7f8c8d;
      margin: 0;
    }

    .quick-actions {
      display: flex;
      gap: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      padding: 12px;
      border-radius: 50%;
      background: #f8f9fa;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #7f8c8d;
      font-size: 14px;
    }

    .dashboard-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 24px;
    }

    .section-card {
      margin-bottom: 24px;
    }

    .cases-grid {
      display: grid;
      gap: 24px;
    }

    .case-card {
      border-left: 4px solid #3498db;
    }

    .case-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .case-details {
      margin-top: 16px;
    }

    .symptoms-section, .predictions-section {
      margin-bottom: 16px;
    }

    .symptoms-section h4, .predictions-section h4 {
      margin: 0 0 8px 0;
      color: #2c3e50;
    }

    .prediction-item {
      margin-bottom: 8px;
    }

    .prediction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .disease-name {
      font-weight: 500;
    }

    .severity-info {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .appointment-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .appointment-time {
      min-width: 100px;
      text-align: center;
    }

    .appointment-time strong {
      display: block;
      font-size: 18px;
      color: #2c3e50;
    }

    .duration {
      color: #7f8c8d;
      font-size: 14px;
    }

    .appointment-info {
      flex: 1;
      margin: 0 16px;
    }

    .appointment-info h4 {
      margin: 0 0 4px 0;
      color: #2c3e50;
    }

    .appointment-info p {
      margin: 0 0 8px 0;
      color: #7f8c8d;
    }

    .appointment-actions {
      min-width: 60px;
      text-align: right;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .analytics-card {
      height: fit-content;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ecf0f1;
    }

    .metric-item:last-child {
      border-bottom: none;
    }

    .metric-label {
      color: #7f8c8d;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-content h4 {
      margin: 0 0 4px 0;
      color: #2c3e50;
    }

    .activity-content p {
      margin: 0 0 4px 0;
      color: #7f8c8d;
    }

    .activity-content small {
      color: #bdc3c7;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #7f8c8d;
    }

    .empty-state mat-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
    }

    .empty-state p {
      margin: 0;
    }

    /* Color themes for different card types */
    .pending-cases { border-left: 4px solid #e74c3c; }
    .today-appointments { border-left: 4px solid #3498db; }
    .weekly-consultations { border-left: 4px solid #f39c12; }
    .reviews { border-left: 4px solid #9b59b6; }
  `]
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dashboardData: DoctorDashboard | null = null;
  isLoading = false;
  currentDate = new Date();
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private aiAnalysisService: AiAnalysisService,
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    
    // Subscribe to user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
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
    
    // Load pending AI cases
    this.aiAnalysisService.getPatientAnalyses(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analyses) => {
          const pendingCases = analyses.filter(a => a.status === 'COMPLETED');
          
          // Load today's appointments
          this.appointmentsService.getDoctorAppointments(this.currentUser!.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (appointments) => {
                const todayAppointments = appointments.filter(a => 
                  new Date(a.date).toDateString() === new Date().toDateString()
                );
                
                // Calculate weekly stats
                const weeklyStats = {
                  totalAppointments: appointments.length,
                  completedConsultations: appointments.filter(a => a.status === 'COMPLETED').length,
                  newPatients: 0, // This would come from a more specific API
                  aiAnalysesReviewed: pendingCases.length
                };
                
                // Mock recent activity
                const recentActivity = [
                  {
                    type: 'analysis' as const,
                    title: 'AI Case Reviewed',
                    description: 'Reviewed case for respiratory symptoms',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                  },
                  {
                    type: 'appointment' as const,
                    title: 'Appointment Completed',
                    description: 'Consultation with patient #12345',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
                  }
                ];
                
                this.dashboardData = {
                  pendingCases,
                  todayAppointments,
                  weeklyStats,
                  recentActivity
                };
                
                this.isLoading = false;
              },
              error: () => {
                this.isLoading = false;
                this.snackBar.open('Failed to load appointments', 'Close', { duration: 3000 });
              }
            });
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 3000 });
        }
      });
  }

  reviewCase(analysis: AIAnalysis): void {
    this.snackBar.open(`Reviewing case ${analysis.id}`, 'Close', { duration: 2000 });
    // Navigate to detailed case review
  }

  scheduleAppointment(analysis: AIAnalysis): void {
    this.snackBar.open('Opening appointment scheduling...', 'Close', { duration: 2000 });
    // Open appointment scheduling dialog with pre-filled patient info
  }

  dismissCase(analysis: AIAnalysis): void {
    this.aiAnalysisService.updateAnalysisStatus(analysis.id, AnalysisStatus.COMPLETED)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Case dismissed successfully', 'Close', { duration: 3000 });
          this.loadDashboardData();
        },
        error: () => {
          this.snackBar.open('Failed to dismiss case', 'Close', { duration: 3000 });
        }
      });
  }

  viewAppointment(appointment: Appointment): void {
    this.snackBar.open(`Viewing appointment ${appointment.id}`, 'Close', { duration: 2000 });
    // Navigate to appointment details
  }

  updateStatus(appointment: Appointment): void {
    const newStatus = appointment.status === AppointmentStatus.SCHEDULED 
      ? AppointmentStatus.CONFIRMED 
      : AppointmentStatus.COMPLETED;
      
    this.appointmentsService.updateAppointment(appointment.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Appointment status updated', 'Close', { duration: 3000 });
          this.loadDashboardData();
        },
        error: () => {
          this.snackBar.open('Failed to update appointment status', 'Close', { duration: 3000 });
        }
      });
  }

  createPrescription(appointment: Appointment): void {
    this.snackBar.open('Opening prescription form...', 'Close', { duration: 2000 });
    // Open prescription creation dialog
  }

  openAvailabilityDialog(): void {
    this.snackBar.open('Opening availability management...', 'Close', { duration: 2000 });
    // Open availability management dialog
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
      case AppointmentStatus.COMPLETED: return 'primary';
      case AppointmentStatus.CONFIRMED: return 'accent';
      case AppointmentStatus.SCHEDULED: return 'warn';
      default: return '';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'appointment': return 'primary';
      case 'analysis': return 'accent';
      case 'prescription': return 'warn';
      case 'blog': return 'primary';
      default: return '';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'appointment': return 'event';
      case 'analysis': return 'analytics';
      case 'prescription': return 'medication';
      case 'blog': return 'article';
      default: return 'info';
    }
  }
}