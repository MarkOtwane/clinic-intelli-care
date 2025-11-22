import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientListComponent } from './components/patient-list.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule { }