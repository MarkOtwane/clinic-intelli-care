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
      <mat-card class="signup-card">
        <mat-card-header>
          <mat-card-title>Join Clinic IntelliCare</mat-card-title>
          <mat-card-subtitle>Create your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Basic Information -->
            <mat-step label="Basic Information">
              <form [formGroup]="basicInfoForm">
                <h3>Basic Information</h3>
                
                <div class="name-fields">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name</mat-label>
                    <input matInput formControlName="firstName" placeholder="Enter your first name">
                    <mat-error *ngIf="basicInfoForm.get('firstName')?.hasError('required')">
                      First name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name</mat-label>
                    <input matInput formControlName="lastName" placeholder="Enter your last name">
                    <mat-error *ngIf="basicInfoForm.get('lastName')?.hasError('required')">
                      Last name is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="Enter your email">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="basicInfoForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="basicInfoForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" placeholder="Enter your phone number">
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>

                <div class="button-row">
                  <button mat-raised-button color="primary" matStepperNext [disabled]="basicInfoForm.invalid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Account Security -->
            <mat-step label="Security">
              <form [formGroup]="securityForm">
                <h3>Account Security</h3>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input 
                    matInput 
                    [type]="hidePassword ? 'password' : 'text'" 
                    formControlName="password"
                    placeholder="Create a password">
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

                <div class="button-row">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext [disabled]="securityForm.invalid">
                    Next
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Account Type -->
            <mat-step label="Account Type">
              <form [formGroup]="accountTypeForm">
                <h3>Account Type</h3>
                <p class="step-description">Select the type of account you want to create</p>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>I am a</mat-label>
                  <mat-select formControlName="role">
                    <mat-option value="PATIENT">Patient - Seeking medical care</mat-option>
                    <mat-option value="DOCTOR">Doctor - Medical professional</mat-option>
                  </mat-select>
                  <mat-error *ngIf="accountTypeForm.get('role')?.hasError('required')">
                    Please select an account type
                  </mat-error>
                </mat-form-field>

                <mat-checkbox formControlName="agreeToTerms" class="full-width">
                  I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
                </mat-checkbox>

                <mat-error *ngIf="accountTypeForm.get('agreeToTerms')?.hasError('required') && accountTypeForm.get('agreeToTerms')?.touched">
                  You must agree to the terms and conditions
                </mat-error>

                <div class="button-row">
                  <button mat-button matStepperPrevious>Back</button>
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="onSubmit()" 
                    [disabled]="accountTypeForm.invalid || isLoading">
                    <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                    <span *ngIf="!isLoading">Create Account</span>
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>

          <div class="login-link">
            <span>Already have an account?</span>
            <a routerLink="/auth/login">Sign in here</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .signup-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .half-width {
      width: calc(50% - 8px);
      margin-bottom: 16px;
    }

    .name-fields {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .button-row {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .step-description {
      color: #666;
      margin-bottom: 24px;
    }

    .login-link {
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .login-link span {
      color: #666;
      margin-right: 8px;
    }

    .login-link a {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    mat-spinner {
      margin-right: 8px;
    }

    h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    a {
      color: #3f51b5;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
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
    switch (role) {
      case UserRole.PATIENT:
        this.router.navigate(['/patient/dashboard']);
        break;
      case UserRole.DOCTOR:
        this.router.navigate(['/doctor/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}