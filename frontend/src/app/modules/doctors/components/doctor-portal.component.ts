import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  DashboardLayoutComponent,
  DashboardNavLink,
} from '../../../shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-doctor-portal',
  standalone: true,
  imports: [DashboardLayoutComponent, RouterOutlet],
  template: `
    <app-dashboard-layout [title]="title" [subtitle]="subtitle" [links]="links">
      <router-outlet></router-outlet>
    </app-dashboard-layout>
  `,
})
export class DoctorPortalComponent {
  title = 'Doctor workspace';
  subtitle =
    'Coordinate care, review patient records, and monitor your performance.';

  links: DashboardNavLink[] = [
    { label: 'Overview', icon: 'dashboard', route: 'dashboard' },
    { label: 'Appointments', icon: 'event', route: 'appointments' },
    { label: 'Patients', icon: 'group', route: 'patients' },
    { label: 'My Blog Posts', icon: 'article', route: 'blog', exact: false },
    {
      label: 'Write Blog Post',
      icon: 'edit',
      route: 'blog/create',
      exact: false,
    },
    { label: 'Prescriptions', icon: 'vaccines', route: 'prescriptions' },
    { label: 'Notifications', icon: 'notifications', route: 'notifications' },
    { label: 'Analytics', icon: 'insights', route: 'analytics' },
  ];
}
