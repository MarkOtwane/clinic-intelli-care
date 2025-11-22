import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';

import { PrescriptionService } from '../../../core/services/prescription.service';
import { CreatePrescriptionRequest, Medication } from '../../../core/models/prescription.model';

@Component({
  selector: 'app-prescription-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="prescription-container">
      <mat-card class="prescription-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>medication</mat-icon>
            Create Prescription
          </mat-card-title>
          <mat-card-subtitle>Fill in the prescription details</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="prescriptionForm" (ngSubmit)="submitPrescription()">
            <!-- Patient & Diagnosis Section -->
            <div class="section">
              <h3>Patient & Diagnosis</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Patient ID</mat-label>
                  <input matInput formControlName="patientId" required>
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error *ngIf="prescriptionForm.get('patientId')?.hasError('required')">
                    Patient ID is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Appointment ID (Optional)</mat-label>
                  <input matInput formControlName="appointmentId">
                  <mat-icon matSuffix>event</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Diagnosis</mat-label>
                  <textarea matInput formControlName="diagnosis" rows="3" required></textarea>
                  <mat-error *ngIf="prescriptionForm.get('diagnosis')?.hasError('required')">
                    Diagnosis is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Valid Until</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="validUntil">
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Medications Section -->
            <div class="section">
              <div class="section-header">
                <h3>Medications</h3>
                <button mat-raised-button color="primary" type="button" (click)="addMedication()">
                  <mat-icon>add</mat-icon>
                  Add Medication
                </button>
              </div>

              <div formArrayName="medications">
                <div *ngFor="let medication of medications.controls; let i = index" 
                     [formGroupName]="i" 
                     class="medication-card">
                  <div class="medication-header">
                    <h4>Medication {{ i + 1 }}</h4>
                    <button mat-icon-button color="warn" type="button" (click)="removeMedication(i)" 
                            *ngIf="medications.length > 1">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Medication Name</mat-label>
                      <input matInput formControlName="name" required>
                      <mat-error>Medication name is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Dosage</mat-label>
                      <input matInput formControlName="dosage" placeholder="e.g., 500mg" required>
                      <mat-error>Dosage is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Frequency</mat-label>
                      <mat-select formControlName="frequency" required>
                        <mat-option value="Once daily">Once daily</mat-option>
                        <mat-option value="Twice daily">Twice daily</mat-option>
                        <mat-option value="Three times daily">Three times daily</mat-option>
                        <mat-option value="Four times daily">Four times daily</mat-option>
                        <mat-option value="Every 4 hours">Every 4 hours</mat-option>
                        <mat-option value="Every 6 hours">Every 6 hours</mat-option>
                        <mat-option value="Every 8 hours">Every 8 hours</mat-option>
                        <mat-option value="As needed">As needed</mat-option>
                        <mat-option value="Before meals">Before meals</mat-option>
                        <mat-option value="After meals">After meals</mat-option>
                      </mat-select>
                      <mat-error>Frequency is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Duration</mat-label>
                      <input matInput formControlName="duration" placeholder="e.g., 7 days" required>
                      <mat-error>Duration is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Special Instructions</mat-label>
                      <textarea matInput formControlName="instructions" rows="2"></textarea>
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- General Instructions Section -->
            <div class="section">
              <h3>General Instructions</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Instructions for Patient</mat-label>
                <textarea matInput formControlName="instructions" rows="4" required></textarea>
                <mat-error *ngIf="prescriptionForm.get('instructions')?.hasError('required')">
                  Instructions are required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">
                <mat-icon>refresh</mat-icon>
                Reset
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting || prescriptionForm.invalid">
                <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                <span *ngIf="!isSubmitting">
                  <mat-icon>save</mat-icon>
                  Create Prescription
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .prescription-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .prescription-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
    }

    .section {
      margin: 24px 0;
    }

    .section h3 {
      color: #2c3e50;
      margin-bottom: 16px;
      font-size: 18px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .medication-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      border-left: 4px solid #667eea;
    }

    .medication-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .medication-header h4 {
      margin: 0;
      color: #2c3e50;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    mat-divider {
      margin: 24px 0;
    }

    @media (max-width: 768px) {
      .prescription-container {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
    }
  `]
})
export class PrescriptionCreateComponent implements OnInit, OnDestroy {
  @Input() patientId?: string;
  @Input() appointmentId?: string;
  @Output() prescriptionCreated = new EventEmitter<any>();

  prescriptionForm!: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.prescriptionForm = this.fb.group({
      patientId: [this.patientId || '', Validators.required],
      appointmentId: [this.appointmentId || ''],
      diagnosis: ['', Validators.required],
      validUntil: [''],
      instructions: ['', Validators.required],
      medications: this.fb.array([this.createMedicationGroup()])
    });
  }

  private createMedicationGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required],
      instructions: ['']
    });
  }

  get medications(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  addMedication(): void {
    this.medications.push(this.createMedicationGroup());
  }

  removeMedication(index: number): void {
    if (this.medications.length > 1) {
      this.medications.removeAt(index);
    }
  }

  submitPrescription(): void {
    if (this.prescriptionForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    const prescriptionData: CreatePrescriptionRequest = {
      patientId: this.prescriptionForm.value.patientId,
      appointmentId: this.prescriptionForm.value.appointmentId || undefined,
      diagnosis: this.prescriptionForm.value.diagnosis,
      validUntil: this.prescriptionForm.value.validUntil || undefined,
      instructions: this.prescriptionForm.value.instructions,
      medications: this.prescriptionForm.value.medications
    };

    this.prescriptionService.createPrescription(prescriptionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prescription) => {
          this.snackBar.open('Prescription created successfully!', 'Close', { duration: 3000 });
          this.prescriptionCreated.emit(prescription);
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating prescription:', error);
          this.snackBar.open('Failed to create prescription. Please try again.', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
  }

  resetForm(): void {
    this.prescriptionForm.reset();
    this.medications.clear();
    this.medications.push(this.createMedicationGroup());
    if (this.patientId) {
      this.prescriptionForm.patchValue({ patientId: this.patientId });
    }
    if (this.appointmentId) {
      this.prescriptionForm.patchValue({ appointmentId: this.appointmentId });
    }
  }
}
