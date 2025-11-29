import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Blog } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-doctor-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <section class="portal-section">
      <header class="section-header">
        <div>
          <p class="eyebrow">Knowledge hub</p>
          <h2>My blog posts</h2>
          <p class="muted">
            Draft and publish educational content for your patients and peers.
          </p>
        </div>
        <button mat-flat-button color="primary" routerLink="/doctor/blog/create">
          <mat-icon>edit</mat-icon>
          Write blog post
        </button>
      </header>

      <div *ngIf="isLoading" class="placeholder">Loading your posts...</div>
      <div *ngIf="error" class="placeholder error">{{ error }}</div>

      <div class="post-grid" *ngIf="!isLoading && posts.length">
        <mat-card *ngFor="let post of posts" class="post-card">
          <mat-card-header>
            <mat-card-title>{{ post.title }}</mat-card-title>
            <mat-card-subtitle>
              {{ post.updatedAt | date : 'mediumDate' }}
              <mat-chip-set>
                <mat-chip color="primary" selected>
                  {{ post.published ? 'Published' : 'Draft' }}
                </mat-chip>
              </mat-chip-set>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="preview">
              {{ post.content | slice : 0 : 180 }}
              <span *ngIf="post.content.length > 180">...</span>
            </p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-stroked-button color="primary" (click)="editPost(post)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deletePost(post)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="placeholder" *ngIf="!isLoading && !posts.length">
        You haven’t written any posts yet. Start by creating your first article.
      </div>
    </section>
  `,
  styles: [
    `
      .portal-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: var(--space-4);
        align-items: center;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: var(--font-size-xs);
        color: var(--gray-500);
        margin: 0 0 var(--space-2);
      }

      .muted {
        color: var(--gray-600);
        margin: 0;
      }

      .post-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: var(--space-4);
      }

      .post-card {
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-md);
      }

      .preview {
        color: var(--gray-700);
        line-height: 1.6;
      }

      .placeholder {
        padding: var(--space-8);
        text-align: center;
        color: var(--gray-600);
        border: 1px dashed var(--gray-200);
        border-radius: var(--radius-lg);
      }

      .placeholder.error {
        border-color: var(--error-200);
        color: var(--error-600);
      }

      @media (max-width: 768px) {
        .section-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .post-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DoctorBlogListComponent implements OnInit {
  posts: Blog[] = [];
  isLoading = true;
  error?: string;

  constructor(
    private blogService: BlogService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.error = undefined;
    this.blogService.getMyBlogs().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load your blog posts right now.';
        this.isLoading = false;
      },
    });
  }

  editPost(post: Blog): void {
    this.router.navigate(['/doctor/blog', post.id, 'edit']);
  }

  deletePost(post: Blog): void {
    const confirmed = confirm(
      `Delete "${post.title}"? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    this.blogService.deleteBlog(post.id).subscribe({
      next: () => {
        this.snackBar.open('Blog post deleted', 'Close', { duration: 2500 });
        this.loadPosts();
      },
      error: () => {
        this.snackBar.open('Failed to delete blog post', 'Close', {
          duration: 4000,
        });
      },
    });
  }
}

