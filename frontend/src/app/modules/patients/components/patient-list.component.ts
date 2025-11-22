import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  gender?: string;
  age?: number;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  lastVisit?: Date;
  totalAppointments: number;
  status: 'active' | 'inactive' | 'critical';
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    // Material modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="patient-list">
      <!-- Header Section -->
      <div class="list-header">
        <div class="header-info">
          <h1>
            <mat-icon>people</mat-icon>
            Patient Management
          </h1>
          <p class="subtitle">Manage patient records and medical history</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openRegistrationDialog()">
            <mat-icon>person_add</mat-icon>
            New Patient
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search patients</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Name or ID">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Filter by status</mat-label>
              <mat-select [(value)]="statusFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
                <mat-option value="critical">Critical</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card total-patients">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalPatients }}</h3>
                <p>Total Patients</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card active-patients">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ activePatients }}</h3>
                <p>Active Patients</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Patient Table -->
      <mat-card class="patients-card">
        <mat-card-header>
          <mat-card-title>Patient Records</mat-card-title>
          <mat-card-subtitle>{{ filteredPatients.length }} patients found</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="!isLoading; else loadingTemplate">
            <table mat-table [dataSource]="filteredPatients" class="patients-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let patient">#{{ patient.id.slice(-8) }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let patient">
                  <div class="patient-name">
                    {{ patient.firstName }} {{ patient.lastName }}
                  </div>
                </td>
              </ng-container>

              <!-- Contact Column -->
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let patient">
                  <div>{{ patient.phone || 'N/A' }}</div>
                  <div class="email">{{ patient.email || 'N/A' }}</div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let patient">
                  <mat-chip [color]="getStatusColor(patient.status)" selected>
                    {{ patient.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let patient">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewPatient(patient)">
                      <mat-icon>visibility</mat-icon>
                      <span>View</span>
                    </button>
                    <button mat-menu-item (click)="editPatient(patient)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div class="empty-state" *ngIf="filteredPatients.length === 0">
              <mat-icon>people_outline</mat-icon>
              <h3>No patients found</h3>
              <p>Start by adding a new patient record</p>
            </div>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading">
              <mat-spinner></mat-spinner>
              <p>Loading patients...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .patient-list {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-info h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .subtitle {
      color: #7f8c8d;
      margin: 0;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      flex: 1;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      padding: 12px;
      border-radius: 50%;
      background: #f8f9fa;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #7f8c8d;
      font-size: 14px;
    }

    .patients-table {
      width: 100%;
    }

    .patient-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .email {
      font-size: 12px;
      color: #7f8c8d;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #7f8c8d;
    }

    .empty-state mat-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .loading {
      text-align: center;
      padding: 48px;
    }

    .total-patients { border-left: 4px solid #3498db; }
    .active-patients { border-left: 4px solid #27ae60; }

    @media (max-width: 768px) {
      .patient-list {
        padding: 16px;
      }
      
      .list-header {
        flex-direction: column;
        text-align: center;
      }
      
      .filters-row {
        flex-direction: column;
      }
    }
  `]
})
export class PatientListComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  patients: PatientRecord[] = [];
  filteredPatients: PatientRecord[] = [];
  isLoading = false;
  
  searchTerm = '';
  statusFilter = '';
  displayedColumns: string[] = ['id', 'name', 'contact', 'status', 'actions'];
  
  totalPatients = 0;
  activePatients = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadMockPatients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadMockPatients(): void {
    this.isLoading = true;
    
    // Mock data for demonstration
    setTimeout(() => {
      this.patients = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john.doe@email.com',
          gender: 'Male',
          age: 35,
          bloodGroup: 'O+',
          allergies: ['Penicillin'],
          conditions: ['Hypertension'],
          totalAppointments: 5,
          status: 'active'
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567891',
          email: 'jane.smith@email.com',
          gender: 'Female',
          age: 28,
          bloodGroup: 'A+',
          totalAppointments: 2,
          status: 'active'
        },
        {
          id: '3',
          firstName: 'Robert',
          lastName: 'Johnson',
          phone: '+1234567892',
          email: 'robert.j@email.com',
          gender: 'Male',
          age: 45,
          bloodGroup: 'B+',
          conditions: ['Diabetes', 'Heart Disease'],
          totalAppointments: 12,
          status: 'critical'
        }
      ];
      
      this.calculateStats();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  private calculateStats(): void {
    this.totalPatients = this.patients.length;
    this.activePatients = this.patients.filter(p => p.status === 'active').length;
  }

  applyFilters(): void {
    let filtered = [...this.patients];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.firstName.toLowerCase().includes(term) ||
        patient.lastName.toLowerCase().includes(term) ||
        patient.id.toLowerCase().includes(term)
      );
    }
    
    if (this.statusFilter) {
      filtered = filtered.filter(patient => patient.status === this.statusFilter);
    }
    
    this.filteredPatients = filtered;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'critical': return 'warn';
      case 'inactive': return '';
      default: return '';
    }
  }

  openRegistrationDialog(): void {
    this.snackBar.open('Opening patient registration...', 'Close', { duration: 2000 });
  }

  viewPatient(patient: PatientRecord): void {
    this.snackBar.open(`Viewing ${patient.firstName} ${patient.lastName}`, 'Close', { duration: 2000 });
  }

  editPatient(patient: PatientRecord): void {
    this.snackBar.open(`Editing ${patient.firstName} ${patient.lastName}`, 'Close', { duration: 2000 });
  }
}