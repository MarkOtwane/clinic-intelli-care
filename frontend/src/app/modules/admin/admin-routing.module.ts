import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/admin-profile.component').then(
        (m) => m.AdminProfileComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/admin-settings.component').then(
        (m) => m.AdminSettingsComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
