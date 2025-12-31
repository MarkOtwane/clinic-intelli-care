import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },

  // Protected routes wrapped in LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
        {
            path: 'dashboard',
            loadChildren: () =>
              import('./modules/dashboard/dashboard.module').then(
                (m) => m.DashboardModule
              ),
        },
        // Patient routes
        {
          path: 'patient',
          canActivate: [RoleGuard],
          data: { roles: [UserRole.PATIENT] },
          loadChildren: () =>
            import('./modules/patient-portal/patient-portal.module').then(
              (m) => m.PatientPortalModule
            ),
        },
        // Doctor routes
        {
          path: 'doctor',
          canActivate: [RoleGuard],
          data: { roles: [UserRole.DOCTOR] },
          loadChildren: () =>
            import('./modules/doctors/doctors.module').then((m) => m.DoctorsModule),
        },
        // Admin routes
        {
          path: 'admin',
          canActivate: [RoleGuard],
          data: { roles: [UserRole.ADMIN] },
          loadChildren: () =>
            import('./modules/admin/admin.module').then((m) => m.AdminModule),
        },
        // Public feature routes
        {
          path: 'doctors',
          loadComponent: () =>
            import('./features/doctors/doctors.component').then(
              (m) => m.DoctorsComponent
            ),
        },
        {
          path: 'blogs',
          canActivate: [RoleGuard],
          data: { roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN] },
          loadChildren: () =>
            import('./modules/blog/blog.module').then((m) => m.BlogModule),
        },
        // Core feature routes
        {
          path: 'appointments',
          loadChildren: () =>
            import('./modules/appointments/appointments.module').then(
              (m) => m.AppointmentsModule
            ),
        },
        {
          path: 'ai-analysis',
          loadChildren: () =>
            import('./modules/ai-analysis/ai-analysis.module').then(
              (m) => m.AiAnalysisModule
            ),
        },
        {
          path: 'prescriptions',
          loadChildren: () =>
            import('./modules/prescriptions/prescriptions.module').then(
              (m) => m.PrescriptionsModule
            ),
        },
        {
          path: 'notifications',
          loadChildren: () =>
            import('./modules/notifications/notifications.module').then(
              (m) => m.NotificationsModule
            ),
        },
        {
          path: 'settings',
          loadChildren: () =>
            import('./modules/settings/settings.module').then(
              (m) => m.SettingsModule
            ),
        },
        // Legacy routes (for backward compatibility)
        {
          path: 'users',
          canActivate: [RoleGuard],
          data: { roles: [UserRole.ADMIN] },
          loadComponent: () =>
            import('./features/users/users.component').then((m) => m.UsersComponent),
        },
        {
          path: 'patients',
          canActivate: [RoleGuard],
          data: { roles: [UserRole.ADMIN, UserRole.DOCTOR] },
          loadComponent: () =>
            import('./features/patients/patients.component').then(
              (m) => m.PatientsComponent
            ),
        },
    ]
  },

  // Default redirects
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
