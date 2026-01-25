import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/admin-profile.component').then(
        (m) => m.AdminProfileComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/admin-settings.component').then(
        (m) => m.AdminSettingsComponent,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/manage-users.component').then(
        (m) => m.ManageUsersComponent,
      ),
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./components/manage-doctors.component').then(
        (m) => m.ManageDoctorsComponent,
      ),
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./components/manage-patients.component').then(
        (m) => m.ManagePatientsComponent,
      ),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./components/analytics.component').then(
        (m) => m.AnalyticsComponent,
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports.component').then((m) => m.ReportsComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
