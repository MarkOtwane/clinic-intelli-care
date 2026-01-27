import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';

import {
  Appointment,
  CreateAppointmentRequest,
} from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience?: number;
  bio?: string;
  availability: Array<{
    day: number;
    startTime: string;
    endTime: string;
  }>;
}

interface TimeSlotResponse {
  startTime: string;
  endTime: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="appointment-booking">
      <div class="booking-header">
        <h1>
          <mat-icon>event</mat-icon>
          Book Appointment
        </h1>
        <p class="subtitle">
          Schedule your consultation with our healthcare professionals
        </p>
      </div>

      <mat-card class="booking-card">
        <mat-stepper #stepper>
          <!-- Step 1: Select Doctor -->
          <mat-step label="Choose Doctor">
            <form [formGroup]="doctorForm">
              <h3>Select Your Doctor</h3>

              <div class="doctor-selection">
                <div class="search-section">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Search by name or specialty</mat-label>
                    <input
                      matInput
                      formControlName="searchTerm"
                      placeholder="e.g., cardiologist, Dr. Smith"
                    />
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>

                <div class="doctors-grid">
                  <mat-card
                    class="doctor-card"
                    *ngFor="let doctor of filteredDoctors"
                    [class.selected]="selectedDoctor?.id === doctor.id"
                    (click)="selectDoctor(doctor)"
                  >
                    <mat-card-content>
                      <div class="doctor-info">
                        <h4>{{ doctor.name }}</h4>
                        <p class="specialty">{{ doctor.specialization }}</p>
                        <div class="experience" *ngIf="doctor.experience">
                          {{ doctor.experience }} years experience
                        </div>
                        <div
                          class="availability"
                          *ngIf="doctor.availability.length > 0"
                        >
                          <mat-chip-set>
                            <mat-chip
                              *ngFor="
                                let avail of doctor.availability.slice(0, 3)
                              "
                            >
                              {{ getDayName(avail.day) }}
                            </mat-chip>
                          </mat-chip-set>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>

                <div class="step-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    matStepperNext
                    [disabled]="!selectedDoctor"
                    (click)="loadAvailableSlots()"
                  >
                    Next: Select Date & Time
                  </button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Select Date & Time -->
          <mat-step label="Choose Date & Time">
            <form [formGroup]="scheduleForm">
              <h3>Select Appointment Details</h3>

              <div class="selected-doctor" *ngIf="selectedDoctor">
                <mat-chip color="primary" selected>
                  <mat-icon>person</mat-icon>
                  {{ selectedDoctor.name }} -
                  {{ selectedDoctor.specialization }}
                </mat-chip>
              </div>

              <div class="schedule-selection">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Appointment Date</mat-label>
                  <input
                    matInput
                    [matDatepicker]="datePicker"
                    formControlName="selectedDate"
                    [min]="minDate"
                    (dateChange)="onDateSelected($event.value)"
                  />
                  <mat-datepicker-toggle
                    matSuffix
                    [for]="datePicker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #datePicker></mat-datepicker>
                </mat-form-field>

                <div class="time-slots" *ngIf="availableSlots.length > 0">
                  <h4>Available Times</h4>
                  <div class="slots-grid">
                    <button
                      mat-stroked-button
                      *ngFor="let slot of availableSlots"
                      [disabled]="!slot.available"
                      [class.selected]="
                        scheduleForm.get('selectedTime')?.value === slot.time
                      "
                      (click)="selectTimeSlot(slot.time)"
                      class="time-slot"
                    >
                      {{ slot.time }}
                    </button>
                  </div>
                </div>

                <div
                  class="no-slots"
                  *ngIf="
                    scheduleForm.get('selectedDate')?.value &&
                    availableSlots.length === 0
                  "
                >
                  <mat-icon>event_busy</mat-icon>
                  <h4>No available slots</h4>
                  <p>Please select a different date</p>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button
                  mat-raised-button
                  color="primary"
                  matStepperNext
                  [disabled]="scheduleForm.invalid"
                  (click)="prepareAppointmentDetails()"
                >
                  Next: Appointment Details
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Appointment Details -->
          <mat-step label="Appointment Details">
            <form [formGroup]="detailsForm">
              <h3>Appointment Information</h3>

