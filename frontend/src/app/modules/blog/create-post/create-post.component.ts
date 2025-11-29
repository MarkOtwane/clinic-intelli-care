import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';

import { BlogService } from '../../../core/services/blog.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="create-post-container">
      <div class="header">
        <button
          mat-icon-button
          (click)="goBack()"
          class="back-button"
          type="button"
        >
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">Create New Blog Post</h1>
      </div>

      <mat-card class="create-post-card">
        <mat-card-content>
          <form [formGroup]="blogForm" (ngSubmit)="onSubmit()" class="blog-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Blog Title</mat-label>
              <input
                matInput
                formControlName="title"
                placeholder="Enter an engaging title for your blog post"
                required
              />
              <mat-error *ngIf="blogForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
              <mat-error *ngIf="blogForm.get('title')?.hasError('minlength')">
                Title must be at least 5 characters long
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width content-field">
              <mat-label>Content</mat-label>
              <textarea
                matInput
                formControlName="content"
                placeholder="Write your blog content here... Share your medical insights, patient care tips, or healthcare knowledge."
                rows="15"
                required
              ></textarea>
              <mat-error *ngIf="blogForm.get('content')?.hasError('required')">
                Content is required
              </mat-error>
              <mat-error *ngIf="blogForm.get('content')?.hasError('minlength')">
                Content must be at least 50 characters long
              </mat-error>
            </mat-form-field>

            <div class="publish-section">
              <mat-checkbox formControlName="published" color="primary">
                Publish immediately
              </mat-checkbox>
              <p class="publish-hint">
                {{ blogForm.get('published')?.value ?
                  'Your blog post will be published and visible to all users' :
                  'Your blog post will be saved as a draft and can be published later' }}
              </p>
            </div>

            <div class="form-actions">
              <button
                mat-button
                type="button"
                (click)="goBack()"
                class="cancel-button"
              >
                Cancel
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="blogForm.invalid || isSubmitting"
                class="submit-button"
              >
                <mat-spinner
                  *ngIf="isSubmitting"
                  diameter="20"
                  color="accent"
                ></mat-spinner>
                <span *ngIf="!isSubmitting">
                  {{ blogForm.get('published')?.value ? 'Publish Blog Post' : 'Save as Draft' }}
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .create-post-container {
        padding: var(--space-6);
        max-width: 900px;
        margin: 0 auto;
        background: var(--gray-50);
        min-height: 100vh;
      }

      .header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .back-button {
        color: var(--gray-600);
      }

      .page-title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--gray-800);
        margin: 0;
        font-family: var(--font-family);
      }

      .create-post-card {
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        border: none;
      }

      .blog-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .full-width {
        width: 100%;
      }

      .content-field {
        margin-top: var(--space-4);
      }

      .content-field textarea {
        resize: vertical;
        min-height: 300px;
        line-height: 1.6;
        font-family: var(--font-family);
      }

      .publish-section {
        background: var(--gray-50);
        padding: var(--space-4);
        border-radius: var(--radius-lg);
        border: 1px solid var(--gray-200);
      }

      .publish-hint {
        margin: var(--space-2) 0 0 0;
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        font-style: italic;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-6);
        padding-top: var(--space-4);
        border-top: 1px solid var(--gray-200);
      }

      .cancel-button {
        color: var(--gray-600);
      }

      .submit-button {
        min-width: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .create-post-container {
          padding: var(--space-4);
        }

        .header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-2);
        }

        .page-title {
          font-size: var(--font-size-xl);
        }

        .form-actions {
          flex-direction: column-reverse;
        }

        .submit-button {
          width: 100%;
        }

        .cancel-button {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .content-field textarea {
          min-height: 250px;
        }
      }
    `,
  ],
})
export class CreatePostComponent implements OnInit {
  blogForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      published: [false],
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated and is a doctor
    this.authService.currentUser$.subscribe(user => {
      if (!user || user.role !== 'DOCTOR') {
        this.snackBar.open('You must be logged in as a doctor to create blog posts', 'Close', {
          duration: 5000,
        });
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onSubmit(): void {
    if (this.blogForm.valid) {
      this.isSubmitting = true;
      const blogData = this.blogForm.value;

      this.blogService.createBlog(blogData).subscribe({
        next: (blog) => {
          this.isSubmitting = false;
          const message = blog.published
            ? 'Blog post published successfully!'
            : 'Blog post saved as draft successfully!';
          this.snackBar.open(message, 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/doctor/blog']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating blog post:', error);
          this.snackBar.open('Failed to create blog post. Please try again.', 'Close', {
            duration: 5000,
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/doctor/dashboard']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.blogForm.controls).forEach(key => {
      const control = this.blogForm.get(key);
      control?.markAsTouched();
    });
  }
}