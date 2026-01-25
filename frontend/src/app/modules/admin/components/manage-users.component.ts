import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-manage-users',
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
    MatDialogModule,
  ],
  template: `
    <div class="manage-users">
      <div class="page-header">
        <h1>
          <mat-icon>people</mat-icon>
          Manage Users
        </h1>
        <p>View and manage all system users</p>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <table mat-table [dataSource]="users" class="users-table">
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-data-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-data-cell *matCellDef="let user">
                <mat-chip [color]="getRoleColor(user.role)">
                  {{ user.role }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Registered</th>
              <td mat-data-cell *matCellDef="let user">
                {{ user.createdAt | date: 'short' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-data-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewUser(user)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="editUser(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="deleteUser(user)">
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
      .manage-users {
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

      .users-table {
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
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  isLoading = true;
  displayedColumns = ['email', 'role', 'createdAt', 'actions'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users: any) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'warn';
      case 'DOCTOR':
        return 'accent';
      case 'PATIENT':
        return 'primary';
      default:
        return '';
    }
  }

  viewUser(user: any): void {
    this.snackBar.open(`Viewing user: ${user.email}`, 'Close', {
      duration: 2000,
    });
  }

  editUser(user: any): void {
    this.snackBar.open(`Edit user: ${user.email}`, 'Close', { duration: 2000 });
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete ${user.email}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
          });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
}