              <div class="appointment-details">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Appointment Type</mat-label>
                  <mat-select formControlName="appointmentType">
                    <mat-option value="CONSULTATION"
                      >General Consultation</mat-option
                    >
                    <mat-option value="FOLLOW_UP">Follow-up Visit</mat-option>
                    <mat-option value="TELEMEDICINE">Telemedicine</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Reason for Visit</mat-label>
                  <textarea
                    matInput
                    formControlName="reason"
                    rows="4"
                    placeholder="Please describe your symptoms or reason for the appointment"
                  >
                  </textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Additional Notes</mat-label>
                  <textarea
                    matInput
                    formControlName="notes"
                    rows="3"
                    placeholder="Any additional information (optional)"
                  >
                  </textarea>
                </mat-form-field>

                <div class="emergency-option">
                  <mat-checkbox formControlName="isEmergency">
                    This is an emergency appointment
                  </mat-checkbox>
                </div>
              </div>

              <div class="appointment-summary" *ngIf="appointmentSummary">
                <h4>Appointment Summary</h4>
                <div class="summary-item">
                  <span class="label">Doctor:</span>
                  <span class="value">{{ appointmentSummary.doctor }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Date:</span>
                  <span class="value">{{
                    appointmentSummary.date | date: 'fullDate'
                  }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Time:</span>
                  <span class="value">{{ appointmentSummary.time }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Type:</span>
                  <span class="value">{{ appointmentSummary.type }}</span>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="bookAppointment()"
                  [disabled]="detailsForm.invalid || isBooking"
                >
                  <mat-spinner diameter="20" *ngIf="isBooking"></mat-spinner>
                  <mat-icon *ngIf="!isBooking">check_circle</mat-icon>
                  <span *ngIf="!isBooking">Confirm Booking</span>
                  <span *ngIf="isBooking">Booking...</span>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 4: Confirmation -->
          <mat-step label="Confirmation">
            <div class="confirmation-section">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Appointment Booked Successfully!</h2>

              <div class="confirmation-details">
                <mat-card class="details-card">
                  <mat-card-content>
                    <h3>Appointment Details</h3>
                    <div class="detail-row">
                      <strong>Appointment ID:</strong>
                      <span>{{ confirmedAppointment?.id }}</span>
                    </div>
                    <div class="detail-row">
                      <strong>Doctor:</strong>
                      <span>{{ selectedDoctor?.name }}</span>
                    </div>
                    <div class="detail-row">
                      <strong>Date & Time:</strong>
                      <span
                        >{{ confirmedAppointment?.date | date: 'fullDate' }} at
                        {{ confirmedAppointment?.startTime }}</span
                      >
                    </div>
                    <div class="detail-row">
                      <strong>Status:</strong>
                      <mat-chip color="accent" selected>{{
                        confirmedAppointment?.status
                      }}</mat-chip>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <div class="confirmation-actions">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="bookAnother()"
                >
                  <mat-icon>add</mat-icon>
                  Book Another Appointment
                </button>
                <button mat-button routerLink="/appointments">
                  <mat-icon>calendar_month</mat-icon>
                  View My Appointments
                </button>
                <button mat-button (click)="goHome()">
                  <mat-icon>home</mat-icon>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .appointment-booking {
        padding: 16px;
        max-width: 900px;
        margin: 0 auto;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .booking-header {
        text-align: center;
        margin-bottom: 20px;
        flex-shrink: 0;
      }

      .booking-header h1 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #2c3e50;
        margin: 0 0 4px 0;
        font-size: 24px;
      }

      .subtitle {
        color: #7f8c8d;
        margin: 0;
        font-size: 14px;
      }

      .booking-card {
        padding: 16px;
        flex: 1;
        overflow-y: auto;
        max-height: calc(100vh - 180px);
      }

      ::ng-deep .mat-stepper-header {
        height: auto !important;
        min-height: 48px !important;
      }

      ::ng-deep .mat-step-label {
        font-size: 14px !important;
      }

      ::ng-deep .mat-step-body-content {
        padding: 12px 0 !important;
      }

      ::ng-deep .mat-stepper-horizontal {
        width: 100% !important;
      }

      .full-width {
        width: 100%;
        margin-bottom: 12px;
      }

      .doctor-selection {
        margin: 16px 0;
      }

      .search-section {
        margin-bottom: 16px;
      }

      .doctors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
        max-height: 400px;
        overflow-y: auto;
      }

      .doctor-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        padding: 12px;
      }

      .doctor-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .doctor-card.selected {
        border-color: #2196f3;
        background: #f3f8ff;
      }

      .doctor-info h4 {
        margin: 0 0 4px 0;
        color: #2c3e50;
        font-size: 14px;
      }

      .specialty {
        color: #7f8c8d;
        margin: 0 0 4px 0;
        font-size: 13px;
      }

      .experience {
        color: #7f8c8d;
        font-size: 12px;
        margin-bottom: 4px;
      }

      .selected-doctor {
        margin-bottom: 16px;
      }

      .schedule-selection {
        margin: 16px 0;
      }

      .time-slots {
        margin-top: 16px;
      }

      .time-slots h4 {
        margin: 0 0 12px 0;
        color: #2c3e50;
        font-size: 14px;
      }

      .slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
      }

