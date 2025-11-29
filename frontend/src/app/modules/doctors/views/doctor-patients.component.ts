import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

interface PatientRow {
  name: string;
  status: string;
  lastVisit: string;
}

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Panel</p>
          <h2>Active patients</h2>
          <p class="muted">Quickly reference charts and follow-up needs.</p>
        </div>
        <button mat-stroked-button color="primary" routerLink="/doctor/patients">
          <mat-icon>people</mat-icon>
          Full directory
        </button>
      </header>

      <table mat-table [dataSource]="patients" class="patients-table">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Patient </th>
          <td mat-cell *matCellDef="let row">
            <strong>{{ row.name }}</strong>
            <div class="muted">Last visit {{ row.lastVisit }}</div>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let row">
            <span class="status-chip">{{ row.status }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button
              mat-button
              color="primary"
              [routerLink]="['/patients', toRouteSegment(row.name)]"
            >
              Open chart
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </section>
  `,
  styles: [
    `
      .portal-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: var(--space-4);
        align-items: center;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin: 0 0 var(--space-2);
      }

      .muted {
        color: var(--gray-600);
        margin: 0;
      }

      .patients-table {
        width: 100%;
        background: #fff;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-md);
      }

      .status-chip {
        padding: 4px 12px;
        background: var(--success-50);
        color: var(--success-700);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
      }

      @media (max-width: 768px) {
        .section-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .patients-table {
          overflow-x: auto;
          display: block;
        }
      }
    `,
  ],
})
export class DoctorPatientsComponent {
  displayedColumns = ['name', 'status', 'actions'];
  patients: PatientRow[] = [
    { name: 'Ava Carter', status: 'Post-op', lastVisit: '2 days ago' },
    { name: 'Liam Ortiz', status: 'Chronic care', lastVisit: '1 week ago' },
    { name: 'Ethan Kim', status: 'Follow-up due', lastVisit: '3 weeks ago' },
  ];

  toRouteSegment(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }
}

