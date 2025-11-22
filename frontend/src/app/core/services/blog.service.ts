import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  authorName?: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  published: boolean;
  views: number;
  likes: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  published?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export interface Comment {
  id: string;
  blogId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  blogId: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blogs`;
  private selectedBlogSubject = new BehaviorSubject<Blog | null>(null);
  public selectedBlog$ = this.selectedBlogSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all blogs
   */
  getAllBlogs(published?: boolean): Observable<Blog[]> {
    const params = published !== undefined ? { published: published.toString() } : {};
    return this.http.get<Blog[]>(this.apiUrl, { params });
  }

  /**
   * Get blog by ID
   */
  getBlogById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`).pipe(
      tap(blog => this.selectedBlogSubject.next(blog))
    );
  }

  /**
   * Get blogs by category
   */
  getBlogsByCategory(category: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/category/${category}`);
  }

  /**
   * Search blogs
   */
  searchBlogs(query: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  /**
   * Create new blog
   */
  createBlog(blogData: CreateBlogDto): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blogData);
  }

  /**
   * Update blog
   */
  updateBlog(id: string, blogData: UpdateBlogDto): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}`, blogData).pipe(
      tap(blog => {
        if (this.selectedBlogSubject.value?.id === id) {
          this.selectedBlogSubject.next(blog);
        }
      })
    );
  }

  /**
   * Delete blog
   */
  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        if (this.selectedBlogSubject.value?.id === id) {
          this.selectedBlogSubject.next(null);
        }
      })
    );
  }

  /**
   * Like blog
   */
  likeBlog(id: string): Observable<Blog> {
    return this.http.post<Blog>(`${this.apiUrl}/${id}/like`, {});
  }

  /**
   * Get blog comments
   */
  getBlogComments(blogId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${blogId}/comments`);
  }

  /**
   * Add comment to blog
   */
  addComment(commentData: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${commentData.blogId}/comments`, commentData);
  }

  /**
   * Delete comment
   */
  deleteComment(blogId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}/comments/${commentId}`);
  }

  /**
   * Set selected blog
   */
  setSelectedBlog(blog: Blog | null): void {
    this.selectedBlogSubject.next(blog);
  }

  /**
   * Clear selected blog
   */
  clearSelectedBlog(): void {
    this.selectedBlogSubject.next(null);
  }
}
