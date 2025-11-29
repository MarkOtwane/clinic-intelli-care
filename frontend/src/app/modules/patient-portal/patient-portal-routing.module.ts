import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientPortalComponent } from './patient-portal.component';

const routes: Routes = [
  {
    path: '',
    component: PatientPortalComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../dashboard/patient-dashboard/patient-dashboard.component').then(
            (m) => m.PatientDashboardComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./views/patient-appointments.component').then(
            (m) => m.PatientAppointmentsComponent,
          ),
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('./views/patient-analysis.component').then(
            (m) => m.PatientAnalysisComponent,
          ),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./views/patient-prescriptions.component').then(
            (m) => m.PatientPrescriptionsComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./views/patient-notifications.component').then(
            (m) => m.PatientNotificationsComponent,
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
export class PatientPortalRoutingModule {}

