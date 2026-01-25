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
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Doctor } from '../../../core/models/doctor.model';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-manage-doctors',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="manage-doctors">
      <div class="page-header">
        <div>
          <h1>
            <mat-icon>local_hospital</mat-icon>
            Manage Doctors
          </h1>
          <p>Administer doctor accounts, credentials, and availability</p>
        </div>
        <button mat-raised-button color="primary" (click)="resetForm()">
          <mat-icon>add</mat-icon>
          Add Doctor
        </button>
      </div>

      <mat-card class="form-card">
        <mat-card-title>{{
          editingId ? 'Edit Doctor' : 'Add Doctor'
        }}</mat-card-title>
        <mat-card-content>
          <form
            class="doctor-form"
            [formGroup]="doctorForm"
            (ngSubmit)="onSubmit()"
          >
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="Dr. Jane Doe"
              />
              <mat-error *ngIf="doctorForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Specialization</mat-label>
              <input
                matInput
                formControlName="specialization"
                placeholder="Cardiology"
              />
              <mat-error
                *ngIf="doctorForm.get('specialization')?.hasError('required')"
              >
                Specialization is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input
                matInput
                formControlName="phone"
                placeholder="+1 555-555-5555"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Experience (years)</mat-label>
              <input
                matInput
                type="number"
                formControlName="experience"
                min="0"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>User ID (link existing user)</mat-label>
              <input
                matInput
                formControlName="userId"
                placeholder="User UUID"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="bio-field">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="3"></textarea>
            </mat-form-field>

            <mat-slide-toggle formControlName="available"
              >Active</mat-slide-toggle
            >

            <div class="form-actions">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="doctorForm.invalid"
              >
                {{ editingId ? 'Update Doctor' : 'Create Doctor' }}
              </button>
              <button mat-button type="button" (click)="resetForm()">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <table mat-table [dataSource]="doctors" class="doctors-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let doctor">{{ doctor.name }}</td>
            </ng-container>

            <ng-container matColumnDef="specialization">
              <th mat-header-cell *matHeaderCellDef>Specialization</th>
              <td mat-cell *matCellDef="let doctor">
                {{ doctor.specialization }}
              </td>
            </ng-container>

            <ng-container matColumnDef="experience">
              <th mat-header-cell *matHeaderCellDef>Experience</th>
              <td mat-cell *matCellDef="let doctor">
                {{ doctor.experience || 0 }} years
              </td>
            </ng-container>

            <ng-container matColumnDef="available">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let doctor">
                <mat-chip
                  [color]="doctor.available ? 'primary' : 'warn'"
                  selected
                >
                  {{ doctor.available ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let doctor">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="startEdit(doctor)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="toggleAvailability(doctor)">
                    <mat-icon>toggle_on</mat-icon>
                    <span>{{
                      doctor.available ? 'Inactivate' : 'Activate'
                    }}</span>
                  </button>
                  <button mat-menu-item (click)="deleteDoctor(doctor)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .manage-doctors {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .page-header h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
      }

      .form-card {
        margin-top: 8px;
      }

      .doctor-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }

      .bio-field {
        grid-column: 1 / -1;
      }

      .form-actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 12px;
        justify-content: flex-start;
      }

      .doctors-table {
        width: 100%;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
    `,
  ],
})
export class ManageDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  isLoading = true;
  editingId: string | null = null;
  displayedColumns = [
    'name',
    'specialization',
    'experience',
    'available',
    'actions',
  ];
  doctorForm!: FormGroup;

  constructor(
    private doctorService: DoctorService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) {}

  private createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      specialization: ['', Validators.required],
      phone: [''],
      experience: [null as number | null],
      userId: [''],
      bio: [''],
      available: [true],
    });
  }

  ngOnInit(): void {
    this.doctorForm = this.createForm();
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load doctors', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) return;

    const payload = {
      name: this.doctorForm.value.name as string,
      specialization: this.doctorForm.value.specialization as string,
      phone: this.doctorForm.value.phone || undefined,
      experience:
        this.doctorForm.value.experience !== null &&
        this.doctorForm.value.experience !== undefined
          ? Number(this.doctorForm.value.experience)
          : undefined,
      userId: this.doctorForm.value.userId || undefined,
      bio: this.doctorForm.value.bio || undefined,
      available: this.doctorForm.value.available ?? true,
    };

    if (this.editingId) {
      this.doctorService.updateDoctor(this.editingId, payload).subscribe({
        next: () => {
          this.snackBar.open('Doctor updated', 'Close', { duration: 2500 });
          this.loadDoctors();
          this.resetForm();
        },
        error: () => {
          this.snackBar.open('Failed to update doctor', 'Close', {
            duration: 3000,
          });
        },
      });
      return;
    }

    this.doctorService.createDoctor(payload).subscribe({
      next: () => {
        this.snackBar.open('Doctor created', 'Close', { duration: 2500 });
        this.loadDoctors();
        this.resetForm();
      },
      error: () => {
        this.snackBar.open('Failed to create doctor', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  startEdit(doctor: Doctor): void {
    this.editingId = doctor.id;
    this.doctorForm.patchValue({
      name: doctor.name,
      specialization: doctor.specialization,
      phone: doctor.phone || '',
      experience: doctor.experience ?? null,
      userId: doctor.userId || '',
      bio: doctor.bio || '',
      available: doctor.available ?? true,
    });
  }

  toggleAvailability(doctor: Doctor): void {
    this.doctorService
      .setDoctorAvailability(doctor.id, !doctor.available)
      .subscribe({
        next: () => {
          this.snackBar.open(
            doctor.available ? 'Doctor inactivated' : 'Doctor activated',
            'Close',
            { duration: 2500 },
          );
          this.loadDoctors();
        },
        error: () => {
          this.snackBar.open('Failed to update status', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  deleteDoctor(doctor: Doctor): void {
    if (!confirm(`Delete ${doctor.name}? This cannot be undone.`)) return;

    this.doctorService.deleteDoctor(doctor.id).subscribe({
      next: () => {
        this.snackBar.open('Doctor deleted', 'Close', { duration: 2500 });
        this.loadDoctors();
        if (this.editingId === doctor.id) this.resetForm();
      },
      error: () => {
        this.snackBar.open('Failed to delete doctor', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.doctorForm.reset({ available: true });
  }
}
