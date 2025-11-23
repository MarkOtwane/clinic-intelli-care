import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  // Patient routes
  {
    path: 'patient',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.PATIENT] },
    loadChildren: () => import('./modules/patients/patients.module').then(m => m.PatientsModule)
  },

  // Doctor routes
  {
    path: 'doctor',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.DOCTOR] },
    loadChildren: () => import('./modules/doctors/doctors.module').then(m => m.DoctorsModule)
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
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
    loadChildren: () => import('./modules/blog/blog.module').then(m => m.BlogModule)
  },

  // Core feature routes
  {
    path: 'appointments',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/appointments/appointments.module').then(m => m.AppointmentsModule)
  },
  {
    path: 'ai-analysis',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/ai-analysis/ai-analysis.module').then(m => m.AiAnalysisModule)
  },
  {
    path: 'prescriptions',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/prescriptions/prescriptions.module').then(m => m.PrescriptionsModule)
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/notifications/notifications.module').then(m => m.NotificationsModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
  },

  // Legacy routes (for backward compatibility)
  {
    path: 'users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () =>
      import('./features/users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'patients',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.DOCTOR] },
    loadComponent: () =>
      import('./features/patients/patients.component').then(
        (m) => m.PatientsComponent
      ),
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
