import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { Blog } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <div class="blog-container">
      <h1>Health Blog</h1>
      <p class="subtitle">
        Stay informed with the latest health tips and medical insights
      </p>

      <div class="blog-grid">
        <mat-card *ngFor="let blog of blogs" class="blog-card">
          <mat-card-header>
            <mat-card-title>{{ blog.title }}</mat-card-title>
            <mat-card-subtitle>
              {{ blog.author?.name || 'Medical staff' }} ·
              {{ blog.createdAt | date }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ blog.content || '' | slice : 0 : 150 }}...</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">Read More</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .blog-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        color: #333;
        margin-bottom: 8px;
      }

      .subtitle {
        color: #666;
        margin-bottom: 32px;
      }

      .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }

      .blog-card {
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .blog-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }
    `,
  ],
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.blogService.getAllBlogs().subscribe({
      next: (blogs: Blog[]) => {
        this.blogs = blogs;
      },
      error: (error: any) => {
        console.error('Error loading blogs:', error);
      },
    });
  }
}
