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
            <div class="brand-title">Clinic IntelliCare</div>
            <div class="brand-subtitle">Healthcare Management</div>
          </div>
        </div>

        <nav class="nav-list" aria-label="Dashboard navigation" role="navigation">
          <button
            mat-button
            *ngFor="let link of links; let i = index"
            class="nav-item"
            [routerLink]="link.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
            [attr.aria-label]="link.label"
          >
            <mat-icon class="nav-icon">{{ link.icon }}</mat-icon>
            <span class="nav-label">{{ link.label }}</span>
            <span class="nav-badge" *ngIf="link.badge">{{ link.badge }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="help-card">
            <mat-icon class="help-icon">help_outline</mat-icon>
            <div class="help-text">
              <div class="help-title">Need Help?</div>
              <div class="help-subtitle">Contact support</div>
            </div>
          </div>
        </div>
      </aside>

      <section class="shell-content">
        <header class="shell-header">
          <div class="header-text">
            <div class="breadcrumb">
              <mat-icon class="breadcrumb-icon">home</mat-icon>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-current">{{ title }}</span>
            </div>
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
        background: var(--gray-50);
      }

      .shell-sidebar {
        border-right: 1px solid var(--gray-200);
        padding: var(--space-6);
        background: white;
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
      }

      .brand-block {
        display: flex;
        gap: var(--space-3);
        align-items: center;
        padding-bottom: var(--space-4);
        border-bottom: 1px solid var(--gray-200);
      }

      .brand-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgb(74 122 255 / 0.3);
      }

      .brand-icon mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .brand-copy {
        flex: 1;
      }

      .brand-title {
        font-weight: 700;
        color: var(--gray-800);
        font-size: var(--font-size-base);
        line-height: 1.2;
        display: block;
      }

      .brand-subtitle {
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        display: block;
        margin-top: 2px;
      }

      .nav-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        flex: 1;
      }

      .nav-item {
        justify-content: flex-start;
        gap: var(--space-3);
        border-radius: var(--radius-md);
        width: 100%;
        text-align: left;
        color: var(--gray-600);
        font-weight: 500;
        padding: var(--space-3) var(--space-4);
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: var(--primary-600);
        border-radius: 0 2px 2px 0;
        transition: height 0.2s ease;
      }

      .nav-item:hover {
        background: var(--gray-50);
        color: var(--gray-800);
      }

      .nav-item.active {
        background: var(--primary-50);
        color: var(--primary-700);
      }

      .nav-item.active::before {
        height: 60%;
      }

      .nav-item.active .nav-icon {
        color: var(--primary-600);
      }

      .nav-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        transition: transform 0.2s ease;
      }

      .nav-item:hover .nav-icon {
        transform: scale(1.1);
      }

      .nav-label {
        flex: 1;
      }

      .nav-badge {
        background: var(--primary-100);
        color: var(--primary-700);
        border-radius: 12px;
        padding: 2px 8px;
        font-size: var(--font-size-xs);
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }

      .nav-item.active .nav-badge {
        background: var(--primary-600);
        color: white;
      }

      .sidebar-footer {
        padding-top: var(--space-4);
        border-top: 1px solid var(--gray-200);
      }

      .help-card {
        background: linear-gradient(135deg, var(--secondary-50), var(--secondary-100));
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        display: flex;
        gap: var(--space-3);
        align-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .help-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .help-icon {
        color: var(--secondary-600);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .help-title {
        font-weight: 600;
        color: var(--gray-800);
        font-size: var(--font-size-sm);
      }

      .help-subtitle {
        font-size: var(--font-size-xs);
        color: var(--gray-600);
      }

      .shell-content {
        padding: var(--space-8);
        overflow-y: auto;
      }

      .shell-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-6);
        margin-bottom: var(--space-8);
      }

      .header-text {
        flex: 1;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        color: var(--gray-500);
        margin-bottom: var(--space-3);
      }

      .breadcrumb-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .breadcrumb-separator {
        color: var(--gray-400);
      }

      .breadcrumb-current {
        color: var(--gray-700);
        font-weight: 500;
      }

      .shell-title {
        margin: 0;
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--gray-900);
        line-height: 1.2;
      }

      .shell-subtitle {
        margin: var(--space-3) 0 0 0;
        color: var(--gray-600);
        max-width: 640px;
        line-height: 1.6;
      }

      .header-actions {
        display: flex;
        gap: var(--space-3);
        align-items: center;
      }

      .shell-body {
        animation: fadeInUp 0.4s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 1024px) {
        .dashboard-shell {
          grid-template-columns: 1fr;
        }

        .shell-sidebar {
          position: relative;
          height: auto;
          flex-direction: row;
          overflow-x: auto;
          gap: var(--space-4);
          padding: var(--space-4);
        }

        .brand-block {
          border-bottom: none;
          border-right: 1px solid var(--gray-200);
          padding-bottom: 0;
          padding-right: var(--space-4);
        }

        .nav-list {
          flex-direction: row;
          align-items: center;
          flex: 1;
        }

        .nav-item {
          min-width: 140px;
          white-space: nowrap;
        }

        .sidebar-footer {
          display: none;
        }

        .shell-content {
          padding: var(--space-4);
        }

        .shell-title {
          font-size: var(--font-size-2xl);
        }
      }

      @media (max-width: 640px) {
        .breadcrumb {
          display: none;
        }

        .shell-header {
          flex-direction: column;
          gap: var(--space-4);
        }

        .header-actions {
          width: 100%;
          justify-content: stretch;
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

