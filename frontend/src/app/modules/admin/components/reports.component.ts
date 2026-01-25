import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="reports">
      <div class="page-header">
        <h1>
          <mat-icon>description</mat-icon>
          Reports
        </h1>
        <p>Generate and view system reports</p>
      </div>

      <mat-card>
        <mat-card-content>
          <p>Reports section coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .reports {
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
    `,
  ],
})
export class ReportsComponent {}
