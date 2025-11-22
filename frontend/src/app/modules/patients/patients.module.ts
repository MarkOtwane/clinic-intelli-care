import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientsRoutingModule } from './patients-routing.module';

@NgModule({
  imports: [
    CommonModule,
    PatientsRoutingModule
  ]
})
export class PatientsModule { }