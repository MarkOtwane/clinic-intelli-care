import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

const routes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.PATIENT] },
    loadComponent: () =>
      import('./patient-dashboard/patient-dashboard.component').then(
        (m) => m.PatientDashboardComponent,
      ),
  },
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.DOCTOR] },
    loadComponent: () =>
      import('./doctor-dashboard/doctor-dashboard.component').then(
        (m) => m.DoctorDashboardComponent,
      ),
  },
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () =>
      import('../admin/components/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class DashboardModule {}
