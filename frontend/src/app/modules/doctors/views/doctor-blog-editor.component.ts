import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { Blog, CreateBlogDto } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';
import { MediaType } from '../../../core/models/media.model';
import {
  UploadProgress,
  UploadService,
} from '../../../core/services/upload.service';

@Component({
  selector: 'app-doctor-blog-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  template: `
    <section class="portal-section">
      <div class="editor-header">
        <button mat-button color="primary" routerLink="/doctor/blog">
          <mat-icon>arrow_back</mat-icon>
          Back to my posts
        </button>
        <h2>{{ isEditing ? 'Edit blog post' : 'Write a new blog post' }}</h2>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="blogForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" required />
              <mat-error *ngIf="blogForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Content</mat-label>
              <textarea
                matInput
                formControlName="content"
                rows="14"
                required
              ></textarea>
              <mat-error *ngIf="blogForm.get('content')?.hasError('required')">
                Content is required
              </mat-error>
            </mat-form-field>

            <div class="image-upload">
              <label>Featured image (optional)</label>
              <div class="upload-row">
                <input type="file" accept="image/*" (change)="handleImage($event)" />
                <span class="hint">
                  {{ uploadProgressText || 'No file selected' }}
                </span>
              </div>
              <img
                *ngIf="imagePreview"
                [src]="imagePreview"
                alt="Preview"
                class="image-preview"
              />
            </div>

            <div class="publish-toggle">
              <mat-checkbox formControlName="published">
                Publish immediately
              </mat-checkbox>
            </div>

            <div class="actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="blogForm.invalid || isSubmitting"
              >
                {{ isEditing ? 'Update post' : 'Publish post' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .portal-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .editor-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }

      .full-width {
        width: 100%;
      }

      textarea {
        min-height: 280px;
        resize: vertical;
      }

      .image-upload {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin: var(--space-4) 0;
      }

      .upload-row {
        display: flex;
        gap: var(--space-3);
        align-items: center;
      }

      .hint {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
      }

      .image-preview {
        max-width: 320px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }

      .publish-toggle {
        margin: var(--space-4) 0;
        padding: var(--space-3);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-4);
      }

      @media (max-width: 768px) {
        .actions {
          flex-direction: column-reverse;
          align-items: stretch;
        }
      }
    `,
  ],
})
export class DoctorBlogEditorComponent implements OnInit, OnDestroy {
  blogForm: FormGroup;
  isSubmitting = false;
  isEditing = false;
  blogId?: string;
  uploadProgressText = '';
  imageIds: string[] = [];
  imagePreview?: string;
  private uploadSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      published: [true],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.blogId = id;
        this.loadBlog(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
  }

  private loadBlog(id: string): void {
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => this.populateForm(blog),
      error: () => {
        this.snackBar.open('Unable to load blog post', 'Close', {
          duration: 4000,
        });
        this.router.navigate(['/doctor/blog']);
      },
    });
  }

  private populateForm(blog: Blog): void {
    this.blogForm.patchValue({
      title: blog.title,
      content: blog.content,
      published: blog.published,
    });

    if (blog.images && blog.images.length) {
      this.imageIds = [blog.images[0].id];
      this.imagePreview = blog.images[0].url;
    }
  }

  handleImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadProgressText = 'Uploading...';
    this.uploadSub?.unsubscribe();
    this.uploadSub = this.uploadService
      .uploadFile(file, MediaType.BLOG_IMAGE)
      .subscribe({
        next: (progress: UploadProgress) => {
          if (progress.status === 'uploading') {
            this.uploadProgressText = `Uploading ${progress.progress}%`;
          } else if (progress.status === 'completed' && progress.file) {
            this.uploadProgressText = 'Upload complete';
            this.imageIds = [progress.file.id];
            this.imagePreview = progress.file.url;
          }
        },
        error: () => {
          this.uploadProgressText = 'Upload failed';
          this.snackBar.open('Image upload failed', 'Close', { duration: 4000 });
        },
      });
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload: CreateBlogDto = {
      ...this.blogForm.value,
      imageIds: this.imageIds.length ? this.imageIds : undefined,
    };

    const request$ = this.isEditing && this.blogId
      ? this.blogService.updateBlog(this.blogId, payload)
      : this.blogService.createBlog(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Blog post saved', 'Close', { duration: 3000 });
        this.router.navigate(['/doctor/blog']);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to save blog post', 'Close', {
          duration: 4000,
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/doctor/blog']);
  }
}

