import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Appointment } from '../../../core/models/appointment.model';
import { Patient } from '../../../core/models/patient.model';
import { Prescription } from '../../../core/models/prescription.model';
import { AiAnalysisService } from '../../../core/services/ai-analysis.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import {
    PatientDashboardResponse,
    PatientService,
} from '../../../core/services/patient.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { CancelAppointmentDialogComponent } from '../../../modules/patient-portal/components/cancel-appointment-dialog.component';

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
    MatDialogModule,
    MatChipsModule,
    MatTabsModule,
  ],
  template: `
    <div class="dashboard-container" *ngIf="!isLoading; else loadingTemplate">
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1 class="dashboard-title">
            Welcome back, {{ patient?.firstName || currentUser?.firstName || 'Patient' }}!
          </h1>
          <p class="dashboard-subtitle">
            Manage your healthcare journey from one centralized location
          </p>
        </div>
        <div class="quick-stats">
          <div class="stat-card primary">
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon">psychology</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ analysisCount }}</div>
              <div class="stat-label">Analyses Completed</div>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon">event_available</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointments.length }}</div>
              <div class="stat-label">Total Appointments</div>
            </div>
          </div>
          <div class="stat-card info">
            <div class="stat-icon-wrapper">
              <mat-icon class="stat-icon">medication</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ prescriptions.length }}</div>
              <div class="stat-label">Prescriptions</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Overview -->
      <mat-card class="activity-overview slide-up">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>timeline</mat-icon>
            Recent Activity
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="activity-list">
            <div
              class="activity-item"
              *ngFor="let activity of recentActivities"
            >
              <div class="activity-icon" [class]="'activity-' + activity.type">
                <mat-icon>{{ activity.icon }}</mat-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-description">
                  {{ activity.description }}
                </div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
            <div *ngIf="recentActivities.length === 0" class="no-activity">
              <mat-icon>info</mat-icon>
              <p>No recent activity to display</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="dashboard-grid">
        <mat-card
          class="dashboard-card healthcare-card healthcare-card-primary slide-up full-width"
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
          <mat-card-content class="card-content full-width-content">
            <div class="appointments-section">
              <div class="appointments-header">
                <div class="appointments-intro">
                  <p>
                    Book new appointments with doctors, track your upcoming
                    visits, and manage your medical consultation schedule.
                  </p>
                </div>
                <button
                  mat-raised-button
                  color="primary"
                  routerLink="/patient-portal/appointments"
                >
                  <mat-icon>add_circle</mat-icon>
                  Book Appointment
                </button>
              </div>

              <mat-tab-group class="appointments-tabs">
                <!-- Upcoming Tab -->
                <mat-tab>
                  <ng-template mat-tab-label>
                    <mat-icon>event_available</mat-icon>
                    Upcoming ({{ upcomingAppointments.length }})
                  </ng-template>
                  <div class="tab-content">
                    <div
                      *ngIf="
                        !appointmentsLoading &&
                        upcomingAppointments.length === 0
                      "
                      class="empty-state"
                    >
                      <mat-icon>event_busy</mat-icon>
                      <h3>No upcoming appointments</h3>
                      <p>Book an appointment with a doctor to get started</p>
                    </div>
                    <div
                      class="appointments-list"
                      *ngIf="
                        !appointmentsLoading && upcomingAppointments.length > 0
                      "
                    >
                      <mat-card
                        class="appointment-item"
                        *ngFor="let appointment of upcomingAppointments"
                      >
                        <div class="appointment-header">
                          <div class="appointment-info">
                            <h4>
                              Dr. {{ appointment.doctor?.name || 'Unknown' }}
                            </h4>
                            <p class="appointment-spec">
                              {{
                                appointment.doctor?.specialization ||
                                  'General Practice'
                              }}
                            </p>
                          </div>
                          <mat-chip
                            [class]="
                              'status-' + appointment.status.toLowerCase()
                            "
                          >
                            {{ appointment.status }}
                          </mat-chip>
                        </div>
                        <div class="appointment-details">
                          <div class="detail">
                            <mat-icon>event</mat-icon>
                            <span>{{
                              appointment.date | date: 'fullDate'
                            }}</span>
                          </div>
                          <div class="detail">
                            <mat-icon>schedule</mat-icon>
                            <span>{{ appointment.time }}</span>
                          </div>
                          <div class="detail" *ngIf="appointment.notes">
                            <mat-icon>notes</mat-icon>
                            <span>{{ appointment.notes }}</span>
                          </div>
                        </div>
                        <div class="appointment-actions">
                          <button mat-button>
                            <mat-icon>info</mat-icon>
                            View Details
                          </button>
                          <button
                            mat-button
                            color="warn"
                            (click)="cancelAppointment(appointment)"
                          >
                            <mat-icon>cancel</mat-icon>
                            Cancel
                          </button>
                        </div>
                      </mat-card>
                    </div>
                  </div>
                </mat-tab>

                <!-- Pending Tab -->
                <mat-tab>
                  <ng-template mat-tab-label>
                    <mat-icon>pending</mat-icon>
                    Pending ({{ pendingAppointments.length }})
                  </ng-template>
                  <div class="tab-content">
                    <div
                      *ngIf="
                        !appointmentsLoading && pendingAppointments.length === 0
                      "
                      class="empty-state"
                    >
                      <mat-icon>check_circle</mat-icon>
                      <h3>No pending appointments</h3>
                      <p>All your appointments have been reviewed</p>
                    </div>
                    <div
                      class="appointments-list"
                      *ngIf="
                        !appointmentsLoading && pendingAppointments.length > 0
                      "
                    >
                      <mat-card
                        class="appointment-item pending-item"
                        *ngFor="let appointment of pendingAppointments"
                      >
                        <div class="appointment-header">
                          <div class="appointment-info">
                            <h4>
                              Dr. {{ appointment.doctor?.name || 'Unknown' }}
                            </h4>
                            <p class="appointment-spec">
                              {{
                                appointment.doctor?.specialization ||
                                  'General Practice'
                              }}
                            </p>
                          </div>
                          <mat-chip class="status-pending">PENDING</mat-chip>
                        </div>
                        <div class="appointment-details">
                          <div class="detail">
                            <mat-icon>event</mat-icon>
                            <span>{{
                              appointment.date | date: 'fullDate'
                            }}</span>
                          </div>
                          <div class="detail">
                            <mat-icon>schedule</mat-icon>
                            <span>{{ appointment.time }}</span>
                          </div>
                        </div>
                        <div class="pending-notice">
                          <mat-icon>info</mat-icon>
                          <p>Waiting for doctor approval</p>
                        </div>
                        <div class="appointment-actions">
                          <button
                            mat-button
                            color="warn"
                            (click)="cancelAppointment(appointment)"
                          >
                            <mat-icon>cancel</mat-icon>
                            Cancel Request
                          </button>
                        </div>
                      </mat-card>
                    </div>
                  </div>
                </mat-tab>

                <!-- History Tab -->
                <mat-tab>
                  <ng-template mat-tab-label>
                    <mat-icon>history</mat-icon>
                    History ({{ pastAppointments.length }})
                  </ng-template>
                  <div class="tab-content">
                    <div
                      *ngIf="
                        !appointmentsLoading && pastAppointments.length === 0
                      "
                      class="empty-state"
                    >
                      <mat-icon>history</mat-icon>
                      <h3>No appointment history</h3>
                      <p>Your past appointments will appear here</p>
                    </div>
                    <div
                      class="appointments-timeline"
                      *ngIf="
                        !appointmentsLoading && pastAppointments.length > 0
                      "
                    >
                      <div
                        class="timeline-item"
                        *ngFor="let appointment of pastAppointments"
                      >
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                          <div class="timeline-header">
                            <strong>Dr. {{ appointment.doctor?.name }}</strong>
                            <mat-chip
                              [class]="
                                'status-' + appointment.status.toLowerCase()
                              "
                            >
                              {{ appointment.status }}
                            </mat-chip>
                          </div>
                          <p class="timeline-date">
                            {{ appointment.date | date: 'MMM d, y' }} at
                            {{ appointment.time }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card
          class="dashboard-card healthcare-card healthcare-card-health slide-up"
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

    <ng-template #loadingTemplate>
      <div class="loading">
        <mat-spinner></mat-spinner>
        <p>Loading patient profile...</p>
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
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .full-width-content {
        padding: 0;
      }

      .appointments-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .appointments-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-6);
        border-bottom: 1px solid var(--gray-200);
      }

      .appointments-intro {
        flex: 1;
      }

      .appointments-intro p {
        margin: 0;
        color: var(--gray-600);
        line-height: 1.6;
      }

      .appointments-tabs {
        padding: var(--space-6);
      }

      .tab-content {
        padding: var(--space-4) 0;
        min-height: 300px;
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .appointment-item {
        padding: var(--space-4);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        transition: all 0.2s ease;
      }

      .appointment-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: var(--primary-200);
      }

      .appointment-item.pending-item {
        border-left: 4px solid #ff9800;
      }

      .appointment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-3);
        margin-bottom: var(--space-3);
      }

      .appointment-info h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-800);
      }

      .appointment-spec {
        margin: 0;
        font-size: 13px;
        color: var(--gray-500);
      }

      .appointment-details {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin: var(--space-3) 0;
        padding: var(--space-3) 0;
      }

      .detail {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: 14px;
        color: var(--gray-700);
      }

      .detail mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--gray-500);
      }

      .pending-notice {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3);
        background: #fff3e0;
        border-radius: var(--radius-md);
        margin: var(--space-3) 0;
      }

      .pending-notice mat-icon {
        color: #f57c00;
        font-size: 18px;
      }

      .pending-notice p {
        margin: 0;
        color: #e65100;
        font-weight: 500;
        font-size: 14px;
      }

      .status-pending {
        background-color: #fff3e0;
        color: #e65100;
      }

      .status-confirmed {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .status-scheduled {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .status-completed {
        background-color: #f3e5f5;
        color: #6a1b9a;
      }

      .status-cancelled {
        background-color: #ffebee;
        color: #c62828;
      }

      .appointment-actions {
        display: flex;
        gap: var(--space-2);
        padding-top: var(--space-3);
        border-top: 1px solid var(--gray-100);
      }

      .appointment-actions button {
        font-size: 13px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        text-align: center;
        gap: var(--space-3);
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--gray-300);
      }

      .empty-state h3 {
        margin: 0;
        font-size: 18px;
        color: var(--gray-700);
      }

      .empty-state p {
        margin: 0;
        color: var(--gray-500);
      }

      .appointments-timeline {
        position: relative;
        padding: var(--space-4) 0;
      }

      .timeline-item {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-4);
        position: relative;
      }

      .timeline-item:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 11px;
        top: 50px;
        width: 2px;
        height: calc(100% - 30px);
        background: var(--gray-200);
      }

      .timeline-marker {
        width: 24px;
        height: 24px;
        background: var(--primary-500);
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 2px;
        border: 3px solid white;
        box-shadow: 0 0 0 2px var(--primary-200);
      }

      .timeline-content {
        padding: var(--space-2) 0;
        flex: 1;
      }

      .timeline-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-1);
      }

      .timeline-header strong {
        color: var(--gray-800);
      }

      .timeline-date {
        margin: 0;
        font-size: 13px;
        color: var(--gray-500);
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

      .activity-overview {
        grid-column: 1 / -1;
        margin-bottom: var(--space-6);
      }

      .activity-overview mat-card-header {
        padding: var(--space-6);
        border-bottom: 1px solid var(--gray-200);
      }

      .activity-overview mat-card-title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--gray-800);
      }

      .activity-overview mat-icon {
        color: var(--primary-500);
      }

      .activity-list {
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .activity-item {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-4);
        border-radius: var(--radius-lg);
        background: var(--gray-50);
        transition: all 0.2s ease;
      }

      .activity-item:hover {
        background: var(--gray-100);
      }

      .activity-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
        font-size: 24px;
      }

      .activity-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .activity-icon.activity-success {
        background: var(--success-500);
      }

      .activity-icon.activity-warning {
        background: var(--warning-500);
      }

      .activity-icon.activity-error {
        background: var(--error-500);
      }

      .activity-icon.activity-info {
        background: var(--secondary-500);
      }

      .activity-icon.activity-medical {
        background: var(--primary-500);
      }

      .activity-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .activity-title {
        font-weight: 600;
        color: var(--gray-800);
        font-size: var(--font-size-sm);
      }

      .activity-description {
        color: var(--gray-600);
        font-size: var(--font-size-sm);
        line-height: 1.5;
      }

      .activity-time {
        color: var(--gray-500);
        font-size: var(--font-size-xs);
        font-style: italic;
      }

      .no-activity {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        gap: var(--space-3);
        text-align: center;
      }

      .no-activity mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--gray-300);
      }

      .no-activity p {
        margin: 0;
        color: var(--gray-500);
        font-size: var(--font-size-sm);
      }

      .slide-up {
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  patient: Patient | null = null;
  currentUser: any | null = null;
  appointments: Appointment[] = [];
  prescriptions: Prescription[] = [];
  recentAnalyses: any[] = [];
  analysisCount = 0;
  dashboardStats: PatientDashboardResponse['stats'] = {
    upcomingAppointments: 0,
    activePrescriptions: 0,
    unreadNotifications: 0,
  };
  isLoading = true;
  appointmentsLoading = true;
  prescriptionsLoaded = false;
  patientLoaded = false;
  upcomingAppointments: any[] = [];
  pendingAppointments: any[] = [];
  pastAppointments: any[] = [];
  recentActivities: Array<{
    type: string;
    icon: string;
    title: string;
    description: string;
    time: string;
    date: Date;
  }> = [];
  private destroy$ = new Subject<void>();

  get confirmedAppointments(): number {
    return this.appointments.filter((a) => a.status === 'CONFIRMED').length;
  }

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private appointmentsService: AppointmentsService,
    private prescriptionService: PrescriptionService,
    private aiAnalysisService: AiAnalysisService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user || null;
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
        next: (dashboard) => {
          this.patient = dashboard.patient;
          this.dashboardStats = dashboard.stats || this.dashboardStats;
          this.recentAnalyses = dashboard.recentAnalyses || [];
          this.analysisCount = this.recentAnalyses.length;
          this.patientLoaded = true;
          this.loadAnalysisCount();
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading patient dashboard:', error);
          this.patient = null;
          this.patientLoaded = true;
          this.checkLoadingComplete();
        },
      });

    // Load appointments
    this.appointmentsService
      .getMyAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments || [];
          this.organizeAppointments();
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.appointments = [];
          this.appointmentsLoading = false;
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
          this.prescriptionsLoaded = true;
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading prescriptions:', error);
          this.prescriptions = [];
          this.prescriptionsLoaded = true;
          this.checkLoadingComplete();
        },
      });
  }

  private loadAnalysisCount(): void {
    if (!this.patient?.id) return;

    this.aiAnalysisService
      .getPatientAnalyses(this.patient.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analyses) => {
          this.analysisCount = analyses?.length || 0;
        },
        error: (error) => {
          console.error('Error loading analysis history:', error);
        },
      });
  }

  private organizeAppointments(): void {
    const now = new Date();

    this.pendingAppointments = this.appointments.filter(
      (apt: any) => apt.status === 'PENDING',
    );

    this.upcomingAppointments = this.appointments.filter(
      (apt: any) =>
        (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED') &&
        new Date(apt.date) >= now,
    );

    this.pastAppointments = this.appointments.filter(
      (apt: any) =>
        apt.status === 'COMPLETED' ||
        apt.status === 'CANCELLED' ||
        (new Date(apt.date) < now && apt.status !== 'PENDING'),
    );

    this.appointmentsLoading = false;
    this.generateRecentActivities();
  }

  private generateRecentActivities(): void {
    const activities: Array<{
      type: string;
      icon: string;
      title: string;
      description: string;
      time: string;
      date: Date;
    }> = [];

    // Add appointments to activities
    this.appointments.slice(0, 5).forEach((apt: any) => {
      const aptDate = new Date(apt.date);
      let title = '';
      let icon = '';
      let type = '';

      switch (apt.status) {
        case 'CONFIRMED':
          title = 'Appointment Confirmed';
          icon = 'event_available';
          type = 'success';
          break;
        case 'PENDING':
          title = 'Appointment Pending';
          icon = 'pending_actions';
          type = 'warning';
          break;
        case 'COMPLETED':
          title = 'Appointment Completed';
          icon = 'check_circle';
          type = 'success';
          break;
        case 'CANCELLED':
          title = 'Appointment Cancelled';
          icon = 'cancel';
          type = 'error';
          break;
        default:
          title = 'Appointment Scheduled';
          icon = 'event';
          type = 'info';
      }

      activities.push({
        type,
        icon,
        title,
        description: `${apt.type || 'Appointment'} with Dr. ${apt.doctor?.user?.name || 'Unknown'} on ${aptDate.toLocaleDateString()}`,
        time: this.getRelativeTime(aptDate),
        date: aptDate,
      });
    });

    // Add prescriptions to activities
    this.prescriptions.slice(0, 3).forEach((prescription: any) => {
      const presDate = new Date(prescription.createdAt);
      activities.push({
        type: 'medical',
        icon: 'medication',
        title: 'New Prescription',
        description: `${prescription.medication} prescribed by Dr. ${prescription.doctor?.user?.name || 'Unknown'}`,
        time: this.getRelativeTime(presDate),
        date: presDate,
      });
    });

    // Sort activities by date (newest first) and take top 10
    this.recentActivities = activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  cancelAppointment(appointment: any): void {
    const dialogRef = this.dialog.open(CancelAppointmentDialogComponent, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((reason: any) => {
      if (reason !== null && reason !== undefined) {
        this.appointmentsService
          .cancelAppointment(appointment.id, reason || undefined)
          .subscribe({
            next: () => {
              this.snackBar.open(
                '✓ Appointment cancelled successfully',
                'Close',
                {
                  duration: 4000,
                  panelClass: 'success-snackbar',
                },
              );
              this.loadAppointmentsOnly();
            },
            error: () => {
              this.snackBar.open('✗ Failed to cancel appointment', 'Close', {
                duration: 4000,
                panelClass: 'error-snackbar',
              });
            },
          });
      }
    });
  }

  private loadAppointmentsOnly(): void {
    this.appointmentsService
      .getMyAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments || [];
          this.organizeAppointments();
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
        },
      });
  }

  private checkLoadingComplete(): void {
    // Check if all data has been loaded
    if (
      this.patientLoaded &&
      !this.appointmentsLoading &&
      this.prescriptionsLoaded
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
