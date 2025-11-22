import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p class="subtitle">Manage your health journey from one place</p>
      
      <div class="dashboard-grid">
        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>calendar_today</mat-icon>
            <mat-card-title>Appointments</mat-card-title>
            <mat-card-subtitle>Manage your appointments</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View and schedule your upcoming appointments with healthcare providers.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/appointments">View Appointments</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>medical_services</mat-icon>
            <mat-card-title>AI Analysis</mat-card-title>
            <mat-card-subtitle>Symptom checker</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Get AI-powered insights about your symptoms and health conditions.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/ai-analysis">Start Analysis</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>medication</mat-icon>
            <mat-card-title>Prescriptions</mat-card-title>
            <mat-card-subtitle>Your medications</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View your prescriptions and track your medication schedule.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/prescriptions">View Prescriptions</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>notifications</mat-icon>
            <mat-card-title>Notifications</mat-card-title>
            <mat-card-subtitle>Stay updated</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View your notifications and important health reminders.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/notifications">View Notifications</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 32px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .dashboard-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }

    mat-card-header mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #3f51b5;
    }

    mat-card-content {
      min-height: 60px;
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
}
