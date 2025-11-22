import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrescriptionCreateComponent } from './components/prescription-create.component';
import { PrescriptionHistoryComponent } from './components/prescription-history.component';
import { MedicationTrackerComponent } from './components/medication-tracker.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: PrescriptionCreateComponent,
    title: 'Create Prescription - Clinic IntelliCare'
  },
  {
    path: 'history/:patientId',
    component: PrescriptionHistoryComponent,
    title: 'Prescription History - Clinic IntelliCare'
  },
  {
    path: 'tracker/:patientId',
    component: MedicationTrackerComponent,
    title: 'Medication Tracker - Clinic IntelliCare'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrescriptionsRoutingModule { }
