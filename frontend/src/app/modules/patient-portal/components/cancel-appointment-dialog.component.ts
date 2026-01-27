import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-cancel-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="cancel-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>Cancel Appointment?</h2>
      </div>

      <div class="dialog-content">
        <p class="main-message">
          Are you sure you want to cancel this appointment? The doctor will be
          notified and the slot will be released.
        </p>

        <div class="reason-section">
          <label>Tell us why (optional)</label>
          <mat-form-field class="full-width">
            <mat-label>Reason for cancellation</mat-label>
            <textarea
              matInput
              [(ngModel)]="reason"
              placeholder="e.g., Schedule conflict, Not feeling well, etc."
              rows="3"
            ></textarea>
          </mat-form-field>
          <p class="reason-hint">
            This helps us improve our service and may help your doctor plan
            better care.
          </p>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Keep Appointment
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          Cancel Appointment
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .cancel-dialog {
        padding: 24px;
        min-width: 400px;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      .warning-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #ff9800;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
      }

      .dialog-content {
        margin-bottom: 24px;
      }

      .main-message {
        margin: 0 0 20px 0;
        color: #666;
        line-height: 1.5;
        font-size: 14px;
      }

      .reason-section {
        margin-top: 16px;
      }

      .reason-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }

      .full-width {
        width: 100%;
      }

      .reason-hint {
        margin: 8px 0 0 0;
        font-size: 12px;
        color: #999;
        font-style: italic;
      }

      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      button {
        min-width: 140px;
      }

      @media (max-width: 500px) {
        .cancel-dialog {
          min-width: 100%;
          padding: 16px;
        }

        button {
          min-width: 100px;
        }
      }
    `,
  ],
})
export class CancelAppointmentDialogComponent {
  reason = '';

  constructor(
    private dialogRef: MatDialogRef<CancelAppointmentDialogComponent>,
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    this.dialogRef.close(this.reason || null);
  }
}
