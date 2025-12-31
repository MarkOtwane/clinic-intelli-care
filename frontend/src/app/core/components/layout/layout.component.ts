import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    LayoutModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <div class="sidenav-header">
          <div class="logo-container">
            <mat-icon class="logo-icon">local_hospital</mat-icon>
            <span class="logo-text">Clinic IntelliCare</span>
          </div>
        </div>

        <mat-nav-list>
          <!-- Dashboard Link (Dynamic based on role) -->
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <!-- Patient Links -->
          <ng-container *ngIf="currentUser?.role === 'PATIENT'">
            <a mat-list-item routerLink="/patient/analysis" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>health_and_safety</mat-icon>
              <span matListItemTitle>AI Symptom Analysis</span>
            </a>
            <a mat-list-item routerLink="/appointments" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Appointments</span>
            </a>
            <a mat-list-item routerLink="/doctor/prescriptions" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>medication</mat-icon>
              <span matListItemTitle>Prescriptions</span>
            </a>
             <a mat-list-item routerLink="/blogs" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>article</mat-icon>
              <span matListItemTitle>Health Articles</span>
            </a>
          </ng-container>

          <!-- Doctor Links -->
          <ng-container *ngIf="currentUser?.role === 'DOCTOR'">
             <a mat-list-item routerLink="/doctor/patients" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>folder_shared</mat-icon>
              <span matListItemTitle>Patient Cases</span>
            </a>
            <a mat-list-item routerLink="/appointments" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Schedule</span>
            </a>
            <a mat-list-item routerLink="/doctor/blog" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>edit_note</mat-icon>
              <span matListItemTitle>My Blogs</span>
            </a>
             <a mat-list-item routerLink="/prescriptions" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>medication</mat-icon>
              <span matListItemTitle>Prescriptions</span>
            </a>
          </ng-container>

          <!-- Admin Links -->
          <ng-container *ngIf="currentUser?.role === 'ADMIN'">
             <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Manage Users</span>
            </a>
            <a mat-list-item routerLink="/admin/doctors" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>local_hospital</mat-icon>
              <span matListItemTitle>Manage Doctors</span>
            </a>
             <a mat-list-item routerLink="/admin/patients" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>Manage Patients</span>
            </a>
            <a mat-list-item routerLink="/admin/analytics" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>analytics</mat-icon>
              <span matListItemTitle>Analytics</span>
            </a>
             <a mat-list-item routerLink="/admin/reports" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Reports</span>
            </a>
          </ng-container>

          <mat-divider></mat-divider>

          <a mat-list-item routerLink="/settings" routerLinkActive="active-link" (click)="closeDrawerOnMobile()">
            <mat-icon matListItemIcon>settings</mat-icon>
             <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info-mini">
             <div class="user-avatar-mini">
               {{ currentUser?.firstName?.charAt(0) || 'U' }}
             </div>
             <div class="user-details-mini">
                <span class="user-name-mini">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
                <span class="user-role-mini">{{ currentUser?.role | titlecase }}</span>
             </div>
          </div>
           <button mat-icon-button (click)="logout()" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
           </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="main-toolbar">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          
          <span class="toolbar-title">{{ getPageTitle() }}</span>
          
          <span class="spacer"></span>

          <!-- Desktop Header Actions -->
          <div class="header-actions">
             <button mat-icon-button class="notification-btn" aria-label="Notifications">
                <mat-icon matBadge="2" matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
             </button>
             
             <button mat-icon-button [matMenuTriggerFor]="userMenu" class="profile-btn">
                <div class="avatar-circle">
                   {{ currentUser?.firstName?.charAt(0) || 'U' }}
                </div>
             </button>
          </div>

          <mat-menu #userMenu="matMenu">
             <button mat-menu-item routerLink="/profile">
               <mat-icon>person</mat-icon>
               <span>Profile</span>
             </button>
             <button mat-menu-item (click)="logout()">
               <mat-icon>logout</mat-icon>
               <span>Sign Out</span>
             </button>
          </mat-menu>
        </mat-toolbar>
        
        <main class="content-wrapper">
           <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background-color: var(--gray-50, #f9fafb);
    }

    .sidenav {
      width: 260px;
      box-shadow: 1px 0 0 rgba(0, 0, 0, 0.05); /* Subtle border */
      border: none;
      background: white;
      
      .mat-drawer-inner-container {
         display: flex;
         flex-direction: column;
      }
    }
    
    .sidenav-header {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid var(--gray-200, #e5e7eb);
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--primary-600, #4a7aff);
      
      .logo-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      
      .logo-text {
        font-weight: 700;
        font-size: 18px;
        color: var(--gray-900, #111827);
        letter-spacing: -0.02em;
      }
    }
    
    .mat-nav-list {
       flex: 1;
       padding-top: 16px;
    }
    
    .mat-divider {
       margin: 8px 16px; 
    }

    /* Active Link Styles */
    ::ng-deep .mat-mdc-list-item.active-link {
        --mdc-list-list-item-label-text-color: var(--primary-700, #3e69f0);
        --mdc-list-list-item-leading-icon-color: var(--primary-700, #3e69f0);
        background: var(--primary-50, #f0f8ff);
        border-right: 3px solid var(--primary-600, #4a7aff);
    }

    ::ng-deep .mat-mdc-list-item {
       margin: 4px 8px;
       border-radius: 8px;
       
       &:hover:not(.active-link) {
          background-color: var(--gray-100, #f3f4f6);
       }
    }

    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--gray-200, #e5e7eb);
      color: var(--gray-800, #1f2937);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Minimal shadow */
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .content-wrapper {
       padding: 24px;
       max-width: 1600px;
       margin: 0 auto;
    }

    .header-actions {
       display: flex;
       align-items: center;
       gap: 8px;
    }
    
    .avatar-circle {
       width: 32px;
       height: 32px;
       border-radius: 50%;
       background-color: var(--primary-100, #e1f0ff);
       color: var(--primary-700, #3e69f0);
       display: flex;
       align-items: center;
       justify-content: center;
       font-weight: 600;
       font-size: 14px;
    }

    .sidenav-footer {
       padding: 16px;
       border-top: 1px solid var(--gray-200, #e5e7eb);
       display: flex;
       align-items: center;
       justify-content: space-between;
       background-color: var(--gray-50, #f9fafb);
    }
    
    .user-info-mini {
       display: flex;
       align-items: center;
       gap: 12px;
    }
    
    .user-avatar-mini {
       width: 40px;
       height: 40px;
       border-radius: 50%;
       background-color: var(--primary-600, #4a7aff);
       color: white;
       display: flex;
       align-items: center;
       justify-content: center;
       font-weight: 600;
       font-size: 16px;
    }
    
    .user-details-mini {
       display: flex;
       flex-direction: column;
       
       .user-name-mini {
          font-weight: 600;
          font-size: 14px;
          color: var(--gray-900, #111827);
       }
       
       .user-role-mini {
          font-size: 12px;
          color: var(--gray-500, #6b7280);
       }
    }

    @media (max-width: 600px) {
       .content-wrapper {
          padding: 16px;
       }
    }
  `]
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  
  @ViewChild('drawer') drawer!: MatSidenav;

  authService = inject(AuthService);
  router = inject(Router);
  currentUser: User | null = null;
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit() {
     this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
     });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  closeDrawerOnMobile() {
     this.isHandset$.subscribe(isHandset => {
        if (isHandset) {
           this.drawer.close();
        }
     });
  }
  
  getPageTitle(): string {
     // Simple logic to get title from URL (can be improved with Route Data)
     const url = this.router.url.split('/')[1];
     if (!url) return 'Dashboard';
     return url.charAt(0).toUpperCase() + url.slice(1).replace('-', ' ');
  }
}
