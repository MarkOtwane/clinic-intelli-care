import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./posts/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./posts/blog-detail.component').then(
        (m) => m.BlogDetailComponent,
      ),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class BlogModule {}
