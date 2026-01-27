import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-schedule-followup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <div class="followup-dialog">
      <h2 mat-dialog-title>Schedule Follow-up Appointment</h2>
      <mat-dialog-content>
        <p class="patient-name">
          <mat-icon>person</mat-icon>
          Patient: <strong>{{ patientName }}</strong>
        </p>

        <form [formGroup]="followupForm" class="followup-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Follow-up Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="date"
              [min]="minDate"
            />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="followupForm.get('date')?.hasError('required')">
              Date is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Time</mat-label>
            <input matInput type="time" formControlName="time" />
            <mat-error *ngIf="followupForm.get('time')?.hasError('required')">
              Time is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Appointment Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Follow-up">Follow-up Consultation</mat-option>
              <mat-option value="Review">Test Results Review</mat-option>
              <mat-option value="Check-in">Check-in Visit</mat-option>
              <mat-option value="Physical">Physical Examination</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="followupForm.get('type')?.hasError('required')">
              Type is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea
              matInput
              formControlName="notes"
              rows="3"
              placeholder="Add any special instructions or notes for the patient..."
            ></textarea>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSchedule()"
          [disabled]="!followupForm.valid"
        >
          <mat-icon>check</mat-icon>
          Schedule Follow-up
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .followup-dialog {
        min-width: 400px;
        max-width: 500px;
      }

      .patient-name {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin: var(--space-4) 0;
        padding: var(--space-3);
        background: var(--primary-50);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--primary-600);
        font-size: 14px;
      }

      .patient-name mat-icon {
        color: var(--primary-600);
      }

      .followup-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        margin: var(--space-4) 0;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-actions {
        gap: var(--space-2);
      }
    `,
  ],
})
export class ScheduleFollowupDialogComponent {
  followupForm: FormGroup;
  patientName: string;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ScheduleFollowupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { patientName: string },
  ) {
    this.patientName = data.patientName;
    this.followupForm = this.fb.group({
      date: ['', Validators.required],
      time: ['14:00', Validators.required],
      type: ['Follow-up', Validators.required],
      notes: [''],
    });
  }

  onSchedule(): void {
    if (this.followupForm.valid) {
      this.dialogRef.close(this.followupForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
