import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface AdminDashboard {
  systemStats: {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    totalAnalyses: number;
  };
  recentActivity: {
    type: 'user_registered' | 'doctor_approved' | 'appointment_created' | 'analysis_completed';
    title: string;
    description: string;
    timestamp: Date;
    userId?: string;
  }[];
  pendingApprovals: {
    doctors: number;
    content: number;
    reports: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    
    // Material modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="admin-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>System Administration</h1>
          <p class="subtitle">Manage users, monitor system health, and oversee clinic operations</p>
        </div>
        <div class="quick-actions">
          <button mat-raised-button color="primary">
            <mat-icon>people</mat-icon>
            Manage Users
          </button>
          <button mat-raised-button color="accent">
            <mat-icon>analytics</mat-icon>
            View Reports
          </button>
          <button mat-raised-button>
            <mat-icon>settings</mat-icon>
            System Settings
          </button>
        </div>
      </div>

      <!-- System Overview Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card users">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.systemStats?.totalUsers || 0 }}</h3>
                <p>Total Users</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card doctors">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">local_hospital</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.systemStats?.totalDoctors || 0 }}</h3>
                <p>Registered Doctors</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card patients">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">person</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.systemStats?.totalPatients || 0 }}</h3>
                <p>Active Patients</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card appointments">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="warn">event</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.systemStats?.totalAppointments || 0 }}</h3>
                <p>Total Appointments</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card analyses">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">analytics</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ dashboardData?.systemStats?.totalAnalyses || 0 }}</h3>
                <p>AI Analyses</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Pending Actions & Alerts -->
      <div class="alerts-section">
        <mat-card class="alert-card pending-doctors" *ngIf="dashboardData?.pendingApprovals?.doctors">
          <mat-card-header>
            <mat-card-title>
              <mat-icon color="warn">pending_actions</mat-icon>
              Pending Doctor Approvals
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alert-content">
              <h2>{{ dashboardData?.pendingApprovals?.doctors || 0 }}</h2>
              <p>Doctors awaiting approval</p>
              <button mat-raised-button color="primary">Review Approvals</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="alert-card system-alerts">
          <mat-card-header>
            <mat-card-title>
              <mat-icon color="warn">warning</mat-icon>
              System Health
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="health-metrics">
              <div class="metric">
                <span>CPU Usage</span>
                <mat-progress-bar mode="determinate" [value]="dashboardData?.systemHealth?.cpuUsage || 0"></mat-progress-bar>
                <span>{{ dashboardData?.systemHealth?.cpuUsage || 0 }}%</span>
              </div>
              <div class="metric">
                <span>Memory Usage</span>
                <mat-progress-bar mode="determinate" [value]="dashboardData?.systemHealth?.memoryUsage || 0"></mat-progress-bar>
                <span>{{ dashboardData?.systemHealth?.memoryUsage || 0 }}%</span>
              </div>
              <div class="metric">
                <span>Active Connections</span>
                <span class="value">{{ dashboardData?.systemHealth?.activeConnections || 0 }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content Tabs -->
      <mat-tab-group class="dashboard-tabs">
        <!-- User Management Tab -->
        <mat-tab label="User Management">
          <div class="tab-content">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>User Overview</mat-card-title>
                <mat-card-subtitle>Manage system users and permissions</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="user-categories">
                  <div class="user-category">
                    <div class="category-header">
                      <h3>
                        <mat-icon color="primary">local_hospital</mat-icon>
                        Doctors
                      </h3>
                      <mat-chip color="accent">{{ dashboardData?.systemStats?.totalDoctors || 0 }}</mat-chip>
                    </div>
                    <p>Manage doctor profiles, verify credentials, and set permissions</p>
                    <button mat-button color="primary">Manage Doctors</button>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="user-category">
                    <div class="category-header">
                      <h3>
                        <mat-icon color="accent">person</mat-icon>
                        Patients
                      </h3>
                      <mat-chip color="primary">{{ dashboardData?.systemStats?.totalPatients || 0 }}</mat-chip>
                    </div>
                    <p>View patient records, manage health data, and oversee care</p>
                    <button mat-button color="primary">Manage Patients</button>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="user-category">
                    <div class="category-header">
                      <h3>
                        <mat-icon color="warn">admin_panel_settings</mat-icon>
                        Administrators
                      </h3>
                      <mat-chip>3</mat-chip>
                    </div>
                    <p>System administrators and their access levels</p>
                    <button mat-button>Manage Admins</button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Analytics Tab -->
        <mat-tab label="Analytics & Reports">
          <div class="tab-content">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>System Analytics</mat-card-title>
                <mat-card-subtitle>Monitor usage patterns and system performance</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="analytics-grid">
                  <div class="analytics-metric">
                    <h4>Daily Active Users</h4>
                    <div class="metric-value">--</div>
                    <mat-progress-bar mode="determinate" value="65"></mat-progress-bar>
                  </div>
                  
                  <div class="analytics-metric">
                    <h4>Appointment Success Rate</h4>
                    <div class="metric-value">--</div>
                    <mat-progress-bar mode="determinate" value="92" color="primary"></mat-progress-bar>
                  </div>
                  
                  <div class="analytics-metric">
                    <h4>AI Accuracy Score</h4>
                    <div class="metric-value">--</div>
                    <mat-progress-bar mode="determinate" value="88" color="accent"></mat-progress-bar>
                  </div>
                  
                  <div class="analytics-metric">
                    <h4>System Uptime</h4>
                    <div class="metric-value">99.9%</div>
                    <mat-progress-bar mode="determinate" value="99.9" color="primary"></mat-progress-bar>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- System Logs Tab -->
        <mat-tab label="System Logs">
          <div class="tab-content">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Recent Activity</mat-card-title>
                <mat-card-subtitle>Monitor system events and user actions</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="activity-log">
                  <div class="log-entry" *ngFor="let activity of dashboardData?.recentActivity">
                    <div class="log-icon">
                      <mat-icon [color]="getActivityColor(activity.type)">
                        {{ getActivityIcon(activity.type) }}
                      </mat-icon>
                    </div>
                    <div class="log-content">
                      <h4>{{ activity.title }}</h4>
                      <p>{{ activity.description }}</p>
                      <small>{{ activity.timestamp | date:'medium' }}</small>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Settings Tab -->
        <mat-tab label="System Settings">
          <div class="tab-content">
            <mat-card class="section-card">
              <mat-card-header>
                <mat-card-title>Configuration</mat-card-title>
                <mat-card-subtitle>Manage system-wide settings and configurations</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="settings-grid">
                  <div class="setting-section">
                    <h3>AI Analysis Settings</h3>
                    <p>Configure AI analysis parameters and confidence thresholds</p>
                    <button mat-button>Configure</button>
                  </div>
                  
                  <div class="setting-section">
                    <h3>Notification Settings</h3>
                    <p>Manage system-wide notification preferences</p>
                    <button mat-button>Configure</button>
                  </div>
                  
                  <div class="setting-section">
                    <h3>Security Policies</h3>
                    <p>Set password policies and access controls</p>
                    <button mat-button>Configure</button>
                  </div>
                  
                  <div class="setting-section">
                    <h3>Backup & Recovery</h3>
                    <p>Manage data backups and recovery procedures</p>
                    <button mat-button>Configure</button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-dashboard {
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

    .alerts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .alert-card {
      border-left: 4px solid #e74c3c;
    }

    .alert-content {
      text-align: center;
      padding: 16px;
    }

    .alert-content h2 {
      font-size: 3rem;
      margin: 0;
      color: #e74c3c;
    }

    .alert-content p {
      margin: 8px 0 16px 0;
      color: #7f8c8d;
    }

    .health-metrics {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .metric {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .metric span:first-child {
      min-width: 100px;
      color: #7f8c8d;
    }

    .metric span:last-child {
      min-width: 40px;
      text-align: right;
      font-weight: 500;
    }

    .metric .value {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
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

    .user-categories {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .user-category {
      padding: 16px 0;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .category-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #2c3e50;
    }

    .user-category p {
      color: #7f8c8d;
      margin-bottom: 16px;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .analytics-metric {
      text-align: center;
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .analytics-metric h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 600;
      color: #3498db;
      margin-bottom: 12px;
    }

    .activity-log {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .log-entry {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .log-icon {
      padding: 8px;
      border-radius: 50%;
      background: white;
    }

    .log-content {
      flex: 1;
    }

    .log-content h4 {
      margin: 0 0 4px 0;
      color: #2c3e50;
    }

    .log-content p {
      margin: 0 0 4px 0;
      color: #7f8c8d;
    }

    .log-content small {
      color: #bdc3c7;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .setting-section {
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
    }

    .setting-section h3 {
      margin: 0 0 12px 0;
      color: #2c3e50;
    }

    .setting-section p {
      color: #7f8c8d;
      margin-bottom: 16px;
    }

    /* Color themes for different card types */
    .users { border-left: 4px solid #3498db; }
    .doctors { border-left: 4px solid #f39c12; }
    .patients { border-left: 4px solid #9b59b6; }
    .appointments { border-left: 4px solid #e74c3c; }
    .analyses { border-left: 4px solid #27ae60; }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .quick-actions {
        flex-wrap: wrap;
        justify-content: center;
      }

      .alerts-section {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dashboardData: AdminDashboard | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    
    // Subscribe to user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Mock dashboard data - in real implementation, this would come from admin API
    setTimeout(() => {
      this.dashboardData = {
        systemStats: {
          totalUsers: 1250,
          totalDoctors: 45,
          totalPatients: 1180,
          totalAppointments: 3456,
          totalAnalyses: 892
        },
        pendingApprovals: {
          doctors: 3,
          content: 2,
          reports: 1
        },
        systemHealth: {
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 34,
          activeConnections: 23
        },
        recentActivity: [
          {
            type: 'user_registered',
            title: 'New User Registration',
            description: 'Patient John Doe registered successfully',
            timestamp: new Date(Date.now() - 30 * 60 * 1000)
          },
          {
            type: 'doctor_approved',
            title: 'Doctor Approval',
            description: 'Dr. Smith approved and verified',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            type: 'appointment_created',
            title: 'Appointment Scheduled',
            description: 'New appointment booked for tomorrow',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            type: 'analysis_completed',
            title: 'AI Analysis Completed',
            description: 'Symptom analysis completed for patient #1234',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ]
      };
      this.isLoading = false;
    }, 1000);
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user_registered': return 'primary';
      case 'doctor_approved': return 'accent';
      case 'appointment_created': return 'warn';
      case 'analysis_completed': return 'primary';
      default: return '';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_registered': return 'person_add';
      case 'doctor_approved': return 'verified_user';
      case 'appointment_created': return 'event';
      case 'analysis_completed': return 'analytics';
      default: return 'info';
    }
  }
}