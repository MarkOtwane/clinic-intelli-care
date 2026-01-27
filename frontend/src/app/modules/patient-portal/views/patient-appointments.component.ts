import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { CancelAppointmentDialogComponent } from '../components/cancel-appointment-dialog.component';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="patient-appointments-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Your Health Journey</p>
          <h1>My Appointments</h1>
          <p class="muted">
            Schedule new appointments, view upcoming visits, and track your
            medical consultations
          </p>
        </div>
        <button mat-raised-button color="primary" (click)="openBookingDialog()">
          <mat-icon>add_circle</mat-icon>
          Book New Appointment
        </button>
      </header>

      <div class="quick-stats" *ngIf="!isLoading">
        <mat-card class="stat-card">
          <mat-icon>schedule</mat-icon>
          <div class="stat-info">
            <h3>{{ pendingAppointments.length }}</h3>
            <p>Pending Approval</p>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>event_available</mat-icon>
          <div class="stat-info">
            <h3>{{ upcomingAppointments.length }}</h3>
            <p>Upcoming</p>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>history</mat-icon>
          <div class="stat-info">
            <h3>{{ allAppointments.length }}</h3>
            <p>Total Appointments</p>
          </div>
        </mat-card>
      </div>

      <mat-tab-group class="appointments-tabs">
        <!-- Upcoming Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>event_available</mat-icon>
            Upcoming
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-state">
              <mat-spinner></mat-spinner>
              <p>Loading your appointments...</p>
            </div>
            <div
              *ngIf="!isLoading && upcomingAppointments.length === 0"
              class="empty-state"
            >
              <mat-icon>event_busy</mat-icon>
              <h3>No upcoming appointments</h3>
              <p>Book an appointment with a doctor to get started</p>
              <button
                mat-raised-button
                color="primary"
                (click)="openBookingDialog()"
              >
                <mat-icon>add</mat-icon>
                Book Appointment
              </button>
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
                  <mat-icon mat-card-avatar class="doctor-icon"
                    >local_hospital</mat-icon
                  >
                  <mat-card-title
                    >Dr.
                    {{ appointment.doctor?.name || 'Unknown' }}</mat-card-title
                  >
                  <mat-card-subtitle>
                    {{
                      appointment.doctor?.specialization || 'General Practice'
                    }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="appointment-details">
                    <div class="detail-row">
                      <mat-icon>event</mat-icon>
                      <span>{{ appointment.date | date: 'fullDate' }}</span>
                    </div>
                    <div class="detail-row">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ appointment.time }}</span>
                    </div>
                    <div class="detail-row" *ngIf="appointment.notes">
                      <mat-icon>notes</mat-icon>
                      <span>{{ appointment.notes }}</span>
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
                    <mat-icon>info</mat-icon>
                    View Details
                  </button>
                  <button
                    mat-button
                    color="warn"
                    (click)="cancelAppointment(appointment)"
                    *ngIf="appointment.status !== 'CANCELLED'"
                  >
                    <mat-icon>cancel</mat-icon>
                    Cancel
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Pending Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>pending</mat-icon>
            Pending
            <span class="badge" *ngIf="pendingAppointments.length">{{
              pendingAppointments.length
            }}</span>
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-state">
              <mat-spinner></mat-spinner>
              <p>Loading...</p>
            </div>
            <div
              *ngIf="!isLoading && pendingAppointments.length === 0"
              class="empty-state"
            >
              <mat-icon>check_circle</mat-icon>
              <h3>No pending appointments</h3>
              <p>All your appointments have been reviewed</p>
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
                  <mat-icon mat-card-avatar class="doctor-icon"
                    >local_hospital</mat-icon
                  >
                  <mat-card-title
                    >Dr.
                    {{ appointment.doctor?.name || 'Unknown' }}</mat-card-title
                  >
                  <mat-card-subtitle>
                    {{
                      appointment.doctor?.specialization || 'General Practice'
                    }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="appointment-details">
                    <div class="detail-row">
                      <mat-icon>event</mat-icon>
                      <span>{{ appointment.date | date: 'fullDate' }}</span>
                    </div>
                    <div class="detail-row">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ appointment.time }}</span>
                    </div>
                  </div>
                  <div class="pending-notice">
                    <mat-icon>info</mat-icon>
                    <p>Waiting for doctor approval</p>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button
                    mat-button
                    color="warn"
                    (click)="cancelAppointment(appointment)"
                  >
                    <mat-icon>cancel</mat-icon>
                    Cancel Request
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- History Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>history</mat-icon>
            History
          </ng-template>
          <div class="tab-content">
            <div *ngIf="isLoading" class="loading-state">
              <mat-spinner></mat-spinner>
              <p>Loading history...</p>
            </div>
            <div
              *ngIf="!isLoading && pastAppointments.length === 0"
              class="empty-state"
            >
              <mat-icon>history</mat-icon>
              <h3>No appointment history</h3>
              <p>Your past appointments will appear here</p>
            </div>
            <div
              class="appointments-list"
              *ngIf="!isLoading && pastAppointments.length > 0"
            >
              <mat-card
                class="appointment-card-compact"
                *ngFor="let appointment of pastAppointments"
              >
                <div class="compact-info">
                  <div class="compact-header">
                    <strong>Dr. {{ appointment.doctor?.name }}</strong>
                    <mat-chip
                      [class]="'status-' + appointment.status.toLowerCase()"
                    >
                      {{ appointment.status }}
                    </mat-chip>
                  </div>
                  <p class="compact-date">
                    {{ appointment.date | date: 'MMM d, y' }} at
                    {{ appointment.time }}
                  </p>
                </div>
                <button mat-icon-button>
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </section>
  `,
  styles: [
    `
      .patient-appointments-page {
        padding: var(--space-6);
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        margin: 0 0 var(--space-2) 0;
      }

      .muted {
        color: var(--gray-600);
        margin: 0;
      }

      .quick-stats {
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
        color: var(--primary-500);
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
        gap: var(--space-4);
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--gray-400);
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

      .doctor-icon {
        background-color: var(--primary-100);
        color: var(--primary-700);
      }

      .appointment-details {
        margin: var(--space-4) 0;
      }

      .detail-row {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-2);
        color: var(--gray-700);
      }

      .detail-row mat-icon {
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
        margin-top: var(--space-4);
      }

      .pending-notice mat-icon {
        color: #f57c00;
      }

      .pending-notice p {
        margin: 0;
        color: #e65100;
        font-weight: 500;
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

      .status-cancelled {
        background-color: #ffebee;
        color: #c62828;
      }

      .status-completed {
        background-color: #f3e5f5;
        color: #6a1b9a;
      }

      mat-card-actions {
        display: flex;
        gap: var(--space-2);
        padding: var(--space-4);
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .appointment-card-compact {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-4);
      }

      .compact-info {
        flex: 1;
      }

      .compact-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-2);
      }

      .compact-date {
        margin: 0;
        color: var(--gray-600);
        font-size: var(--font-size-sm);
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
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-4);
        }

        .appointments-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PatientAppointmentsComponent implements OnInit {
  isLoading = true;
  allAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  pendingAppointments: any[] = [];
  pastAppointments: any[] = [];

  constructor(
    private appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.isLoading = true;
    this.appointmentsService.getMyAppointments().subscribe({
      next: (appointments: any[]) => {
        this.allAppointments = appointments;
        const now = new Date();

        // Filter pending appointments
        this.pendingAppointments = appointments.filter(
          (apt) => apt.status === 'PENDING',
        );

        // Filter upcoming confirmed/scheduled appointments
        this.upcomingAppointments = appointments.filter(
          (apt) =>
            (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED') &&
            new Date(apt.date) >= now,
        );

        // Filter past appointments
        this.pastAppointments = appointments.filter(
          (apt) =>
            apt.status === 'COMPLETED' ||
            apt.status === 'CANCELLED' ||
            (new Date(apt.date) < now && apt.status !== 'PENDING'),
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

  openBookingDialog(): void {
    this.router.navigate(['/appointments/book']);
  }

  cancelAppointment(appointment: any): void {
    const dialogRef = this.dialog.open(CancelAppointmentDialogComponent, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason !== null && reason !== undefined) {
        // User confirmed cancellation
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
              this.loadAppointments();
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
}
