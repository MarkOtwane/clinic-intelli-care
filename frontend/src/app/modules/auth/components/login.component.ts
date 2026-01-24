import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    
    // Material modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card healthcare-card fade-in">
        <div class="login-header">
          <div class="logo-section">
            <mat-icon class="logo-icon icon-medical">local_hospital</mat-icon>
            <h1 class="app-title">Clinic IntelliCare</h1>
          </div>
          <p class="login-subtitle">Sign in to manage your healthcare journey</p>
        </div>
        
        <div class="login-content">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input 
                  matInput 
                  type="email" 
                  formControlName="email"
                  placeholder="Enter your email address">
                <mat-icon matSuffix class="icon-medical">mail</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email address is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-group">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword ? 'password' : 'text'" 
                  formControlName="password"
                  placeholder="Enter your password">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-options">
              <mat-checkbox formControlName="rememberMe" class="remember-checkbox">
                <span class="text-sm text-muted">Keep me signed in</span>
              </mat-checkbox>
              <a href="#" class="forgot-password text-sm">Forgot password?</a>
            </div>

            <button 
              mat-raised-button 
              class="full-width login-button btn-primary"
              type="submit"
              [disabled]="loginForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading" class="spinner"></mat-spinner>
              <span *ngIf="!isLoading">
                <mat-icon>login</mat-icon>
                Sign In
              </span>
            </button>
          </form>

          <div class="signup-section">
            <p class="signup-text text-sm text-muted">
              Don't have an account? 
              <a routerLink="/auth/signup" class="signup-link">Create one here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
      padding: var(--space-4);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      border: none;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow-xl);
    }

    .login-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .logo-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--medical-blue);
    }

    .app-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--gray-800);
      margin: 0;
      font-family: var(--font-family);
    }

    .login-subtitle {
      color: var(--gray-600);
      font-size: var(--font-size-base);
      margin: 0;
      font-weight: 400;
    }

    .login-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .form-group {
      margin-bottom: var(--space-2);
    }

    .full-width {
      width: 100%;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: var(--space-4) 0;
      gap: var(--space-4);
    }

    .remember-checkbox {
      margin: 0;
    }

    .forgot-password {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .forgot-password:hover {
      color: var(--primary-700);
      text-decoration: underline;
    }

    .login-button {
      height: 52px;
      font-size: var(--font-size-base);
      font-weight: 600;
      margin-top: var(--space-2);
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      color: white;
      box-shadow: var(--shadow-md);
      transition: all 0.2s ease;
    }

    .login-button:hover:not([disabled]) {
      background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-800) 100%);
      box-shadow: var(--shadow-lg);
      transform: translateY(-1px);
    }

    .login-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .signup-section {
      text-align: center;
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }

    .signup-text {
      margin: 0;
      color: var(--gray-600);
    }

    .signup-link {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 600;
      margin-left: var(--space-1);
      transition: color 0.2s ease;
    }

    .signup-link:hover {
      color: var(--primary-700);
      text-decoration: underline;
    }

    .spinner {
      margin-right: var(--space-2);
    }

    /* Custom Material Design overrides */
    ::ng-deep .mat-mdc-form-field {
      margin-bottom: var(--space-4);
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      margin-top: var(--space-2);
    }

    ::ng-deep .mat-mdc-form-field-infix {
      padding: var(--space-4) 0;
    }

    ::ng-deep .mat-mdc-form-field-outline {
      border-radius: var(--radius-md);
    }

    ::ng-deep .mat-mdc-checkbox {
      --mdc-checkbox-selected-icon-color: var(--primary-600);
      --mdc-checkbox-selected-container-color: var(--primary-600);
    }

    /* Responsive design */
    @media (max-width: 640px) {
      .login-card {
        margin: var(--space-4);
        padding: var(--space-6);
      }

      .app-title {
        font-size: var(--font-size-xl);
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.redirectBasedOnRole(user.role);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.redirectBasedOnRole(response.user.role);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Login failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }

  private redirectBasedOnRole(role: UserRole): void {
    switch (role) {
      case UserRole.PATIENT:
        this.router.navigate(['/patient/dashboard']);
        break;
      case UserRole.DOCTOR:
        this.router.navigate(['/doctor/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}