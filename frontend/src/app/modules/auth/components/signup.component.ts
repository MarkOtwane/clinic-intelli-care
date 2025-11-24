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
import { MatStepperModule } from '@angular/material/stepper';

import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-signup',
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
    MatStepperModule,
  ],
  template: `
    <div class="signup-container">
      <div class="signup-card healthcare-card fade-in">
        <div class="signup-header">
          <div class="logo-section">
            <mat-icon class="logo-icon icon-medical">local_hospital</mat-icon>
            <h1 class="app-title">Join Clinic IntelliCare</h1>
          </div>
          <p class="signup-subtitle">Create your healthcare account</p>
        </div>
        
        <div class="signup-content">
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Basic Information -->
            <mat-step label="Basic Information">
              <div class="step-content">
                <h3 class="step-title">Personal Information</h3>
                <p class="step-description">Tell us about yourself</p>
                
                <form [formGroup]="basicInfoForm" class="step-form">
                  <div class="name-fields">
                    <div class="form-group">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>First Name</mat-label>
                        <input matInput formControlName="firstName" placeholder="Enter your first name">
                        <mat-icon matSuffix class="icon-health">person</mat-icon>
                        <mat-error *ngIf="basicInfoForm.get('firstName')?.hasError('required')">
                          First name is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div class="form-group">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Last Name</mat-label>
                        <input matInput formControlName="lastName" placeholder="Enter your last name">
                        <mat-icon matSuffix class="icon-health">person</mat-icon>
                        <mat-error *ngIf="basicInfoForm.get('lastName')?.hasError('required')">
                          Last name is required
                        </mat-error>
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" placeholder="Enter your email address">
                      <mat-icon matSuffix class="icon-medical">mail</mat-icon>
                      <mat-error *ngIf="basicInfoForm.get('email')?.hasError('required')">
                        Email address is required
                      </mat-error>
                      <mat-error *ngIf="basicInfoForm.get('email')?.hasError('email')">
                        Please enter a valid email address
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" placeholder="Enter your phone number">
                      <mat-icon matSuffix class="icon-health">phone</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="button-row">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="basicInfoForm.invalid" class="btn-primary">
                      <mat-icon>arrow_forward</mat-icon>
                      Continue
                    </button>
                  </div>
                </form>
              </div>
            </mat-step>

            <!-- Step 2: Account Security -->
            <mat-step label="Security">
              <div class="step-content">
                <h3 class="step-title">Account Security</h3>
                <p class="step-description">Create a secure password</p>
                
                <form [formGroup]="securityForm" class="step-form">
                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Password</mat-label>
                      <input 
                        matInput 
                        [type]="hidePassword ? 'password' : 'text'" 
                        formControlName="password"
                        placeholder="Create a secure password">
                      <button 
                        mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword">
                        <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="securityForm.get('password')?.hasError('required')">
                        Password is required
                      </mat-error>
                      <mat-error *ngIf="securityForm.get('password')?.hasError('minlength')">
                        Password must be at least 8 characters
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Confirm Password</mat-label>
                      <input 
                        matInput 
                        [type]="hideConfirmPassword ? 'password' : 'text'" 
                        formControlName="confirmPassword"
                        placeholder="Confirm your password">
                      <button 
                        mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hideConfirmPassword = !hideConfirmPassword">
                        <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="securityForm.get('confirmPassword')?.hasError('required')">
                        Please confirm your password
                      </mat-error>
                      <mat-error *ngIf="securityForm.hasError('passwordMismatch')">
                        Passwords do not match
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="button-row">
                    <button mat-button matStepperPrevious class="btn-outline">
                      <mat-icon>arrow_back</mat-icon>
                      Back
                    </button>
                    <button mat-raised-button color="primary" matStepperNext [disabled]="securityForm.invalid" class="btn-primary">
                      <mat-icon>arrow_forward</mat-icon>
                      Continue
                    </button>
                  </div>
                </form>
              </div>
            </mat-step>

            <!-- Step 3: Account Type -->
            <mat-step label="Account Type">
              <div class="step-content">
                <h3 class="step-title">Account Type</h3>
                <p class="step-description">Select your account type</p>
                
                <form [formGroup]="accountTypeForm" class="step-form">
                  <div class="form-group">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>I am a</mat-label>
                      <mat-select formControlName="role">
                        <mat-option value="PATIENT">
                          <div class="option-content">
                            <mat-icon class="option-icon">person</mat-icon>
                            <div class="option-text">
                              <div class="option-title">Patient</div>
                              <div class="option-subtitle">Seeking medical care</div>
                            </div>
                          </div>
                        </mat-option>
                        <mat-option value="DOCTOR">
                          <div class="option-content">
                            <mat-icon class="option-icon">medical_services</mat-icon>
                            <div class="option-text">
                              <div class="option-title">Doctor</div>
                              <div class="option-subtitle">Medical professional</div>
                            </div>
                          </div>
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="accountTypeForm.get('role')?.hasError('required')">
                        Please select an account type
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <mat-checkbox formControlName="agreeToTerms" class="full-width terms-checkbox">
                      <span class="terms-text">
                        I agree to the 
                        <a href="#" target="_blank" class="terms-link">Terms of Service</a> 
                        and 
                        <a href="#" target="_blank" class="terms-link">Privacy Policy</a>
                      </span>
                    </mat-checkbox>

                    <mat-error *ngIf="accountTypeForm.get('agreeToTerms')?.hasError('required') && accountTypeForm.get('agreeToTerms')?.touched" class="checkbox-error">
                      You must agree to the terms and conditions
                    </mat-error>
                  </div>

                  <div class="button-row">
                    <button mat-button matStepperPrevious class="btn-outline">
                      <mat-icon>arrow_back</mat-icon>
                      Back
                    </button>
                    <button 
                      mat-raised-button 
                      (click)="onSubmit()" 
                      [disabled]="accountTypeForm.invalid || isLoading"
                      class="btn-primary create-account-btn">
                      <mat-spinner diameter="20" *ngIf="isLoading" class="spinner"></mat-spinner>
                      <mat-icon *ngIf="!isLoading">person_add</mat-icon>
                      <span *ngIf="!isLoading">Create Account</span>
                    </button>
                  </div>
                </form>
              </div>
            </mat-step>
          </mat-stepper>

          <div class="login-section">
            <p class="login-text text-sm text-muted">
              Already have an account? 
              <a routerLink="/auth/login" class="login-link">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
      padding: var(--space-4);
    }

    .signup-card {
      width: 100%;
      max-width: 560px;
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      border: none;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow-xl);
    }

    .signup-header {
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

    .signup-subtitle {
      color: var(--gray-600);
      font-size: var(--font-size-base);
      margin: 0;
      font-weight: 400;
    }

    .signup-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .step-content {
      padding: var(--space-4) 0;
    }

    .step-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--gray-800);
      margin: 0 0 var(--space-2) 0;
      font-family: var(--font-family);
    }

    .step-description {
      color: var(--gray-600);
      font-size: var(--font-size-sm);
      margin: 0 0 var(--space-6) 0;
    }

    .step-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-group {
      margin-bottom: var(--space-2);
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - var(--space-2));
    }

    .name-fields {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-2);
    }

    .button-row {
      display: flex;
      justify-content: space-between;
      gap: var(--space-4);
      margin-top: var(--space-6);
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2);
    }

    .option-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--primary-600);
    }

    .option-text {
      display: flex;
      flex-direction: column;
    }

    .option-title {
      font-weight: 600;
      color: var(--gray-800);
      font-size: var(--font-size-sm);
    }

    .option-subtitle {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
    }

    .terms-checkbox {
      margin: var(--space-4) 0;
    }

    .terms-text {
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }

    .terms-link {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
    }

    .terms-link:hover {
      color: var(--primary-700);
      text-decoration: underline;
    }

    .checkbox-error {
      margin-top: var(--space-2);
      font-size: var(--font-size-xs);
    }

    .login-section {
      text-align: center;
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }

    .login-text {
      margin: 0;
      color: var(--gray-600);
    }

    .login-link {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 600;
      margin-left: var(--space-1);
      transition: color 0.2s ease;
    }

    .login-link:hover {
      color: var(--primary-700);
      text-decoration: underline;
    }

    .spinner {
      margin-right: var(--space-2);
    }

    /* Custom Material Design overrides for stepper */
    ::ng-deep .mat-mdc-stepper-horizontal {
      background: transparent;
      margin-bottom: var(--space-6);
    }

    ::ng-deep .mat-mdc-step-header {
      padding: var(--space-3) var(--space-4);
    }

    ::ng-deep .mat-mdc-step-header .mat-step-icon {
      background-color: var(--primary-500);
      color: white;
    }

    ::ng-deep .mat-mdc-step-header .mat-step-icon-state-done {
      background-color: var(--success-500);
    }

    ::ng-deep .mat-mdc-step-header .mat-step-label {
      color: var(--gray-600);
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-form-field {
      margin-bottom: var(--space-4);
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
      .signup-card {
        margin: var(--space-4);
        padding: var(--space-6);
      }

      .app-title {
        font-size: var(--font-size-xl);
      }

      .name-fields {
        flex-direction: column;
        gap: var(--space-2);
      }

      .half-width {
        width: 100%;
      }

      .button-row {
        flex-direction: column;
      }
    }
  `]
})
export class SignupComponent implements OnInit {
  basicInfoForm: FormGroup;
  securityForm: FormGroup;
  accountTypeForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.basicInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.securityForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.accountTypeForm = this.fb.group({
      role: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.basicInfoForm.valid && this.securityForm.valid && this.accountTypeForm.valid) {
      this.isLoading = true;
      
      const basicInfo = this.basicInfoForm.value;
      const security = this.securityForm.value;
      const accountType = this.accountTypeForm.value;

      const signupData = {
        email: basicInfo.email,
        password: security.password,
        role: accountType.role,
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        phone: basicInfo.phone
      };

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
          this.redirectBasedOnRole(response.user.role);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Signup failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }

  private redirectBasedOnRole(role: UserRole): void {
    // Redirect to login page after successful registration
    this.router.navigate(['/auth/login']);
  }
}