import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChangePasswordComponent } from './components/change-password.component';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Clinic IntelliCare',
  },
  {
    path: 'signup',
    component: SignupComponent,
    title: 'Sign Up - Clinic IntelliCare',
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    title: 'Change Password - Clinic IntelliCare',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
