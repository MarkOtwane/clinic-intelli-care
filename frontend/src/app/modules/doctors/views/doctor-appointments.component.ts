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
import { AppointmentsService } from '../../../core/services/appointments.service';
import { DoctorsService } from '../../../core/services/doctors.service';
import { PatientDetailsDialogComponent } from '../components/patient-details-dialog.component';
import { ScheduleFollowupDialogComponent } from '../components/schedule-followup-dialog.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule,
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
    <section class="doctor-appointments-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Clinical Schedule</p>
          <h1>Appointment Management</h1>
          <p class="muted">
            Review patient bookings, approve pending requests, and manage your
            schedule
          </p>
        </div>
      </header>

      <!-- Error State -->
      <mat-card class="error-card" *ngIf="hasError">
        <mat-card-content>
          <div class="error-message-container">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <div>
              <h3>Unable to Load Appointments</h3>
              <p>{{ errorMessage }}</p>
            </div>
          </div>
          <button mat-raised-button color="primary" (click)="loadAppointments()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </mat-card-content>
      </mat-card>

      <div class="stats-cards" *ngIf="!isLoading">
        <mat-card class="stat-card pending">
          <mat-icon>schedule</mat-icon>
          <div class="stat-info">
            <h3>{{ pendingAppointments.length }}</h3>
            <p>Pending Approval</p>
          </div>
        </mat-card>
        <mat-card class="stat-card upcoming">
          <mat-icon>event</mat-icon>
          <div class="stat-info">
            <h3>{{ upcomingAppointments.length }}</h3>
            <p>Upcoming</p>
          </div>
        </mat-card>
        <mat-card class="stat-card today">
          <mat-icon>today</mat-icon>
          <div class="stat-info">
            <h3>{{ todayAppointments.length }}</h3>
            <p>Today</p>
          </div>
        </mat-card>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button
          mat-icon-button
          [class.active]="viewMode === 'table'"
          (click)="setViewMode('table')"
          matTooltip="Table View"
        >
          <mat-icon>table_chart</mat-icon>
        </button>
        <button
          mat-icon-button
          [class.active]="viewMode === 'card'"
          (click)="setViewMode('card')"
          matTooltip="Card View"
        >
          <mat-icon>dashboard</mat-icon>
        </button>
      </div>

      <mat-tab-group class="appointments-tabs">
        <!-- Pending Approvals Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>pending_actions</mat-icon>
            Pending Approvals
            <span class="badge" *ngIf="pendingAppointments.length">{{
              pendingAppointments.length
            }}</span>
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-state">
              <mat-spinner></mat-spinner>
              <p>Loading appointments...</p>
            </div>
            <div
              *ngIf="!isLoading && pendingAppointments.length === 0"
              class="empty-state"
            >
              <mat-icon>check_circle</mat-icon>
              <h3>No pending approvals</h3>
              <p>All appointment requests have been processed</p>
            </div>

            <!-- Table View -->
            <div
              class="appointments-table-view"
              *ngIf="
                !isLoading &&
                pendingAppointments.length > 0 &&
                viewMode === 'table'
              "
            >
              <table class="appointments-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Age</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let appointment of pendingAppointments"
                    class="appointment-row pending-row"
                  >
                    <td class="patient-name">
                      <div class="patient-badge">
                        {{
                          appointment.patient?.name?.charAt(0).toUpperCase() ||
                            'P'
                        }}
                      </div>
                      <div class="patient-details">
                        <strong>{{
                          appointment.patient?.name || 'Unknown Patient'
                        }}</strong>
                        <small>{{
                          appointment.patient?.gender || 'Not specified'
                        }}</small>
                      </div>
                    </td>
                    <td class="appointment-datetime">
                      <div>{{ appointment.date | date: 'MMM d, y' }}</div>
                      <div class="time">{{ appointment.time }}</div>
                    </td>
                    <td class="appointment-type">
                      {{ appointment.type || 'General Checkup' }}
                    </td>
                    <td class="patient-age">
                      {{ appointment.patient?.age || '-' }}
                    </td>
                    <td class="patient-contact">
                      {{ appointment.patient?.phone || 'N/A' }}
                    </td>
                    <td class="appointment-actions">
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="approveAppointment(appointment)"
                        matTooltip="Approve"
                      >
                        <mat-icon>check_circle</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        color="warn"
                        (click)="rejectAppointment(appointment)"
                        matTooltip="Reject"
                      >
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Card View -->
            <div
              class="appointments-grid"
              *ngIf="
                !isLoading &&
                pendingAppointments.length > 0 &&
                viewMode === 'card'
              "
            >
              <mat-card
                class="appointment-card pending-card doctor-card"
                *ngFor="let appointment of pendingAppointments"
              >
                <div class="card-accent pending-accent"></div>
                <mat-card-header class="doctor-card-header">
                  <div class="patient-avatar pending">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div class="header-content">
                    <mat-card-title>{{
                      appointment.patient?.name || 'Unknown Patient'
                    }}</mat-card-title>
                    <mat-card-subtitle>
                      {{ appointment.date | date: 'EEE, MMM d' }} at
                      {{ appointment.time }}
                    </mat-card-subtitle>
                  </div>
                  <mat-chip class="status-pending-chip">PENDING</mat-chip>
                </mat-card-header>
                <mat-card-content class="doctor-card-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <mat-icon>cake</mat-icon>
                      <div>
                        <small>Age</small>
                        <strong>{{
                          appointment.patient?.age || 'Unknown'
                        }}</strong>
                      </div>
                    </div>
                    <div class="info-item">
                      <mat-icon>wc</mat-icon>
                      <div>
                        <small>Gender</small>
                        <strong>{{
                          appointment.patient?.gender || 'Not specified'
                        }}</strong>
                      </div>
                    </div>
                    <div class="info-item">
                      <mat-icon>phone</mat-icon>
                      <div>
                        <small>Phone</small>
                        <strong>{{
                          appointment.patient?.phone || 'N/A'
                        }}</strong>
                      </div>
                    </div>
                  </div>
                  <div class="notes-section" *ngIf="appointment.notes">
                    <mat-icon>description</mat-icon>
                    <div>
                      <strong>Patient Notes</strong>
                      <p>{{ appointment.notes }}</p>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions class="doctor-card-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="approveAppointment(appointment)"
                  >
                    <mat-icon>done</mat-icon>
                    Approve
                  </button>
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="rejectAppointment(appointment)"
                  >
                    <mat-icon>close</mat-icon>
                    Reject
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Upcoming Appointments Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>event_available</mat-icon>
            Upcoming Appointments
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-state">
              <mat-spinner></mat-spinner>
              <p>Loading appointments...</p>
            </div>
            <div
              *ngIf="!isLoading && upcomingAppointments.length === 0"
              class="empty-state"
            >
              <mat-icon>event_busy</mat-icon>
              <h3>No upcoming appointments</h3>
              <p>Your schedule is clear</p>
            </div>
            <div
              class="appointments-grid"
              *ngIf="!isLoading && upcomingAppointments.length > 0"
            >
              <mat-card
                class="appointment-card"
                *ngFor="let appointment of upcomingAppointments"
              >
                <mat-card-header>
                  <mat-icon mat-card-avatar class="patient-icon"
                    >person</mat-icon
                  >
                  <mat-card-title>{{
                    appointment.patient?.name || 'Unknown Patient'
                  }}</mat-card-title>
                  <mat-card-subtitle>
                    {{ appointment.date | date: 'EEEE, MMMM d, y' }} at
                    {{ appointment.time }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="patient-info">
                    <div class="info-row">
                      <mat-icon>phone</mat-icon>
                      <span>{{ appointment.patient?.phone || 'N/A' }}</span>
                    </div>
                    <div class="info-row" *ngIf="appointment.patient?.age">
                      <mat-icon>cake</mat-icon>
                      <span>{{ appointment.patient?.age }} years old</span>
                    </div>
                  </div>
                  <mat-chip-set>
                    <mat-chip
                      [class]="'status-' + appointment.status.toLowerCase()"
                    >
                      {{ appointment.status }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-content>
                <mat-card-actions>
                  <button
                    mat-button
                    (click)="viewPatientDetails(appointment.patient)"
                  >
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                  <button mat-button (click)="scheduleFollowUp(appointment)">
                    <mat-icon>add_circle</mat-icon>
                    Schedule Follow-up
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </section>
  `,
  styles: [
    `
      .doctor-appointments-page {
        padding: var(--space-6);
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: var(--space-6);
      }

      .page-header h1 {
        margin: var(--space-2) 0;
        font-size: 2rem;
        font-weight: 700;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin: 0 0 var(--space-2);
      }

      .muted {
        color: var(--gray-600);
        margin: 0;
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-5);
      }

      .stat-card mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .stat-card.pending mat-icon {
        color: #ff9800;
      }

      .stat-card.upcoming mat-icon {
        color: #2196f3;
      }

      .stat-card.today mat-icon {
        color: #4caf50;
      }

      .stat-info h3 {
        font-size: 2rem;
        margin: 0;
        font-weight: 700;
      }

      .stat-info p {
        margin: 0;
        color: var(--gray-600);
      }

      .appointments-tabs {
        margin-top: var(--space-6);
      }

      .tab-content {
        padding: var(--space-6) 0;
      }

      .loading-state,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        text-align: center;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--gray-400);
        margin-bottom: var(--space-4);
      }

      .error-card {
        background: #ffebee;
        border-left: 4px solid #f44336;
        margin-bottom: var(--space-6);
      }

      .error-message-container {
        display: flex;
        align-items: flex-start;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
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
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-4);
      }

      .appointment-card {
        border-radius: var(--radius-lg);
      }

      .pending-card {
        border-left: 4px solid #ff9800;
      }

      .patient-icon {
        background-color: var(--primary-100);
        color: var(--primary-700);
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
  viewMode: 'table' | 'card' = 'card'; // Toggle between table and card view

  constructor(
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  setViewMode(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.doctorsService.getDoctorDashboard().subscribe({
      next: (data: any) => {
        console.log('Dashboard data received:', data);

        // Ensure we have appointments data
        if (!data || !data.upcomingAppointments) {
          console.warn('No appointments data received');
          this.pendingAppointments = [];
          this.upcomingAppointments = [];
          this.todayAppointments = [];
          this.isLoading = false;
          return;
        }

        // Filter pending appointments
        this.pendingAppointments = data.upcomingAppointments.filter(
          (apt: any) => apt.status === 'PENDING',
        );

        // Filter confirmed/scheduled upcoming appointments
        this.upcomingAppointments = data.upcomingAppointments.filter(
          (apt: any) =>
            apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED',
        );

        // Filter today's appointments
        const today = new Date().toDateString();
        this.todayAppointments = data.upcomingAppointments.filter(
          (apt: any) => new Date(apt.date).toDateString() === today,
        );

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
        });
      },
    });
  }

  approveAppointment(appointment: any): void {
    this.appointmentsService.approveAppointment(appointment.id).subscribe({
      next: () => {
        this.snackBar.open('Appointment approved successfully', 'Close', {
          duration: 3000,
        });
        this.loadAppointments();
      },
      error: () => {
        this.snackBar.open('Failed to approve appointment', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  rejectAppointment(appointment: any): void {
    const reason = prompt('Reason for rejection (optional):');
    this.appointmentsService
      .rejectAppointment(appointment.id, reason || undefined)
      .subscribe({
        next: () => {
          this.snackBar.open('Appointment rejected', 'Close', {
            duration: 3000,
          });
          this.loadAppointments();
        },
        error: () => {
          this.snackBar.open('Failed to reject appointment', 'Close', {
            duration: 3000,
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
}
