import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { DoctorsService } from '../../../core/services/doctors.service';
import { PatientDetailsDialogComponent } from '../components/patient-details-dialog.component';
import { ScheduleFollowupDialogComponent } from '../components/schedule-followup-dialog.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="doctor-appointments-professional">
      <!-- Professional Medical Header -->
      <div class="medical-header">
        <div class="header-main">
          <div class="header-icon">
            <mat-icon>event_note</mat-icon>
          </div>
          <div class="header-text">
            <h1>Appointment Management</h1>
            <p class="subtitle">
              Clinical Schedule & Patient Booking Oversight
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button
            mat-raised-button
            color="primary"
            routerLink="/doctor/dashboard"
          >
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
        </div>
      </div>

      <!-- Error State -->
      <mat-card class="error-card" *ngIf="hasError">
        <div class="error-content">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <div class="error-text">
            <h3>Unable to Load Appointments</h3>
            <p>{{ errorMessage }}</p>
          </div>
          <button
            mat-raised-button
            color="primary"
            (click)="loadAppointments()"
          >
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      </mat-card>

      <!-- Quick Stats Dashboard -->
      <div class="stats-dashboard" *ngIf="!isLoading && !hasError">
        <div class="stat-card priority-stat">
          <div class="stat-icon pending-icon">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ pendingAppointments.length }}</span>
            <span class="stat-label">Awaiting Approval</span>
            <span class="stat-desc">Requires your action</span>
          </div>
        </div>

        <div class="stat-card today-stat">
          <div class="stat-icon today-icon">
            <mat-icon>today</mat-icon>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ todayAppointments.length }}</span>
            <span class="stat-label">Today's Schedule</span>
            <span class="stat-desc">{{ currentDate | date: 'EEEE' }}</span>
          </div>
        </div>

        <div class="stat-card upcoming-stat">
          <div class="stat-icon upcoming-icon">
            <mat-icon>event_available</mat-icon>
          </div>
          <div class="stat-data">
            <span class="stat-value">{{ upcomingAppointments.length }}</span>
            <span class="stat-label">Confirmed Upcoming</span>
            <span class="stat-desc">Next 7 days</span>
          </div>
        </div>
      </div>

      <!-- Main Content Tabs -->
      <mat-tab-group class="medical-tabs" animationDuration="300ms">
        <!-- PENDING APPROVALS TAB -->
        <mat-tab>
          <ng-template mat-tab-label>
            <div class="tab-label-content">
              <mat-icon>pending_actions</mat-icon>
              <span>Pending Approvals</span>
              <span class="priority-badge" *ngIf="pendingAppointments.length">
                {{ pendingAppointments.length }}
              </span>
            </div>
          </ng-template>

          <div class="tab-panel">
            <!-- Loading State -->
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Loading appointment requests...</p>
            </div>

            <!-- Empty State -->
            <div
              *ngIf="!isLoading && pendingAppointments.length === 0"
              class="empty-container"
            >
              <mat-icon>check_circle_outline</mat-icon>
              <h3>All Clear!</h3>
              <p>No pending appointment requests at this time</p>
            </div>

            <!-- Pending Appointments Grid -->
            <div
              class="appointments-grid"
              *ngIf="!isLoading && pendingAppointments.length > 0"
            >
              <div
                class="appointment-request-card"
                *ngFor="let apt of pendingAppointments"
              >
                <div class="request-header">
                  <div class="patient-info-header">
                    <div class="patient-avatar">
                      {{ apt.patient?.name?.charAt(0)?.toUpperCase() || 'P' }}
                    </div>
                    <div class="patient-name-section">
                      <h3>{{ apt.patient?.name || 'Unknown Patient' }}</h3>
                      <p class="patient-meta">
                        <span *ngIf="apt.patient?.age"
                          >{{ apt.patient.age }} years</span
                        >
                        <span *ngIf="apt.patient?.gender" class="separator"
                          >•</span
                        >
                        <span *ngIf="apt.patient?.gender">{{
                          apt.patient.gender
                        }}</span>
                      </p>
                    </div>
                  </div>
                  <mat-chip class="pending-chip">NEEDS APPROVAL</mat-chip>
                </div>

                <div class="request-details">
                  <div class="detail-row">
                    <mat-icon>event</mat-icon>
                    <div>
                      <span class="detail-label">Requested Date & Time</span>
                      <span class="detail-value">
                        {{ apt.date | date: 'EEEE, MMMM d, y' }} at
                        {{ apt.time || apt.startTime }}
                      </span>
                    </div>
                  </div>

                  <div class="detail-row" *ngIf="apt.reason">
                    <mat-icon>description</mat-icon>
                    <div>
                      <span class="detail-label">Reason for Visit</span>
                      <span class="detail-value">{{ apt.reason }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <mat-icon>phone</mat-icon>
                    <div>
                      <span class="detail-label">Contact</span>
                      <span class="detail-value">{{
                        apt.patient?.phone || 'Not provided'
                      }}</span>
                    </div>
                  </div>

                  <div class="detail-row" *ngIf="apt.notes">
                    <mat-icon>note</mat-icon>
                    <div>
                      <span class="detail-label">Additional Notes</span>
                      <span class="detail-value">{{ apt.notes }}</span>
                    </div>
                  </div>
                </div>

                <div class="request-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="approveAppointment(apt)"
                    class="approve-btn"
                  >
                    <mat-icon>check_circle</mat-icon>
                    Approve Appointment
                  </button>
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="rejectAppointment(apt)"
                    class="reject-btn"
                  >
                    <mat-icon>cancel</mat-icon>
                    Decline
                  </button>
                  <button
                    mat-stroked-button
                    (click)="viewPatientDetails(apt.patient)"
                    *ngIf="apt.patient"
                  >
                    <mat-icon>info</mat-icon>
                    Patient Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- TODAY'S SCHEDULE TAB -->
        <mat-tab>
          <ng-template mat-tab-label>
            <div class="tab-label-content">
              <mat-icon>today</mat-icon>
              <span>Today's Schedule</span>
              <span class="info-badge" *ngIf="todayAppointments.length">
                {{ todayAppointments.length }}
              </span>
            </div>
          </ng-template>

          <div class="tab-panel">
            <!-- Loading State -->
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Loading today's schedule...</p>
            </div>

            <!-- Empty State -->
            <div
              *ngIf="!isLoading && todayAppointments.length === 0"
              class="empty-container"
            >
              <mat-icon>event_busy</mat-icon>
              <h3>No Appointments Today</h3>
              <p>
                Your schedule is clear for
                {{ currentDate | date: 'EEEE, MMMM d' }}
              </p>
            </div>

            <!-- Today's Appointments -->
            <div
              class="timeline-view"
              *ngIf="!isLoading && todayAppointments.length > 0"
            >
              <div class="timeline-item" *ngFor="let apt of todayAppointments">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="appointment-time">
                    {{ apt.time || apt.startTime }}
                  </div>
                  <mat-card class="today-appointment-card">
                    <div class="today-apt-header">
                      <div class="patient-brief">
                        <div class="patient-avatar-small">
                          {{
                            apt.patient?.name?.charAt(0)?.toUpperCase() || 'P'
                          }}
                        </div>
                        <div>
                          <h4>{{ apt.patient?.name || 'Patient' }}</h4>
                          <p class="apt-type">
                            {{ apt.type || 'General Consultation' }}
                          </p>
                        </div>
                      </div>
                      <mat-chip
                        [class]="'status-chip-' + apt.status?.toLowerCase()"
                      >
                        {{ apt.status }}
                      </mat-chip>
                    </div>
                    <div class="today-apt-info">
                      <div class="info-pill" *ngIf="apt.patient?.age">
                        <mat-icon>person</mat-icon>
                        {{ apt.patient.age }} yrs,
                        {{ apt.patient.gender || 'N/A' }}
                      </div>
                      <div class="info-pill" *ngIf="apt.patient?.phone">
                        <mat-icon>phone</mat-icon>
                        {{ apt.patient.phone }}
                      </div>
                    </div>
                    <div class="today-apt-actions">
                      <button
                        mat-button
                        (click)="viewPatientDetails(apt.patient)"
                      >
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>
                      <button
                        mat-button
                        color="primary"
                        (click)="markAsCompleted(apt)"
                      >
                        <mat-icon>done_all</mat-icon>
                        Mark Complete
                      </button>
                    </div>
                  </mat-card>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- UPCOMING APPOINTMENTS TAB -->
        <mat-tab>
          <ng-template mat-tab-label>
            <div class="tab-label-content">
              <mat-icon>event_available</mat-icon>
              <span>Confirmed Appointments</span>
            </div>
          </ng-template>

          <div class="tab-panel">
            <!-- Loading State -->
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Loading confirmed appointments...</p>
            </div>

            <!-- Empty State -->
            <div
              *ngIf="!isLoading && upcomingAppointments.length === 0"
              class="empty-container"
            >
              <mat-icon>event_busy</mat-icon>
              <h3>No Confirmed Appointments</h3>
              <p>You don't have any confirmed appointments scheduled</p>
            </div>

            <!-- Upcoming Appointments Grid -->
            <div
              class="appointments-list"
              *ngIf="!isLoading && upcomingAppointments.length > 0"
            >
              <mat-card
                class="upcoming-apt-card"
                *ngFor="let apt of upcomingAppointments"
              >
                <div class="upcoming-header">
                  <div class="date-badge">
                    <div class="date-day">{{ apt.date | date: 'd' }}</div>
                    <div class="date-month">{{ apt.date | date: 'MMM' }}</div>
                  </div>
                  <div class="upcoming-patient-info">
                    <h3>{{ apt.patient?.name || 'Patient' }}</h3>
                    <p class="appointment-datetime">
                      {{ apt.date | date: 'EEEE' }} at
                      {{ apt.time || apt.startTime }}
                    </p>
                  </div>
                  <mat-chip
                    [class]="'status-chip-' + apt.status?.toLowerCase()"
                  >
                    {{ apt.status }}
                  </mat-chip>
                </div>

                <div class="upcoming-details">
                  <div class="detail-item">
                    <mat-icon>person_outline</mat-icon>
                    <span
                      >{{ apt.patient?.age || 'N/A' }} years,
                      {{ apt.patient?.gender || 'N/A' }}</span
                    >
                  </div>
                  <div class="detail-item">
                    <mat-icon>phone_in_talk</mat-icon>
                    <span>{{ apt.patient?.phone || 'No contact' }}</span>
                  </div>
                  <div class="detail-item" *ngIf="apt.reason">
                    <mat-icon>medical_services</mat-icon>
                    <span>{{ apt.reason }}</span>
                  </div>
                </div>

                <div class="upcoming-actions">
                  <button mat-button (click)="viewPatientDetails(apt.patient)">
                    <mat-icon>info_outline</mat-icon>
                    Patient Info
                  </button>
                  <button mat-button (click)="scheduleFollowUp(apt)">
                    <mat-icon>event</mat-icon>
                    Schedule Follow-up
                  </button>
                  <button mat-button (click)="rescheduleAppointment(apt)">
                    <mat-icon>schedule</mat-icon>
                    Reschedule
                  </button>
                </div>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      :host {
        --primary-orange: #ff6f00;
        --primary-orange-light: #ff9100;
        --primary-blue: #1976d2;
        --primary-blue-light: #42a5f5;
        --primary-green: #388e3c;
        --primary-green-light: #66bb6a;
        --gray-50: #fafafa;
        --gray-100: #f5f5f5;
        --gray-200: #eeeeee;
        --gray-300: #e0e0e0;
        --gray-600: #757575;
        --gray-700: #616161;
        --gray-900: #212121;
      }

      .doctor-appointments-page {
        padding: 32px;
        max-width: 1400px;
        margin: 0 auto;
        background: #f5f7fa;
      }

      .page-header {
        margin-bottom: 32px;
      }

      .page-header h1 {
        margin: 8px 0;
        font-size: 2rem;
        font-weight: 700;
        color: var(--gray-900);
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 12px;
        color: var(--gray-600);
        margin: 0 0 8px;
        font-weight: 600;
      }

      .muted {
        color: var(--gray-600);
        margin: 0;
        font-size: 14px;
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .stat-card mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .stat-card.pending mat-icon {
        color: var(--primary-orange);
      }

      .stat-card.upcoming mat-icon {
        color: var(--primary-blue);
      }

      .stat-card.today mat-icon {
        color: var(--primary-green);
      }

      .stat-info h3 {
        font-size: 2rem;
        margin: 0;
        font-weight: 700;
        color: var(--gray-900);
      }

      .stat-info p {
        margin: 0;
        color: var(--gray-600);
        font-size: 14px;
      }

      .appointments-tabs {
        margin-top: 32px;
      }

      .tab-content {
        padding: 32px 0;
      }

      .loading-state,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px;
        text-align: center;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #bdbdbd;
        margin-bottom: 20px;
      }

      .empty-state h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0 0 8px;
      }

      .empty-state p {
        color: var(--gray-600);
        margin: 0;
      }

      .error-card {
        background: #ffebee;
        border-left: 4px solid #d32f2f;
        margin-bottom: 32px;
        border-radius: 8px;
      }

      .error-message-container {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 20px;
        padding: 20px;
      }

      .error-icon {
        color: #f44336;
        font-size: 32px;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .error-message-container h3 {
        margin: 0 0 var(--space-1);
        color: #c62828;
        font-weight: 600;
      }

      .error-message-container p {
        margin: 0;
        color: #b71c1c;
        font-size: 14px;
      }

      .appointments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 24px;
      }

      .appointment-card {
        border-radius: 12px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.04);
      }

      .appointment-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .pending-card {
        border-left: 4px solid var(--primary-orange);
      }

      .patient-icon {
        background: linear-gradient(135deg, #fff3e0, #ffe0b2);
        color: var(--primary-orange);
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(255, 111, 0, 0.15);
      }

      .patient-info {
        margin: var(--space-4) 0;
      }

      .info-row {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-2);
        color: var(--gray-700);
      }

      .info-row mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--gray-500);
      }

      .notes {
        margin: var(--space-4) 0;
        padding: var(--space-3);
        background: var(--gray-50);
        border-radius: var(--radius-md);
      }

      .notes strong {
        display: block;
        margin-bottom: var(--space-2);
      }

      .notes p {
        margin: 0;
        color: var(--gray-700);
      }

      mat-chip-set {
        margin: var(--space-4) 0;
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

      mat-card-actions {
        display: flex;
        gap: var(--space-2);
        padding: var(--space-4);
      }

      .badge {
        background-color: #ff9800;
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 12px;
        margin-left: 8px;
      }

      @media (max-width: 768px) {
        .appointments-grid {
          grid-template-columns: 1fr;
        }
      }

      /* DOCTOR APPOINTMENTS UNIQUE STYLING */

      .view-toggle {
        display: flex;
        gap: var(--space-2);
        margin-bottom: var(--space-4);
        align-items: center;
      }

      .view-toggle button {
        transition: all 0.2s ease;
      }

      .view-toggle button.active {
        color: var(--primary-600);
        background-color: var(--primary-50);
      }

      /* Table View Styles */
      .appointments-table-view {
        overflow-x: auto;
      }

      .appointments-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .appointments-table thead {
        background: linear-gradient(
          135deg,
          var(--primary-600) 0%,
          var(--primary-700) 100%
        );
        color: white;
      }

      .appointments-table thead th {
        padding: var(--space-4);
        text-align: left;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid var(--primary-800);
      }

      .appointments-table tbody tr {
        border-bottom: 1px solid var(--gray-100);
        transition: all 0.2s ease;
      }

      .appointments-table tbody tr:hover {
        background-color: var(--gray-50);
      }

      .appointments-table tbody tr.pending-row {
        border-left: 4px solid #ff9800;
      }

      .appointments-table td {
        padding: var(--space-4);
        vertical-align: middle;
      }

      .patient-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--primary-400),
          var(--primary-600)
        );
        color: white;
        font-weight: 600;
        font-size: 16px;
        margin-right: var(--space-3);
      }

      .patient-name {
        display: flex;
        align-items: center;
      }

      .patient-details {
        display: flex;
        flex-direction: column;
      }

      .patient-details strong {
        color: var(--gray-900);
        font-weight: 600;
      }

      .patient-details small {
        color: var(--gray-500);
        font-size: 12px;
      }

      .appointment-datetime {
        font-weight: 500;
      }

      .appointment-datetime .time {
        color: var(--gray-600);
        font-size: 13px;
      }

      .appointment-type {
        color: var(--primary-600);
        font-weight: 500;
      }

      .patient-age,
      .patient-contact {
        color: var(--gray-700);
      }

      .appointment-actions {
        display: flex;
        gap: var(--space-1);
      }

      /* Doctor Card Styles */
      .doctor-card {
        position: relative;
        border: none;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .doctor-card:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      .card-accent {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
      }

      .pending-accent {
        background: linear-gradient(90deg, #ff9800 0%, #ffb74d 100%);
      }

      .doctor-card-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-5);
        border-bottom: 1px solid var(--gray-100);
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.95) 0%,
          rgba(250, 250, 250, 0.95) 100%
        );
      }

      .patient-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        flex-shrink: 0;
      }

      .patient-avatar.pending {
        background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      }

      .header-content {
        flex: 1;
      }

      .doctor-card-header mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--gray-900);
      }

      .doctor-card-header mat-card-subtitle {
        margin: 4px 0 0 0;
        font-size: 13px;
        color: var(--gray-600);
      }

      .status-pending-chip {
        background: #fff3e0 !important;
        color: #e65100 !important;
        font-weight: 600;
        font-size: 11px;
        padding: 4px 12px;
        border-radius: 16px;
      }

      .doctor-card-content {
        padding: var(--space-5);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--space-3);
        margin-bottom: var(--space-4);
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-2);
        padding: var(--space-3);
        background: var(--gray-50);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--primary-500);
      }

      .info-item mat-icon {
        color: var(--primary-600);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .info-item small {
        display: block;
        color: var(--gray-500);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .info-item strong {
        display: block;
        color: var(--gray-900);
        font-weight: 600;
        margin-top: 2px;
      }

      .notes-section {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-4);
        background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--secondary-500);
      }

      .notes-section mat-icon {
        color: var(--secondary-600);
        flex-shrink: 0;
      }

      .notes-section strong {
        display: block;
        margin-bottom: 4px;
        color: var(--gray-900);
        font-weight: 600;
      }

      .notes-section p {
        margin: 0;
        color: var(--gray-700);
        font-size: 14px;
        line-height: 1.5;
      }

      .doctor-card-actions {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-4);
        border-top: 1px solid var(--gray-100);
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
      }

      .doctor-card-actions button {
        flex: 1;
        font-weight: 600;
        font-size: 13px;
      }

      @media (max-width: 768px) {
        .view-toggle {
          margin-bottom: var(--space-4);
        }

        .appointments-table {
          font-size: 13px;
        }

        .appointments-table td,
        .appointments-table th {
          padding: var(--space-2);
        }

        .patient-name {
          flex-direction: column;
        }

        .patient-badge {
          margin-right: 0;
          margin-bottom: var(--space-2);
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .doctor-card-actions {
          flex-direction: column;
        }

        .doctor-card-actions button {
          width: 100%;
        }
      }

      /* Medical Header Styling */
      .medical-header {
        background: white;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 32px;
        border-left: 6px solid var(--primary-blue);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-main {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .header-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--primary-blue);
      }

      .header-text h1 {
        font-size: 28px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0 0 6px;
        letter-spacing: -0.5px;
      }

      .subtitle {
        color: var(--gray-600);
        font-size: 14px;
        margin: 0;
      }

      /* Stats Dashboard Styling */
      .stats-dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }

      .stat-data {
        flex: 1;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--gray-900);
        display: block;
        line-height: 1;
        margin-bottom: 6px;
      }

      .stat-label {
        font-size: 15px;
        font-weight: 600;
        color: var(--gray-700);
        display: block;
        margin-bottom: 2px;
      }

      .stat-desc {
        font-size: 13px;
        color: var(--gray-600);
        display: block;
      }

      /* Tab Styling */
      .medical-tabs {
        background: white;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }

      .tab-panel {
        padding: 32px;
      }

      /* Request Cards */
      .appointment-request-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(0, 0, 0, 0.04);
        position: relative;
      }

      .appointment-request-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(
          90deg,
          var(--primary-orange),
          var(--primary-orange-light)
        );
      }

      .appointment-request-card:hover {
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        transform: translateY(-6px);
      }

      .request-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid var(--gray-100);
        background: #fafafa;
      }

      .patient-info-header {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .patient-name-section h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--gray-900);
        margin: 0 0 4px;
      }

      .patient-meta {
        font-size: 13px;
        color: var(--gray-600);
        margin: 0;
      }

      .separator {
        margin: 0 8px;
      }

      .pending-chip {
        background: linear-gradient(135deg, #fff3e0, #ffe0b2) !important;
        color: var(--primary-orange) !important;
        font-weight: 700 !important;
        font-size: 11px !important;
        padding: 6px 14px !important;
        border-radius: 16px !important;
        box-shadow: 0 2px 6px rgba(255, 111, 0, 0.15);
      }

      .request-details {
        padding: 24px;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
      }

      .detail-row:last-child {
        margin-bottom: 0;
      }

      .detail-row mat-icon {
        color: var(--primary-blue);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .detail-label {
        display: block;
        font-size: 12px;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .detail-value {
        display: block;
        font-size: 15px;
        color: var(--gray-900);
        font-weight: 500;
      }

      .request-actions {
        display: flex;
        gap: 12px;
        padding: 20px 24px;
        background: #fafafa;
        border-top: 1px solid var(--gray-100);
      }

      .approve-btn {
        flex: 1;
        font-weight: 600 !important;
        font-size: 14px !important;
        padding: 12px 24px !important;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.25) !important;
      }

      .reject-btn {
        font-weight: 600 !important;
        font-size: 14px !important;
        padding: 12px 24px !important;
      }

      /* Loading state */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px;
        gap: 20px;
      }

      .loading-container p {
        color: var(--gray-600);
        font-size: 15px;
      }

      /* Empty state */
      .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px;
        text-align: center;
      }

      .empty-container mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #bdbdbd;
        margin-bottom: 24px;
      }

      .empty-container h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0 0 8px;
      }

      .empty-container p {
        color: var(--gray-600);
        font-size: 15px;
        margin: 0;
      }
    `,
  ],
})
export class DoctorAppointmentsComponent implements OnInit {
  isLoading = true;
  hasError = false;
  errorMessage = '';
  pendingAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  todayAppointments: any[] = [];
  currentDate = new Date();

  constructor(
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    // Use the doctor-specific appointments endpoint
    this.appointmentsService.getMyDoctorAppointments().subscribe({
      next: (appointments: any[]) => {
        console.log('Doctor appointments received:', appointments);
        console.log('Total appointments:', appointments.length);

        // Log all appointment statuses for debugging
        appointments.forEach((apt, idx) => {
          console.log(
            `Appointment ${idx}: status="${apt.status}", date=${apt.date}`,
          );
        });

        // Filter pending appointments (need approval)
        this.pendingAppointments = appointments.filter(
          (apt: any) => apt.status === 'PENDING',
        );
        console.log('Pending appointments:', this.pendingAppointments.length);

        // Filter confirmed/scheduled upcoming appointments (compare date only, not time)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        this.upcomingAppointments = appointments.filter((apt: any) => {
          if (apt.status !== 'CONFIRMED' && apt.status !== 'SCHEDULED') {
            return false;
          }
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0); // Reset time to start of day
          return aptDate >= today;
        });
        console.log('Upcoming appointments:', this.upcomingAppointments.length);

        // Filter today's appointments
        const todayStr = new Date().toDateString();
        this.todayAppointments = appointments.filter(
          (apt: any) => new Date(apt.date).toDateString() === todayStr,
        );
        console.log('Today appointments:', this.todayAppointments.length);

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load appointments:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage =
          error.error?.message ||
          'Failed to load appointments. Please try again.';
        this.pendingAppointments = [];
        this.upcomingAppointments = [];
        this.todayAppointments = [];

        this.snackBar.open('Failed to load appointments', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }

  approveAppointment(appointment: any): void {
    console.log('Approving appointment:', appointment.id);
    this.appointmentsService.approveAppointment(appointment.id).subscribe({
      next: (result) => {
        console.log('Appointment approved successfully:', result);
        this.snackBar.open('Appointment approved successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Failed to approve appointment:', error);
        const errorMsg =
          error.error?.message || 'Failed to approve appointment';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }

  rejectAppointment(appointment: any): void {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) {
      // User cancelled the prompt
      return;
    }

    console.log('Rejecting appointment:', appointment.id, 'Reason:', reason);
    this.appointmentsService
      .rejectAppointment(appointment.id, reason || undefined)
      .subscribe({
        next: (result) => {
          console.log('Appointment rejected successfully:', result);
          this.snackBar.open('Appointment rejected', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar',
          });
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Failed to reject appointment:', error);
          const errorMsg =
            error.error?.message || 'Failed to reject appointment';
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar',
          });
        },
      });
  }

  scheduleFollowUp(appointment: any): void {
    const dialogRef = this.dialog.open(ScheduleFollowupDialogComponent, {
      width: '500px',
      data: {
        patientName: appointment.patient?.name || 'Patient',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Create follow-up appointment
        const followupData = {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          date: result.date,
          time: result.time,
          type: result.type,
          notes: result.notes,
          status: 'PENDING', // Follow-ups start as pending for patient confirmation
        };

        this.appointmentsService.createAppointment(followupData).subscribe({
          next: () => {
            this.snackBar.open(
              '✓ Follow-up appointment scheduled successfully',
              'Close',
              {
                duration: 4000,
                panelClass: 'success-snackbar',
              },
            );
            this.loadAppointments();
          },
          error: (error: any) => {
            console.error('Failed to schedule follow-up:', error);
            this.snackBar.open(
              '✗ Failed to schedule follow-up appointment',
              'Close',
              {
                duration: 4000,
                panelClass: 'error-snackbar',
              },
            );
          },
        });
      }
    });
  }

  viewPatientDetails(patient: any): void {
    if (!patient) {
      this.snackBar.open('Patient information not available', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.dialog.open(PatientDetailsDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: {
        patient: patient,
      },
    });
  }

  markAsCompleted(appointment: any): void {
    this.appointmentsService
      .updateAppointment(appointment.id, {
        status: AppointmentStatus.COMPLETED,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Appointment marked as completed', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar',
          });
          this.loadAppointments();
        },
        error: () => {
          this.snackBar.open('Failed to update appointment', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar',
          });
        },
      });
  }

  rescheduleAppointment(appointment: any): void {
    this.snackBar.open(
      'Reschedule functionality - Contact patient to reschedule',
      'Close',
      { duration: 3000 },
    );
    // TODO: Implement reschedule dialog
  }
}
