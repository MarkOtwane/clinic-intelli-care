import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AppointmentsService } from '../../../core/services/appointments.service';

interface AvailabilitySlot {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-availability-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="availability-dialog">
      <h2 mat-dialog-title>Manage Your Availability</h2>

      <mat-dialog-content>
        <p class="dialog-description">
          Set your weekly availability schedule. Patients can only book appointments during your available times.
        </p>

        <div class="availability-form">
          <div class="day-slots" *ngFor="let slot of availabilitySlots">
            <div class="day-header">
              <mat-checkbox
                [checked]="slot.isAvailable"
                (change)="toggleDayAvailability(slot, $event.checked)"
                color="primary">
                <strong>{{ slot.dayName }}</strong>
              </mat-checkbox>
            </div>

            <div class="time-inputs" *ngIf="slot.isAvailable">
              <mat-form-field appearance="outline" class="time-field">
                <mat-label>Start Time</mat-label>
                <input matInput type="time" [(ngModel)]="slot.startTime" [disabled]="isSaving">
              </mat-form-field>

              <mat-form-field appearance="outline" class="time-field">
                <mat-label>End Time</mat-label>
                <input matInput type="time" [(ngModel)]="slot.endTime" [disabled]="isSaving">
              </mat-form-field>

              <button mat-icon-button color="primary"
                      (click)="saveDayAvailability(slot)"
                      [disabled]="isSaving || !slot.isAvailable">
                <mat-icon>save</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary"
                (click)="saveAllAvailability()"
                [disabled]="isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">Save All Changes</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .availability-dialog {
      min-width: 500px;
    }

    .dialog-description {
      margin-bottom: 24px;
      color: #666;
    }

    .availability-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .day-slots {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }

    .day-header {
      margin-bottom: 12px;
    }

    .time-inputs {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .time-field {
      width: 120px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class AvailabilityDialogComponent implements OnInit {
  availabilitySlots: AvailabilitySlot[] = [];
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AvailabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { doctorId: string }
  ) {}

  ngOnInit(): void {
    this.initializeAvailabilitySlots();
    this.loadCurrentAvailability();
  }

  private initializeAvailabilitySlots(): void {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.availabilitySlots = days.map((day, index) => ({
      dayOfWeek: index,
      dayName: day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false
    }));
  }

  private loadCurrentAvailability(): void {
    this.appointmentsService.getDoctorAvailability().subscribe({
      next: (availabilities) => {
        availabilities.forEach(avail => {
          const slot = this.availabilitySlots.find(s => s.dayOfWeek === avail.dayOfWeek);
          if (slot) {
            slot.isAvailable = avail.isAvailable;
            slot.startTime = avail.startTime;
            slot.endTime = avail.endTime;
          }
        });
      },
      error: () => {
        this.snackBar.open('Failed to load current availability', 'Close', { duration: 3000 });
      }
    });
  }

  toggleDayAvailability(slot: AvailabilitySlot, isAvailable: boolean): void {
    slot.isAvailable = isAvailable;
  }

  saveDayAvailability(slot: AvailabilitySlot): void {
    this.appointmentsService.setDoctorAvailability({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable
    }).subscribe({
      next: () => {
        this.snackBar.open(`${slot.dayName} availability updated`, 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open(`Failed to update ${slot.dayName} availability`, 'Close', { duration: 3000 });
      }
    });
  }

  saveAllAvailability(): void {
    this.isSaving = true;

    const savePromises = this.availabilitySlots.map(slot =>
      this.appointmentsService.setDoctorAvailability({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      }).toPromise()
    );

    Promise.all(savePromises).then(() => {
      this.isSaving = false;
      this.snackBar.open('All availability settings saved successfully', 'Close', { duration: 3000 });
      this.dialogRef.close(true);
    }).catch(() => {
      this.isSaving = false;
      this.snackBar.open('Failed to save some availability settings', 'Close', { duration: 3000 });
    });
  }
}