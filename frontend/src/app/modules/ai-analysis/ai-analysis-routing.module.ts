import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SymptomAnalysisComponent } from './components/symptom-analysis.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'symptoms',
    pathMatch: 'full'
  },
  {
    path: 'symptoms',
    component: SymptomAnalysisComponent,
    title: 'AI Symptom Analysis - Clinic IntelliCare'
  },
  {
    path: 'history',
    component: SymptomAnalysisComponent,
    title: 'Analysis History - Clinic IntelliCare'
  },
  {
    path: '**',
    redirectTo: 'symptoms'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AiAnalysisRoutingModule { }