      .time-slot {
        padding: 8px 6px;
        text-align: center;
        border-radius: 6px;
        transition: all 0.3s ease;
        font-size: 13px;
      }

      .time-slot:hover:not(:disabled) {
        background: #e3f2fd;
        border-color: #2196f3;
      }

      .time-slot.selected {
        background: #2196f3;
        color: white;
        border-color: #2196f3;
      }

      .time-slot:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .no-slots {
        text-align: center;
        padding: 24px 12px;
        color: #7f8c8d;
      }

      .no-slots mat-icon {
        font-size: 48px;
        margin-bottom: 8px;
        opacity: 0.5;
      }

      .appointment-details {
        margin: 16px 0;
      }

      .emergency-option {
        margin: 12px 0;
      }

      .appointment-summary {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
      }

      .appointment-summary h4 {
        margin: 0 0 12px 0;
        color: #2c3e50;
        font-size: 14px;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #ecf0f1;
        font-size: 13px;
      }

      .summary-item:last-child {
        border-bottom: none;
      }

      .summary-item .label {
        font-weight: 500;
        color: #7f8c8d;
      }

      .summary-item .value {
        color: #2c3e50;
      }

      .step-actions {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .step-actions button {
        flex: 1;
        min-width: 120px;
      }

      .confirmation-section {
        text-align: center;
        padding: 24px 12px;
      }

      .success-icon {
        font-size: 56px;
        color: #4caf50;
        margin-bottom: 12px;
      }

      .confirmation-section h2 {
        color: #2c3e50;
        margin: 0 0 20px 0;
        font-size: 20px;
      }

      .confirmation-details {
        margin: 20px 0;
      }

      .details-card {
        max-width: 400px;
        margin: 0 auto;
      }

      .details-card h3 {
        margin: 0 0 12px 0;
        color: #2c3e50;
        font-size: 14px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid #ecf0f1;
        font-size: 13px;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .detail-row strong {
        color: #2c3e50;
      }

      .confirmation-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
      }

      .confirmation-actions button {
        font-size: 13px;
        padding: 8px 16px;
      }

      mat-spinner {
        margin-right: 6px;
      }

      @media (max-width: 768px) {
        .appointment-booking {
          padding: 12px;
        }

        .booking-header {
          margin-bottom: 12px;
        }

        .booking-header h1 {
          font-size: 20px;
          margin-bottom: 2px;
        }

        .booking-card {
          padding: 12px;
          max-height: calc(100vh - 140px);
        }

        .doctors-grid {
          grid-template-columns: 1fr;
          max-height: 300px;
        }

        .slots-grid {
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          max-height: 150px;
        }

        .step-actions {
          flex-direction: column;
          gap: 8px;
        }

        .step-actions button {
          width: 100%;
        }

        .confirmation-actions {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .confirmation-actions button {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .appointment-booking {
          padding: 8px;
        }

        .booking-card {
          padding: 8px;
          max-height: calc(100vh - 120px);
        }

        .booking-header h1 {
          font-size: 18px;
        }

        .subtitle {
          font-size: 12px;
        }

        .doctors-grid {
          grid-template-columns: 1fr;
          gap: 8px;
          max-height: 250px;
        }

        .slots-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          max-height: 120px;
        }
      }
    `,
  ],
})
export class AppointmentBookingComponent implements OnInit {
  currentUser: User | null = null;

  // Forms
  doctorForm: FormGroup;
  scheduleForm: FormGroup;
  detailsForm: FormGroup;

  // Data
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  availableSlots: TimeSlot[] = [];

  // State
  minDate = new Date();
  isBooking = false;
  confirmedAppointment: Appointment | null = null;
  appointmentSummary: any = null;

  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    // Set minimum date to tomorrow
    this.minDate.setDate(this.minDate.getDate() + 1);

    this.doctorForm = this.fb.group({
      searchTerm: [''],
    });

    this.scheduleForm = this.fb.group({
      selectedDate: ['', Validators.required],
      selectedTime: ['', Validators.required],
    });

    this.detailsForm = this.fb.group({
      appointmentType: ['CONSULTATION', Validators.required],
      reason: ['', Validators.required],
      notes: [''],
      isEmergency: [false],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadDoctors();
    this.setupFormSubscriptions();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  private loadDoctors(): void {
    this.appointmentsService.getAvailableDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.filteredDoctors = [...this.doctors];
      },
      error: () => {
        this.snackBar.open('Failed to load available doctors', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  private setupFormSubscriptions(): void {
    this.doctorForm.get('searchTerm')?.valueChanges.subscribe((term) => {
      this.filterDoctors(term);
    });
  }

  private filterDoctors(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredDoctors = [...this.doctors];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredDoctors = this.doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(term) ||
        doctor.specialization.toLowerCase().includes(term),
    );
  }

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
  }

  loadAvailableSlots(): void {
    if (!this.selectedDoctor) return;

    const selectedDate = this.scheduleForm.get('selectedDate')?.value;
    if (!selectedDate) return;

    this.appointmentsService
      .getAvailableSlots(this.selectedDoctor.id, selectedDate)
      .subscribe({
        next: (slots: string[]) => {
          this.availableSlots = slots.map((time: string) => ({
            time,
            available: true,
          }));
        },
        error: () => {
          this.availableSlots = [];
          this.snackBar.open('Failed to load available time slots', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onDateSelected(date: Date): void {
    if (date) {
      // In real implementation, load slots for selected date
      this.loadAvailableSlots();
    }
  }

  selectTimeSlot(time: string): void {
    this.scheduleForm.patchValue({ selectedTime: time });
  }

  prepareAppointmentDetails(): void {
    const date = this.scheduleForm.get('selectedDate')?.value;
    const time = this.scheduleForm.get('selectedTime')?.value;

    this.appointmentSummary = {
      doctor: this.selectedDoctor?.name,
      date: date,
      time: time,
      type: this.detailsForm.get('appointmentType')?.value,
    };
  }

  bookAppointment(): void {
    if (!this.currentUser || !this.selectedDoctor) return;

    this.isBooking = true;

    const appointmentRequest: CreateAppointmentRequest = {
      doctorId: this.selectedDoctor.id,
      date: this.scheduleForm
        .get('selectedDate')
        ?.value?.toISOString()
        .split('T')[0],
      time: this.scheduleForm.get('selectedTime')?.value,
      notes: this.detailsForm.get('notes')?.value,
      type: this.detailsForm.get('appointmentType')?.value,
      isEmergency: this.detailsForm.get('isEmergency')?.value,
    };

    this.appointmentsService.createAppointment(appointmentRequest).subscribe({
      next: (appointment) => {
        this.isBooking = false;
        this.confirmedAppointment = appointment;
        this.snackBar.open('Appointment booked successfully!', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.isBooking = false;
        const errorMessage =
          error.error?.message ||
          'Failed to book appointment. Please try again.';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      },
    });
  }

  private calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + 30; // 30 minutes appointment
    const endHours = Math.floor(endMinutes / 60);
    const remainingMinutes = endMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
  }

  bookAnother(): void {
    // Reset all forms and state
    this.selectedDoctor = null;
    this.availableSlots = [];
    this.confirmedAppointment = null;
    this.appointmentSummary = null;

    this.doctorForm.reset();
    this.scheduleForm.reset();
    this.detailsForm.reset();

    // Reset stepper (this would require ViewChild reference in real implementation)
    window.location.reload();
  }

  goHome(): void {
    // Navigate to dashboard (would use Router in real implementation)
    this.snackBar.open('Redirecting to dashboard...', 'Close', {
      duration: 2000,
    });
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek] || 'Unknown';
  }
}
