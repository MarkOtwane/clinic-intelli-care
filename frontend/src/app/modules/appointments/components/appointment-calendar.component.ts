import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subject, takeUntil } from 'rxjs';

import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

interface TimeSlot {
  time: string;
  appointments: Appointment[];
  available: boolean;
}

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatGridListModule,
  ],
  template: `
    <div class="appointment-calendar">
      <!-- Header Section -->
      <div class="calendar-header">
        <div class="header-info">
          <h1>
            <mat-icon>calendar_month</mat-icon>
            Appointment Calendar
          </h1>
          <p class="subtitle">Manage your appointments and schedule</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openBookingDialog()">
            <mat-icon>add</mat-icon>
            New Appointment
          </button>
          <button mat-raised-button (click)="refreshCalendar()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Calendar View Toggle -->
      <mat-tab-group class="calendar-tabs">
        <!-- Month View -->
        <mat-tab label="Month View">
          <div class="tab-content">
            <div class="month-navigation">
              <button mat-icon-button (click)="previousMonth()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <h2>{{ currentMonthYear }}</h2>
              <button mat-icon-button (click)="nextMonth()">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <div class="calendar-grid">
              <!-- Days of week header -->
              <div class="days-header">
                <div class="day-header" *ngFor="let day of daysOfWeek">{{ day }}</div>
              </div>
              
              <!-- Calendar days -->
              <div class="calendar-days">
                <div 
                  class="calendar-day" 
                  *ngFor="let day of calendarDays"
                  [class.other-month]="!day.isCurrentMonth"
                  [class.today]="day.isToday"
                  [class.has-appointments]="day.appointments.length > 0"
                  (click)="selectDay(day)">
                  
                  <div class="day-number">{{ day.date.getDate() }}</div>
                  
                  <div class="day-appointments" *ngIf="day.appointments.length > 0">
                    <div 
                      class="appointment-dot" 
                      *ngFor="let appointment of day.appointments.slice(0, 3)"
                      [class]="getAppointmentStatusClass(appointment.status)">
                    </div>
                    <div class="appointment-count" *ngIf="day.appointments.length > 3">
                      +{{ day.appointments.length - 3 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Week View -->
        <mat-tab label="Week View">
          <div class="tab-content">
            <div class="week-navigation">
              <button mat-icon-button (click)="previousWeek()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <h2>{{ weekRange }}</h2>
              <button mat-icon-button (click)="nextWeek()">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <div class="week-grid">
              <div class="week-header">
                <div class="time-column"></div>
                <div class="day-column" *ngFor="let day of weekDays">
                  <div class="day-name">{{ day | date:'EEEE' }}</div>
                  <div class="day-date">{{ day | date:'MMM d' }}</div>
                </div>
              </div>
              
              <div class="week-timeslot" *ngFor="let slot of timeSlots">
                <div class="time-label">{{ slot.time }}</div>
                <div class="time-column" *ngFor="let day of weekDays">
                  <div class="time-slot-content">
                    <div 
                      class="appointment-block" 
                      *ngFor="let appointment of getAppointmentsForTimeSlot(day, slot.time)"
                      [class]="getAppointmentStatusClass(appointment.status)"
                      (click)="viewAppointment(appointment)">
                      <div class="appointment-info">
                        <div class="patient-name">{{ getPatientName(appointment) }}</div>
                        <div class="appointment-time">{{ appointment.startTime }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- List View -->
        <mat-tab label="List View">
          <div class="tab-content">
            <div class="list-filters">
              <mat-form-field appearance="outline">
                <mat-label>Filter by Status</mat-label>
                <mat-select [(value)]="selectedStatus" (selectionChange)="filterAppointments()">
                  <mat-option value="">All Statuses</mat-option>
                  <mat-option value="SCHEDULED">Scheduled</mat-option>
                  <mat-option value="CONFIRMED">Confirmed</mat-option>
                  <mat-option value="COMPLETED">Completed</mat-option>
                  <mat-option value="CANCELLED">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Filter by Date</mat-label>
                <input matInput [matDatepicker]="datePicker" [(ngModel)]="selectedDate" (dateChange)="filterAppointments()">
                <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                <mat-datepicker #datePicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="appointments-list">
              <mat-card class="appointment-item" *ngFor="let appointment of filteredAppointments">
                <mat-card-content>
                  <div class="appointment-main">
                    <div class="appointment-time-info">
                      <div class="date-time">
                        <strong>{{ appointment.date | date:'MMM d, y' }}</strong>
                        <span>{{ appointment.startTime }} - {{ appointment.endTime }}</span>
                      </div>
                      <mat-chip [color]="getStatusColor(appointment.status)" selected>
                        {{ appointment.status }}
                      </mat-chip>
                    </div>

                    <div class="appointment-details">
                      <h4>Patient Appointment</h4>
                      <p>{{ appointment.reason }}</p>
                      <div class="appointment-meta">
                        <span class="patient-info">
                          <mat-icon>person</mat-icon>
                          {{ getPatientName(appointment) }}
                        </span>
                        <span class="duration">
                          <mat-icon>schedule</mat-icon>
                          {{ calculateDuration(appointment) }} minutes
                        </span>
                      </div>
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
                        <button mat-menu-item (click)="editAppointment(appointment)">
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </button>
                        <button mat-menu-item (click)="confirmAppointment(appointment)" *ngIf="appointment.status === 'SCHEDULED'">
                          <mat-icon>check_circle</mat-icon>
                          <span>Confirm</span>
                        </button>
                        <button mat-menu-item (click)="completeAppointment(appointment)" *ngIf="appointment.status === 'CONFIRMED'">
                          <mat-icon>task_alt</mat-icon>
                          <span>Mark Complete</span>
                        </button>
                        <button mat-menu-item (click)="cancelAppointment(appointment)">
                          <mat-icon>cancel</mat-icon>
                          <span>Cancel</span>
                        </button>
                      </mat-menu>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="empty-state" *ngIf="filteredAppointments.length === 0">
                <mat-icon>event_available</mat-icon>
                <h3>No appointments found</h3>
                <p>{{ selectedStatus ? 'No appointments with selected status' : 'No appointments scheduled' }}</p>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Loading Spinner -->
      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .appointment-calendar {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-info h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .subtitle {
      color: #7f8c8d;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .calendar-tabs {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tab-content {
      padding: 24px;
    }

    .month-navigation, .week-navigation {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .month-navigation h2, .week-navigation h2 {
      margin: 0;
      color: #2c3e50;
      min-width: 200px;
      text-align: center;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .days-header {
      display: contents;
    }

    .day-header {
      background: #f8f9fa;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      color: #2c3e50;
    }

    .calendar-days {
      display: contents;
    }

    .calendar-day {
      background: white;
      min-height: 80px;
      padding: 8px;
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s;
    }

    .calendar-day:hover {
      background: #f0f0f0;
    }

    .calendar-day.other-month {
      background: #f8f9fa;
      color: #bdc3c7;
    }

    .calendar-day.today {
      background: #e3f2fd;
      border: 2px solid #2196f3;
    }

    .calendar-day.has-appointments {
      background: #fff3e0;
    }

    .day-number {
      font-weight: 600;
      color: #2c3e50;
    }

    .day-appointments {
      position: absolute;
      bottom: 4px;
      left: 4px;
      right: 4px;
      display: flex;
      gap: 2px;
      align-items: center;
    }

    .appointment-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .appointment-dot.scheduled { background: #ff9800; }
    .appointment-dot.confirmed { background: #4caf50; }
    .appointment-dot.completed { background: #2196f3; }
    .appointment-dot.cancelled { background: #f44336; }

    .appointment-count {
      font-size: 10px;
      color: #7f8c8d;
      margin-left: 4px;
    }

    .week-grid {
      display: grid;
      grid-template-columns: 100px repeat(7, 1fr);
      gap: 1px;
      background: #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .week-header {
      display: contents;
    }

    .time-column {
      background: #f8f9fa;
      padding: 12px 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .day-column {
      background: #f8f9fa;
      padding: 12px 8px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
    }

    .day-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .day-date {
      color: #7f8c8d;
      font-size: 14px;
    }

    .week-timeslot {
      display: contents;
    }

    .time-label {
      background: white;
      padding: 16px 8px;
      text-align: center;
      font-size: 12px;
      color: #7f8c8d;
      border-bottom: 1px solid #f0f0f0;
    }

    .time-slot-content {
      background: white;
      min-height: 60px;
      padding: 8px;
      position: relative;
    }

    .appointment-block {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 2px;
      cursor: pointer;
      font-size: 12px;
    }

    .appointment-block.confirmed {
      background: #e8f5e8;
      border-color: #4caf50;
    }

    .appointment-block.completed {
      background: #f0f8ff;
      border-color: #2196f3;
    }

    .appointment-block.cancelled {
      background: #ffebee;
      border-color: #f44336;
      opacity: 0.6;
    }

    .appointment-info .patient-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .appointment-info .appointment-time {
      color: #7f8c8d;
    }

    .list-filters {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .list-filters mat-form-field {
      width: 250px;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .appointment-item {
      border-left: 4px solid #2196f3;
    }

    .appointment-main {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .appointment-time-info {
      min-width: 150px;
      text-align: center;
    }

    .date-time {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
    }

    .date-time strong {
      color: #2c3e50;
    }

    .date-time span {
      color: #7f8c8d;
      font-size: 14px;
    }

    .appointment-details {
      flex: 1;
    }

    .appointment-details h4 {
      margin: 0 0 4px 0;
      color: #2c3e50;
    }

    .appointment-details p {
      margin: 0 0 8px 0;
      color: #7f8c8d;
    }

    .appointment-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #7f8c8d;
    }

    .appointment-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .appointment-actions {
      min-width: 60px;
      text-align: right;
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

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    @media (max-width: 768px) {
      .calendar-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .header-actions {
        flex-wrap: wrap;
        justify-content: center;
      }

      .week-grid {
        font-size: 12px;
      }

      .list-filters {
        flex-direction: column;
      }

      .list-filters mat-form-field {
        width: 100%;
      }

      .appointment-main {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .appointment-time-info {
        min-width: unset;
        text-align: left;
      }

      .appointment-meta {
        flex-direction: column;
        gap: 8px;
      }

      .appointment-actions {
        text-align: left;
      }
    }
  `]
})
export class AppointmentCalendarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading = false;
  
  // Calendar state
  currentDate = new Date();
  selectedDate: Date | null = null;
  selectedStatus = '';
  
  // Calendar data
  calendarDays: CalendarDay[] = [];
  weekDays: Date[] = [];
  timeSlots: TimeSlot[] = [];
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.generateTimeSlots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadAppointments();
        }
      });
  }

  private loadAppointments(): void {
    if (!this.currentUser) return;
    
    this.isLoading = true;
    
    // Load all appointments for now - in real implementation, filter by user role
    this.appointmentsService.getAllAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.generateCalendarDays();
          this.filterAppointments();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Failed to load appointments', 'Close', { duration: 3000 });
        }
      });
  }

  private generateTimeSlots(): void {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          appointments: [],
          available: true
        });
      }
    }
    this.timeSlots = slots;
  }

  private generateCalendarDays(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // First day of the week (Sunday)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Generate 42 days (6 weeks)
    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayAppointments = this.appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        appointments: dayAppointments
      });
    }
    
    this.calendarDays = days;
  }

  private generateWeekDays(): void {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.weekDays.push(day);
    }
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  get weekRange(): string {
    this.generateWeekDays();
    const start = this.weekDays[0];
    const end = this.weekDays[6];
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendarDays();
  }

  previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate = day.date;
    this.filterAppointments();
  }

  filterAppointments(): void {
    let filtered = [...this.appointments];
    
    if (this.selectedStatus) {
      filtered = filtered.filter(apt => apt.status === this.selectedStatus);
    }
    
    if (this.selectedDate) {
      filtered = filtered.filter(apt => 
        new Date(apt.date).toDateString() === this.selectedDate!.toDateString()
      );
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    this.filteredAppointments = filtered;
  }

  refreshCalendar(): void {
    this.loadAppointments();
    this.snackBar.open('Calendar refreshed', 'Close', { duration: 2000 });
  }

  openBookingDialog(): void {
    this.snackBar.open('Opening appointment booking...', 'Close', { duration: 2000 });
    // TODO: Open booking dialog
  }

  viewAppointment(appointment: Appointment): void {
    this.snackBar.open(`Viewing appointment ${appointment.id}`, 'Close', { duration: 2000 });
    // TODO: Open appointment details dialog
  }

  editAppointment(appointment: Appointment): void {
    this.snackBar.open(`Editing appointment ${appointment.id}`, 'Close', { duration: 2000 });
    // TODO: Open edit dialog
  }

  confirmAppointment(appointment: Appointment): void {
    this.appointmentsService.updateAppointment(appointment.id, { 
      status: AppointmentStatus.CONFIRMED 
    }).subscribe({
      next: () => {
        this.snackBar.open('Appointment confirmed', 'Close', { duration: 3000 });
        this.loadAppointments();
      },
      error: () => {
        this.snackBar.open('Failed to confirm appointment', 'Close', { duration: 3000 });
      }
    });
  }

  completeAppointment(appointment: Appointment): void {
    this.appointmentsService.updateAppointment(appointment.id, { 
      status: AppointmentStatus.COMPLETED 
    }).subscribe({
      next: () => {
        this.snackBar.open('Appointment marked as completed', 'Close', { duration: 3000 });
        this.loadAppointments();
      },
      error: () => {
        this.snackBar.open('Failed to complete appointment', 'Close', { duration: 3000 });
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    this.appointmentsService.updateAppointment(appointment.id, { 
      status: AppointmentStatus.CANCELLED 
    }).subscribe({
      next: () => {
        this.snackBar.open('Appointment cancelled', 'Close', { duration: 3000 });
        this.loadAppointments();
      },
      error: () => {
        this.snackBar.open('Failed to cancel appointment', 'Close', { duration: 3000 });
      }
    });
  }

  getAppointmentsForTimeSlot(date: Date, time: string): Appointment[] {
    return this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString() && apt.startTime === time;
    });
  }

  getPatientName(appointment: Appointment): string {
    // This would typically come from the appointment object or a separate service
    return `Patient #${appointment.patientId?.slice(-4) || 'Unknown'}`;
  }

  getAppointmentStatusClass(status: AppointmentStatus): string {
    return status.toLowerCase();
  }

  getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.COMPLETED: return 'primary';
      case AppointmentStatus.CONFIRMED: return 'accent';
      case AppointmentStatus.SCHEDULED: return 'warn';
      case AppointmentStatus.CANCELLED: return '';
      default: return '';
    }
  }

  calculateDuration(appointment: Appointment): number {
    const startTime = appointment.startTime.split(':');
    const endTime = appointment.endTime.split(':');
    
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    
    return endMinutes - startMinutes;
  }
}