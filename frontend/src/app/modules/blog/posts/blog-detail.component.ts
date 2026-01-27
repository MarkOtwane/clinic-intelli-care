import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Blog } from '../../../core/models/blog.model';
import { Comment } from '../../../core/models/comment.model';
import { AuthService } from '../../../core/services/auth.service';
import { BlogService } from '../../../core/services/blog.service';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="blog-detail-container" *ngIf="blog">
      <button mat-button (click)="goBack()" class="back-button">
        <mat-icon>arrow_back</mat-icon>
        Back to Blogs
      </button>

      <mat-card class="blog-content-card">
        <mat-card-header>
          <mat-card-title class="blog-title">{{ blog.title }}</mat-card-title>
          <mat-card-subtitle class="blog-meta">
            <div class="author-info">
              <mat-icon>person</mat-icon>
              <span>{{ blog.author?.name || 'Medical Staff' }}</span>
            </div>
            <div class="date-info">
              <mat-icon>schedule</mat-icon>
              <span>{{ blog.createdAt | date: 'MMM d, y' }}</span>
            </div>
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="blog-text" [innerHTML]="blog.content"></div>
        </mat-card-content>
      </mat-card>

      <!-- Comments Section -->
      <mat-card class="comments-section">
        <mat-card-header>
          <mat-card-title> Comments ({{ comments.length }}) </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Add Comment Form -->
          <div class="add-comment" *ngIf="isPatient">
            <h3>Leave a Comment</h3>
            <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Your comment</mat-label>
                <textarea
                  matInput
                  formControlName="content"
                  rows="4"
                  placeholder="Share your thoughts..."
                ></textarea>
                <mat-error
                  *ngIf="commentForm.get('content')?.hasError('required')"
                >
                  Comment is required
                </mat-error>
              </mat-form-field>
              <div class="comment-actions">
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="!commentForm.valid || isSubmitting"
                >
                  <mat-icon>send</mat-icon>
                  Post Comment
                </button>
              </div>
            </form>
          </div>

          <!-- Comments List -->
          <div class="comments-list">
            <div *ngIf="isLoadingComments" class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading comments...</p>
            </div>

            <div
              *ngIf="!isLoadingComments && comments.length === 0"
              class="empty-state"
            >
              <mat-icon>chat_bubble_outline</mat-icon>
              <p>No comments yet</p>
              <p class="muted">Be the first to comment on this article!</p>
            </div>

            <div *ngFor="let comment of comments" class="comment-item">
              <div class="comment-header">
                <div class="comment-author">
                  <div class="author-avatar">
                    {{ getInitials(comment.author) }}
                  </div>
                  <div class="author-details">
                    <div class="author-name">
                      {{ getAuthorName(comment.author) }}
                    </div>
                    <div class="comment-date">
                      {{ comment.createdAt | date: 'MMM d, y h:mm a' }}
                    </div>
                  </div>
                </div>
                <button
                  mat-icon-button
                  *ngIf="canDeleteComment(comment)"
                  (click)="deleteComment(comment.id)"
                  [disabled]="isDeleting"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div *ngIf="!blog && !isLoading" class="error-state">
      <mat-icon>error_outline</mat-icon>
      <h2>Blog not found</h2>
      <button mat-raised-button color="primary" (click)="goBack()">
        Go Back
      </button>
    </div>

    <div *ngIf="isLoading" class="loading-container">
      <mat-spinner></mat-spinner>
      <p>Loading blog post...</p>
    </div>
  `,
  styles: [
    `
      .blog-detail-container {
        max-width: 900px;
        margin: 0 auto;
        padding: var(--space-6);
      }

      .back-button {
        margin-bottom: var(--space-4);
      }

      .blog-content-card {
        margin-bottom: var(--space-6);
      }

      .blog-title {
        font-size: 32px;
        font-weight: 700;
        line-height: 1.3;
        margin-bottom: var(--space-3);
      }

      .blog-meta {
        display: flex;
        gap: var(--space-4);
        align-items: center;
        margin-top: var(--space-2);
      }

      .author-info,
      .date-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--gray-600);
      }

      .author-info mat-icon,
      .date-info mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .blog-text {
        font-size: 16px;
        line-height: 1.8;
        color: var(--gray-800);
        margin-top: var(--space-4);
        white-space: pre-wrap;
      }

      .comments-section {
        margin-top: var(--space-6);
      }

      .add-comment {
        padding: var(--space-4);
        background: var(--gray-50);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-6);
      }

      .add-comment h3 {
        margin: 0 0 var(--space-4);
        font-size: 18px;
        font-weight: 600;
      }

      .full-width {
        width: 100%;
      }

      .comment-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: var(--space-3);
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .comment-item {
        padding: var(--space-4);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        transition: border-color 0.2s;
      }

      .comment-item:hover {
        border-color: var(--primary-300);
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-3);
      }

      .comment-author {
        display: flex;
        gap: var(--space-3);
        align-items: center;
      }

      .author-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-600);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }

      .author-name {
        font-weight: 600;
        color: var(--gray-900);
      }

      .comment-date {
        font-size: 12px;
        color: var(--gray-500);
      }

      .comment-content {
        color: var(--gray-700);
        line-height: 1.6;
        white-space: pre-wrap;
      }

      .loading-state,
      .empty-state,
      .error-state,
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        text-align: center;
      }

      .empty-state mat-icon,
      .error-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--gray-400);
        margin-bottom: var(--space-3);
      }

      .muted {
        color: var(--gray-500);
        font-size: 14px;
      }

      @media (max-width: 768px) {
        .blog-detail-container {
          padding: var(--space-4);
        }

        .blog-title {
          font-size: 24px;
        }

        .blog-meta {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  blog: Blog | null = null;
  comments: Comment[] = [];
  commentForm: FormGroup;
  isLoading = true;
  isLoadingComments = true;
  isSubmitting = false;
  isDeleting = false;
  currentUser: any = null;

  get isPatient(): boolean {
    return this.currentUser?.role === 'PATIENT';
  }

  constructor() {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      this.loadBlog(blogId);
      this.loadComments(blogId);
    }
  }

  private loadBlog(id: string) {
    this.isLoading = true;
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.isLoading = false;
      },
    });
  }

  private loadComments(blogId: string) {
    this.isLoadingComments = true;
    this.commentService.getCommentsByBlogPost(blogId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoadingComments = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.isLoadingComments = false;
      },
    });
  }

  submitComment() {
    if (!this.commentForm.valid || !this.blog) return;

    this.isSubmitting = true;
    const commentData = {
      content: this.commentForm.value.content,
      blogPostId: this.blog.id,
    };

    this.commentService.createComment(commentData).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.commentForm.reset();
        this.snackBar.open('✓ Comment posted successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error posting comment:', error);
        this.snackBar.open('✗ Failed to post comment', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar',
        });
        this.isSubmitting = false;
      },
    });
  }

  deleteComment(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.isDeleting = true;
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c.id !== commentId);
        this.snackBar.open('✓ Comment deleted', 'Close', { duration: 3000 });
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.snackBar.open('✗ Failed to delete comment', 'Close', {
          duration: 3000,
        });
        this.isDeleting = false;
      },
    });
  }

  canDeleteComment(comment: Comment): boolean {
    return (
      this.currentUser?.id === comment.authorId ||
      this.currentUser?.role === 'ADMIN'
    );
  }

  getAuthorName(author?: any): string {
    if (!author) return 'Anonymous';
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return author.firstName || author.lastName || 'Anonymous';
  }

  getInitials(author?: any): string {
    if (!author) return 'A';
    const firstName = author.firstName || '';
    const lastName = author.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'A';
  }

  goBack() {
    this.router.navigate(['/blogs']);
  }
}
