import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientListComponent } from './components/patient-list.component';
import { PatientProfileComponent } from './components/patient-profile.component';
import { PatientRegistrationComponent } from './components/patient-registration.component';

const routes: Routes = [
  {
    path: '',
    component: PatientListComponent,
    title: 'Patient Management - Clinic IntelliCare'
  },
  {
    path: 'list',
    component: PatientListComponent,
    title: 'Patient List - Clinic IntelliCare'
  },
  {
    path: 'register',
    component: PatientRegistrationComponent,
    title: 'Register Patient - Clinic IntelliCare'
  },
  {
    path: ':id',
    component: PatientProfileComponent,
    title: 'Patient Profile - Clinic IntelliCare'
  },
  {
    path: ':id/edit',
    component: PatientRegistrationComponent,
    title: 'Edit Patient - Clinic IntelliCare'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { }
