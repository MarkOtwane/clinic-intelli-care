import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  DashboardLayoutComponent,
  DashboardNavLink,
} from '../../shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [DashboardLayoutComponent, RouterOutlet],
  template: `
    <app-dashboard-layout
      [title]="title"
      [subtitle]="subtitle"
      [links]="links"
    >
      <router-outlet></router-outlet>
    </app-dashboard-layout>
  `,
})
export class PatientLayoutComponent {
  title = 'Patient workspace';
  subtitle =
    'Track your care plan, appointments, and prescriptions from one secure place.';

  links: DashboardNavLink[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: 'dashboard' },
    { label: 'AI Analysis', icon: 'smart_toy', route: 'analysis' },
    { label: 'Appointments', icon: 'event', route: 'appointments' },
    { label: 'Prescriptions', icon: 'vaccines', route: 'prescriptions' },
    { label: 'Notifications', icon: 'notifications', route: 'notifications' },
  ];
}

