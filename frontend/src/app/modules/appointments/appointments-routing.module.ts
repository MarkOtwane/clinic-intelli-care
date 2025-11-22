import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppointmentCalendarComponent } from './components/appointment-calendar.component';
import { AppointmentBookingComponent } from './components/appointment-booking.component';

const routes: Routes = [
  {
    path: '',
    component: AppointmentCalendarComponent,
    title: 'Appointment Calendar - Clinic IntelliCare'
  },
  {
    path: 'calendar',
    component: AppointmentCalendarComponent,
    title: 'Calendar - Clinic IntelliCare'
  },
  {
    path: 'book',
    component: AppointmentBookingComponent,
    title: 'Book Appointment - Clinic IntelliCare'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }