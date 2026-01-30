import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Preferences</p>
          <h2>Settings</h2>
          <p class="muted">Manage your account preferences and notifications</p>
        </div>
      </header>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Profile Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="profileForm"
            (ngSubmit)="saveProfile()"
            class="profile-form"
          >
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" />
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" />
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date of Birth</mat-label>
                <input matInput type="date" formControlName="dateOfBirth" />
                <mat-icon matPrefix>cake</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Gender</mat-label>
                <input matInput formControlName="gender" />
                <mat-icon matPrefix>wc</mat-icon>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="2"></textarea>
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>
            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!profileForm.valid || isLoading"
              >
                <mat-icon>save</mat-icon>
                Save Profile
              </button>
              <button
                mat-button
                type="button"
                (click)="resetProfile()"
                [disabled]="isLoading"
              >
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Change Password</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="passwordForm"
            (ngSubmit)="changePassword()"
            class="password-form"
          >
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="currentPassword"
              />
              <mat-icon matPrefix>lock</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword" />
              <mat-icon matPrefix>lock_open</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmPassword"
              />
              <mat-icon matPrefix>lock_open</mat-icon>
              <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>
            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!passwordForm.valid || isLoading"
              >
                <mat-icon>security</mat-icon>
                Update Password
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Notification Preferences</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Email Notifications</span>
              <span matListItemLine
                >Receive appointment reminders and updates via email</span
              >
              <mat-slide-toggle
                [checked]="emailNotifications"
                (change)="toggleEmailNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>SMS Notifications</span>
              <span matListItemLine
                >Receive SMS updates for urgent matters</span
              >
              <mat-slide-toggle
                [checked]="smsNotifications"
                (change)="toggleSmsNotifications()"
              ></mat-slide-toggle>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Appointment Reminders</span>
              <span matListItemLine>Get reminded before your appointments</span>
              <mat-slide-toggle
                [checked]="appointmentReminders"
                (change)="toggleAppointmentReminders()"
              ></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Privacy & Security</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>Two-Factor Authentication</span>
              <span matListItemLine
                >Add an extra layer of security to your account</span
              >
              <button mat-button color="primary">Configure</button>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle>Session Timeout</span>
              <span matListItemLine
                >Automatically log out after 30 minutes of inactivity</span
              >
              <mat-slide-toggle checked="true"></mat-slide-toggle>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Data & Privacy</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="button-group">
            <button mat-stroked-button>Download Your Data</button>
            <button mat-stroked-button color="warn">Delete Account</button>
          </div>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .portal-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: var(--space-4);
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

      mat-list-item {
        margin-bottom: var(--space-2);
      }

      .button-group {
        display: flex;
        gap: var(--space-3);
        margin-top: var(--space-2);
      }

      .profile-form,
      .password-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
      }

      .full-width {
        width: 100%;
      }

      .form-actions {
        display: flex;
        gap: var(--space-3);
        margin-top: var(--space-2);
      }

      ::ng-deep .mat-mdc-list-item {
        height: auto !important;
        min-height: 72px;
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PatientSettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  emailNotifications = true;
  smsNotifications = false;
  appointmentReminders = true;
  isLoading = false;
  patientId: string = '';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private patientService: PatientService,
    private authService: AuthService,
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadPatientData();
    this.loadSettings();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: [''],
      gender: [''],
      address: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator(
    group: FormGroup,
  ): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadPatientData(): void {
    this.isLoading = true;
    this.patientService.getMyDashboard().subscribe({
      next: (dashboard) => {
        const patient = dashboard.patient;
        this.patientId = patient.id;
        this.profileForm.patchValue({
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
            : '',
          gender: patient.gender || '',
          address: patient.address || '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load profile data', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  private loadSettings(): void {
    // Load from localStorage for now (can be enhanced with backend persistence)
    const settings = localStorage.getItem('patientSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.emailNotifications = parsed.emailNotifications ?? true;
      this.smsNotifications = parsed.smsNotifications ?? false;
      this.appointmentReminders = parsed.appointmentReminders ?? true;
    }
  }

  private saveSettings(): void {
    const settings = {
      emailNotifications: this.emailNotifications,
      smsNotifications: this.smsNotifications,
      appointmentReminders: this.appointmentReminders,
    };
    localStorage.setItem('patientSettings', JSON.stringify(settings));
  }

  saveProfile(): void {
    if (!this.profileForm.valid) return;

    this.isLoading = true;
    const formValue = this.profileForm.value;
    const updateData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      dateOfBirth: formValue.dateOfBirth
        ? new Date(formValue.dateOfBirth)
        : undefined,
      gender: formValue.gender || undefined,
      address: formValue.address || undefined,
    };

    this.patientService.updatePatient(this.patientId, updateData).subscribe({
      next: () => {
        this.snackBar.open('✓ Profile updated successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(
          '✗ Failed to update profile: ' +
            (error.error?.message || 'Unknown error'),
          'Close',
          { duration: 4000, panelClass: 'error-snackbar' },
        );
        this.isLoading = false;
      },
    });
  }

  resetProfile(): void {
    this.loadPatientData();
  }

  changePassword(): void {
    if (!this.passwordForm.valid) return;

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('✓ Password updated successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.passwordForm.reset();
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(
          '✗ Failed to update password: ' +
            (error.error?.message || 'Unknown error'),
          'Close',
          { duration: 4000, panelClass: 'error-snackbar' },
        );
        this.isLoading = false;
      },
    });
  }

  toggleEmailNotifications(): void {
    this.emailNotifications = !this.emailNotifications;
    this.saveSettings();
    this.snackBar.open(
      'Email notifications ' +
        (this.emailNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 },
    );
  }

  toggleSmsNotifications(): void {
    this.smsNotifications = !this.smsNotifications;
    this.saveSettings();
    this.snackBar.open(
      'SMS notifications ' + (this.smsNotifications ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 },
    );
  }

  toggleAppointmentReminders(): void {
    this.appointmentReminders = !this.appointmentReminders;
    this.saveSettings();
    this.snackBar.open(
      'Appointment reminders ' +
        (this.appointmentReminders ? 'enabled' : 'disabled'),
      'Close',
      { duration: 2000 },
    );
  }
}
