import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PatientService } from '../../../core/services/patient.service';
import { CreatePatientDto } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-registration',
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
    MatChipsModule,
    MatSnackBarModule,
    MatStepperModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="registration-container">
      <mat-card class="registration-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_add</mat-icon>
            Patient Registration
          </mat-card-title>
          <mat-card-subtitle>Register a new patient in the system</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Personal Information -->
            <mat-step>
              <form [formGroup]="personalInfoForm">
                <ng-template matStepLabel>Personal Information</ng-template>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" required>
                    <mat-icon matSuffix>person</mat-icon>
                    <mat-error *ngIf="personalInfoForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" required>
                    <mat-icon matSuffix>person</mat-icon>
                    <mat-error *ngIf="personalInfoForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email">
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-error *ngIf="personalInfoForm.get('email')?.hasError('email')">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Phone</mat-label>
                    <input matInput type="tel" formControlName="phone">
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="dateOfBirth">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="Male">Male</mat-option>
                      <mat-option value="Female">Female</mat-option>
                      <mat-option value="Other">Other</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-raised-button matStepperNext color="primary">
                    Next
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Address Information -->
            <mat-step>
              <form [formGroup]="addressForm">
                <ng-template matStepLabel>Address Information</ng-template>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Street Address</mat-label>
                    <input matInput formControlName="address">
                    <mat-icon matSuffix>home</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>State</mat-label>
                    <input matInput formControlName="state">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Zip Code</mat-label>
                    <input matInput formControlName="zipCode">
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button matStepperNext color="primary">
                    Next
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Medical Information -->
            <mat-step>
              <form [formGroup]="medicalInfoForm">
                <ng-template matStepLabel>Medical Information</ng-template>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Blood Group</mat-label>
                    <mat-select formControlName="bloodGroup">
                      <mat-option value="A+">A+</mat-option>
                      <mat-option value="A-">A-</mat-option>
                      <mat-option value="B+">B+</mat-option>
                      <mat-option value="B-">B-</mat-option>
                      <mat-option value="AB+">AB+</mat-option>
                      <mat-option value="AB-">AB-</mat-option>
                      <mat-option value="O+">O+</mat-option>
                      <mat-option value="O-">O-</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Allergies (comma separated)</mat-label>
                    <input matInput formControlName="allergiesInput" placeholder="e.g., Penicillin, Peanuts">
                    <mat-icon matSuffix>warning</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Medical Conditions (comma separated)</mat-label>
                    <input matInput formControlName="conditionsInput" placeholder="e.g., Diabetes, Hypertension">
                    <mat-icon matSuffix>medical_services</mat-icon>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button matStepperNext color="primary">
                    Next
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 4: Emergency Contact & Insurance -->
            <mat-step>
              <form [formGroup]="emergencyForm">
                <ng-template matStepLabel>Emergency & Insurance</ng-template>
                
                <h3>Emergency Contact</h3>
                <div class="form-grid" formGroupName="emergencyContact">
                  <mat-form-field appearance="outline">
                    <mat-label>Contact Name</mat-label>
                    <input matInput formControlName="name">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Relationship</mat-label>
                    <input matInput formControlName="relationship">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Contact Phone</mat-label>
                    <input matInput type="tel" formControlName="phone">
                  </mat-form-field>
                </div>

                <h3>Insurance Information</h3>
                <div class="form-grid" formGroupName="insuranceInfo">
                  <mat-form-field appearance="outline">
                    <mat-label>Insurance Provider</mat-label>
                    <input matInput formControlName="provider">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Policy Number</mat-label>
                    <input matInput formControlName="policyNumber">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Group Number</mat-label>
                    <input matInput formControlName="groupNumber">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Expiry Date</mat-label>
                    <input matInput [matDatepicker]="insurancePicker" formControlName="expiryDate">
                    <mat-datepicker-toggle matSuffix [for]="insurancePicker"></mat-datepicker-toggle>
                    <mat-datepicker #insurancePicker></mat-datepicker>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button color="primary" (click)="submitRegistration()" [disabled]="isSubmitting">
                    <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
                    <span *ngIf="!isSubmitting">
                      <mat-icon>check</mat-icon>
                      Register Patient
                    </span>
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .registration-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .registration-card {
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      gap: 12px;
    }

    h3 {
      color: #2c3e50;
      margin: 24px 0 16px 0;
      font-size: 18px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .registration-container {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PatientRegistrationComponent implements OnInit {
  @Output() registrationComplete = new EventEmitter<any>();

  personalInfoForm!: FormGroup;
  addressForm!: FormGroup;
  medicalInfoForm!: FormGroup;
  emergencyForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.personalInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      dateOfBirth: [''],
      gender: ['']
    });

    this.addressForm = this.fb.group({
      address: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });

    this.medicalInfoForm = this.fb.group({
      bloodGroup: [''],
      allergiesInput: [''],
      conditionsInput: ['']
    });

    this.emergencyForm = this.fb.group({
      emergencyContact: this.fb.group({
        name: [''],
        relationship: [''],
        phone: ['']
      }),
      insuranceInfo: this.fb.group({
        provider: [''],
        policyNumber: [''],
        groupNumber: [''],
        expiryDate: ['']
      })
    });
  }

  submitRegistration(): void {
    if (this.personalInfoForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    const patientData: CreatePatientDto = {
      ...this.personalInfoForm.value,
      ...this.addressForm.value,
      bloodGroup: this.medicalInfoForm.value.bloodGroup,
      allergies: this.parseCommaSeparated(this.medicalInfoForm.value.allergiesInput),
      conditions: this.parseCommaSeparated(this.medicalInfoForm.value.conditionsInput),
      emergencyContact: this.emergencyForm.value.emergencyContact.name ? 
        this.emergencyForm.value.emergencyContact : undefined,
      insuranceInfo: this.emergencyForm.value.insuranceInfo.provider ? 
        this.emergencyForm.value.insuranceInfo : undefined
    };

    this.patientService.createPatient(patientData).subscribe({
      next: (patient) => {
        this.snackBar.open('Patient registered successfully!', 'Close', { duration: 3000 });
        this.registrationComplete.emit(patient);
        this.resetForms();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.snackBar.open('Failed to register patient. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  private parseCommaSeparated(input: string): string[] {
    if (!input) return [];
    return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  private resetForms(): void {
    this.personalInfoForm.reset();
    this.addressForm.reset();
    this.medicalInfoForm.reset();
    this.emergencyForm.reset();
  }
}
