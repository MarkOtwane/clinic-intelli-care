import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./posts/blog-list.component').then(m => m.BlogListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./create-post/create-post.component').then(m => m.CreatePostComponent)
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class BlogModule { }
