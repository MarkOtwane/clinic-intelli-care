import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  DashboardLayoutComponent,
  DashboardNavLink,
} from '../../shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-patient-portal',
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
export class PatientPortalComponent {
  title = 'Patient workspace';
  subtitle =
    'Track your care plan, appointments, and prescriptions from one secure place.';

  links: DashboardNavLink[] = [
    { label: 'Appointments', icon: 'event', route: 'appointments' },
    { label: 'AI Analysis', icon: 'smart_toy', route: 'analysis' },
    { label: 'Prescriptions', icon: 'vaccines', route: 'prescriptions' },
    { label: 'Notifications', icon: 'notifications', route: 'notifications' },
  ];
}

