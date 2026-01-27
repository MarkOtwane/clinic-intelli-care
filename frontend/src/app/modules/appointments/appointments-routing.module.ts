import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentBookingComponent } from './components/appointment-booking.component';
import { AppointmentCalendarComponent } from './components/appointment-calendar.component';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../patient-portal/views/patient-appointments.component').then(
        (m) => m.PatientAppointmentsComponent,
      ),
    title: 'My Appointments - Clinic IntelliCare',
  },
  {
    path: 'calendar',
    component: AppointmentCalendarComponent,
    title: 'Calendar - Clinic IntelliCare',
  },
  {
    path: 'book',
    component: AppointmentBookingComponent,
    title: 'Book Appointment - Clinic IntelliCare',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
