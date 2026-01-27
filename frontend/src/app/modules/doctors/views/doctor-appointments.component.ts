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
import { AppointmentsService } from '../../../core/services/appointments.service';
import { DoctorsService } from '../../../core/services/doctors.service';

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
            <div
              class="appointments-grid"
              *ngIf="!isLoading && pendingAppointments.length > 0"
            >
              <mat-card
                class="appointment-card pending-card"
                *ngFor="let appointment of pendingAppointments"
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
                    <div class="info-row" *ngIf="appointment.patient?.gender">
                      <mat-icon>wc</mat-icon>
                      <span>{{ appointment.patient?.gender }}</span>
                    </div>
                  </div>
                  <div class="notes" *ngIf="appointment.notes">
                    <strong>Notes:</strong>
                    <p>{{ appointment.notes }}</p>
                  </div>
                  <mat-chip-set>
                    <mat-chip class="status-pending">PENDING APPROVAL</mat-chip>
                  </mat-chip-set>
                </mat-card-content>
                <mat-card-actions>
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="approveAppointment(appointment)"
                  >
                    <mat-icon>check</mat-icon>
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
                  <button mat-button>
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
    `,
  ],
})
export class DoctorAppointmentsComponent implements OnInit {
  isLoading = true;
  pendingAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  todayAppointments: any[] = [];

  constructor(
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.isLoading = true;
    this.doctorsService.getDoctorDashboard().subscribe({
      next: (data: any) => {
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
        this.isLoading = false;
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
    this.snackBar.open('Follow-up scheduling feature coming soon', 'Close', {
      duration: 3000,
    });
    // TODO: Open dialog to schedule follow-up appointment with this patient
  }
}
