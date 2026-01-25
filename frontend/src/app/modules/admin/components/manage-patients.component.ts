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
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-manage-patients',
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
    <div class="manage-patients">
      <div class="page-header">
        <h1>
          <mat-icon>person</mat-icon>
          Manage Patients
        </h1>
        <p>View and manage patient records</p>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <table mat-table [dataSource]="patients" class="patients-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-data-cell *matCellDef="let patient">
                {{ patient.name }}
              </td>
            </ng-container>

            <ng-container matColumnDef="age">
              <th mat-header-cell *matHeaderCellDef>Age</th>
              <td mat-data-cell *matCellDef="let patient">{{ patient.age }}</td>
            </ng-container>

            <ng-container matColumnDef="gender">
              <th mat-header-cell *matHeaderCellDef>Gender</th>
              <td mat-data-cell *matCellDef="let patient">
                {{ patient.gender }}
              </td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-data-cell *matCellDef="let patient">
                {{ patient.phone }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-data-cell *matCellDef="let patient">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewPatient(patient)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editPatient(patient)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="viewMedicalHistory(patient)">
                    <mat-icon>history</mat-icon>
                    <span>Medical History</span>
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
      .manage-patients {
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

      .patients-table {
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
export class ManagePatientsComponent implements OnInit {
  patients: any[] = [];
  isLoading = true;
  displayedColumns = ['name', 'age', 'gender', 'phone', 'actions'];

  constructor(
    private patientService: PatientService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (patients: any) => {
        this.patients = patients;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load patients', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  viewPatient(patient: any): void {
    this.snackBar.open(`Viewing patient: ${patient.name}`, 'Close', {
      duration: 2000,
    });
  }

  editPatient(patient: any): void {
    this.snackBar.open(`Edit patient: ${patient.name}`, 'Close', {
      duration: 2000,
    });
  }

  viewMedicalHistory(patient: any): void {
    this.snackBar.open(
      `Viewing medical history for: ${patient.name}`,
      'Close',
      { duration: 2000 },
    );
  }
}
