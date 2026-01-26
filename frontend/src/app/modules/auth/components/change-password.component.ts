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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="change-password-container">
      <mat-card class="change-password-card">
        <mat-card-header>
          <mat-card-title>{{
            isFirstLogin ? 'Set Your Password' : 'Change Password'
          }}</mat-card-title>
          <mat-card-subtitle>
            {{
              isFirstLogin
                ? 'Create a permanent password for your account'
                : 'You must change your password before accessing the system'
            }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <!-- Current password only required if not first login -->
            <mat-form-field
              *ngIf="!isFirstLogin"
              appearance="outline"
              class="full-width"
            >
              <mat-label>Current Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="currentPassword"
                placeholder="Enter your current password"
              />
              <mat-error
                *ngIf="
                  passwordForm.get('currentPassword')?.hasError('required')
                "
              >
                Current password is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{
                isFirstLogin ? 'New Password' : 'New Password'
              }}</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="newPassword"
                [placeholder]="
                  isFirstLogin
                    ? 'Create a strong password'
                    : 'Enter your new password'
                "
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                type="button"
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              <mat-error
                *ngIf="passwordForm.get('newPassword')?.hasError('required')"
              >
                Password is required
              </mat-error>
              <mat-error
                *ngIf="passwordForm.get('newPassword')?.hasError('minlength')"
              >
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
              />
              <mat-error
                *ngIf="
                  passwordForm.get('confirmPassword')?.hasError('required')
                "
              >
                Password confirmation is required
              </mat-error>
              <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="passwordForm.invalid || isLoading"
              class="full-width"
            >
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              {{
                isLoading
                  ? isFirstLogin
                    ? 'Setting Password...'
                    : 'Changing Password...'
                  : isFirstLogin
                    ? 'Set Password'
                    : 'Change Password'
              }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .change-password-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .change-password-card {
        width: 100%;
        max-width: 500px;
        padding: 24px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }
    `,
  ],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  isFirstLogin = true; // Assume first login unless we determine otherwise

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // For first login (temporary password), don't require current password
    const currentPasswordValidators = this.isFirstLogin
      ? []
      : [Validators.required];

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', currentPasswordValidators],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMismatchValidator },
    );
  }

  passwordMismatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    // For first login with temporary password, currentPassword is empty
    // The backend should handle this case
    const passwordToSend = this.isFirstLogin ? '' : currentPassword;

    this.authService.changePassword(passwordToSend, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(
          this.isFirstLogin
            ? 'Password set successfully. Redirecting to dashboard...'
            : 'Password changed successfully. Please sign in again.',
          'Close',
          {
            duration: 3000,
          },
        );

        // For first login, redirect to dashboard directly
        // For password change, require re-login
        if (this.isFirstLogin) {
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message ||
            'Failed to update password. Please try again.',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }
}
