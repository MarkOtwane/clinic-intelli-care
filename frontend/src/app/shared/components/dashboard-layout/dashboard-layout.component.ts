import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DashboardNavLink {
  label: string;
  icon: string;
  route: string | any[];
  badge?: string | number;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-shell">
      <aside class="shell-sidebar">
        <div class="brand-block">
          <div class="brand-icon">
            <mat-icon>local_hospital</mat-icon>
          </div>
          <div class="brand-copy">
            <span class="brand-title">Clinic IntelliCare</span>
            <span class="brand-subtitle">Secure care workspace</span>
          </div>
        </div>

        <nav class="nav-list" aria-label="Dashboard navigation">
          <button
            mat-button
            *ngFor="let link of links"
            class="nav-item"
            [routerLink]="link.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: link.exact ?? true }"
          >
            <mat-icon class="nav-icon">{{ link.icon }}</mat-icon>
            <span class="nav-label">{{ link.label }}</span>
            <span class="nav-badge" *ngIf="link.badge">{{ link.badge }}</span>
          </button>
        </nav>
      </aside>

      <section class="shell-content">
        <header class="shell-header">
          <div>
            <p class="eyebrow">Personalized workspace</p>
            <h1 class="shell-title">{{ title }}</h1>
            <p class="shell-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <div class="header-actions">
            <ng-content select="[header-actions]"></ng-content>
          </div>
        </header>

        <div class="shell-body">
          <ng-content></ng-content>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .dashboard-shell {
        display: grid;
        grid-template-columns: 280px 1fr;
        min-height: 100vh;
        background: linear-gradient(120deg, var(--gray-50), #fff);
      }

      .shell-sidebar {
        border-right: 1px solid var(--gray-200);
        padding: var(--space-6) var(--space-4);
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .brand-block {
        display: flex;
        gap: var(--space-3);
        align-items: center;
      }

      .brand-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        background: var(--primary-50);
        color: var(--primary-600);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .brand-title {
        font-weight: 600;
        color: var(--gray-800);
      }

      .brand-subtitle {
        font-size: var(--font-size-xs);
        color: var(--gray-500);
      }

      .nav-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .nav-item {
        justify-content: flex-start;
        gap: var(--space-3);
        border-radius: var(--radius-md);
        width: 100%;
        text-align: left;
        color: var(--gray-600);
        font-weight: 500;
      }

      .nav-item.active {
        background: var(--primary-50);
        color: var(--primary-700);
      }

      .nav-icon {
        font-size: 20px;
      }

      .nav-badge {
        margin-left: auto;
        background: var(--primary-100);
        color: var(--primary-700);
        border-radius: var(--radius-full);
        padding: 2px 10px;
        font-size: var(--font-size-xs);
      }

      .shell-content {
        padding: var(--space-8);
      }

      .shell-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin: 0 0 var(--space-2) 0;
      }

      .shell-title {
        margin: 0;
        font-size: var(--font-size-3xl);
        color: var(--gray-800);
      }

      .shell-subtitle {
        margin: var(--space-2) 0 0 0;
        color: var(--gray-600);
        max-width: 640px;
      }

      .shell-body {
        background: #fff;
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        box-shadow: var(--shadow-lg);
        min-height: calc(100vh - 220px);
      }

      @media (max-width: 1024px) {
        .dashboard-shell {
          grid-template-columns: 1fr;
        }

        .shell-sidebar {
          flex-direction: row;
          overflow-x: auto;
          gap: var(--space-4);
        }

        .nav-list {
          flex-direction: row;
          align-items: center;
        }

        .nav-item {
          min-width: 160px;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() links: DashboardNavLink[] = [];
}

