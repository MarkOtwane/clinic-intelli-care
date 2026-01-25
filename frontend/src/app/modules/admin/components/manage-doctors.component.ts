import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-manage-doctors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="manage-doctors">
      <div class="page-header">
        <h1>
          <mat-icon>local_hospital</mat-icon>
          Manage Doctors
        </h1>
        <p>View and manage registered doctors</p>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <table mat-table [dataSource]="doctors" class="doctors-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-data-cell *matCellDef="let doctor">{{ doctor.name }}</td>
            </ng-container>

            <ng-container matColumnDef="specialization">
              <th mat-header-cell *matHeaderCellDef>Specialization</th>
              <td mat-data-cell *matCellDef="let doctor">
                {{ doctor.specialization }}
              </td>
            </ng-container>

            <ng-container matColumnDef="experience">
              <th mat-header-cell *matHeaderCellDef>Experience</th>
              <td mat-data-cell *matCellDef="let doctor">
                {{ doctor.experience }} years
              </td>
            </ng-container>

            <ng-container matColumnDef="available">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-data-cell *matCellDef="let doctor">
                <mat-chip [color]="doctor.available ? 'primary' : 'warn'">
                  {{ doctor.available ? 'Available' : 'Unavailable' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-data-cell *matCellDef="let doctor">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewDoctor(doctor)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editDoctor(doctor)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="toggleAvailability(doctor)">
                    <mat-icon>toggle_on</mat-icon>
                    <span>Toggle Availability</span>
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
      }

      .page-header {
        margin-bottom: 24px;
      }

      .page-header h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px 0;
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
  doctors: any[] = [];
  isLoading = true;
  displayedColumns = [
    'name',
    'specialization',
    'experience',
    'available',
    'actions',
  ];

  constructor(
    private doctorService: DoctorService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: any) => {
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

  viewDoctor(doctor: any): void {
    this.snackBar.open(`Viewing doctor: ${doctor.name}`, 'Close', {
      duration: 2000,
    });
  }

  editDoctor(doctor: any): void {
    this.snackBar.open(`Edit doctor: ${doctor.name}`, 'Close', {
      duration: 2000,
    });
  }

  toggleAvailability(doctor: any): void {
    this.snackBar.open(`Toggling availability for: ${doctor.name}`, 'Close', {
      duration: 2000,
    });
  }
}
