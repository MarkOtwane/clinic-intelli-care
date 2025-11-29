import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DoctorDashboardComponent } from './components/doctor-dashboard.component';
import { DoctorPortalComponent } from './components/doctor-portal.component';

const routes: Routes = [
  {
    path: '',
    component: DoctorPortalComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: DoctorDashboardComponent,
        title: 'Doctor Dashboard - Clinic IntelliCare',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./views/doctor-appointments.component').then(
            (m) => m.DoctorAppointmentsComponent,
          ),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./views/doctor-patients.component').then(
            (m) => m.DoctorPatientsComponent,
          ),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./views/doctor-prescriptions.component').then(
            (m) => m.DoctorPrescriptionsComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./views/doctor-notifications.component').then(
            (m) => m.DoctorNotificationsComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./views/doctor-analytics.component').then(
            (m) => m.DoctorAnalyticsComponent,
          ),
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./views/doctor-blog-list.component').then(
            (m) => m.DoctorBlogListComponent,
          ),
      },
      {
        path: 'blog/create',
        loadComponent: () =>
          import('./views/doctor-blog-editor.component').then(
            (m) => m.DoctorBlogEditorComponent,
          ),
      },
      {
        path: 'blog/:id/edit',
        loadComponent: () =>
          import('./views/doctor-blog-editor.component').then(
            (m) => m.DoctorBlogEditorComponent,
          ),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
