import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Blog,
  CreateBlogDto,
  UpdateBlogDto,
} from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = '/api/blogs';

  constructor(private http: HttpClient) {}

  private normalizeBlog(blog: Blog): Blog {
    return {
      ...blog,
      createdAt: blog.createdAt ? new Date(blog.createdAt) : blog.createdAt,
      updatedAt: blog.updatedAt ? new Date(blog.updatedAt) : blog.updatedAt,
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : blog.publishedAt,
    };
  }

  private withCredentialsOptions = { withCredentials: true };

  getAllBlogs(): Observable<Blog[]> {
    return this.http
      .get<Blog[]>(this.apiUrl, this.withCredentialsOptions)
      .pipe(map((blogs) => blogs.map((blog) => this.normalizeBlog(blog))));
  }

  getBlogById(id: string): Observable<Blog> {
    return this.http
      .get<Blog>(`${this.apiUrl}/${id}`, this.withCredentialsOptions)
      .pipe(map((blog) => this.normalizeBlog(blog)));
  }

  getBlogsByAuthor(authorId: string): Observable<Blog[]> {
    return this.http
      .get<Blog[]>(`${this.apiUrl}/doctor/${authorId}`, this.withCredentialsOptions)
      .pipe(map((blogs) => blogs.map((blog) => this.normalizeBlog(blog))));
  }

  getPublishedBlogs(): Observable<Blog[]> {
    return this.getAllBlogs();
  }

  createBlog(blog: CreateBlogDto): Observable<Blog> {
    return this.http
      .post<Blog>(this.apiUrl, blog, this.withCredentialsOptions)
      .pipe(map((created) => this.normalizeBlog(created)));
  }

  updateBlog(id: string, blog: UpdateBlogDto): Observable<Blog> {
    return this.http
      .patch<Blog>(`${this.apiUrl}/${id}`, blog, this.withCredentialsOptions)
      .pipe(map((updated) => this.normalizeBlog(updated)));
  }

  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.withCredentialsOptions);
  }

  publishBlog(id: string): Observable<Blog> {
    return this.http
      .patch<Blog>(`${this.apiUrl}/${id}/publish`, {}, this.withCredentialsOptions)
      .pipe(map((post) => this.normalizeBlog(post)));
  }

  unpublishBlog(id: string): Observable<Blog> {
    return this.http
      .patch<Blog>(`${this.apiUrl}/${id}/unpublish`, {}, this.withCredentialsOptions)
      .pipe(map((post) => this.normalizeBlog(post)));
  }

  getMyBlogs(): Observable<Blog[]> {
    return this.http
      .get<Blog[]>(`${this.apiUrl}/my-blogs`, this.withCredentialsOptions)
      .pipe(map((blogs) => blogs.map((blog) => this.normalizeBlog(blog))));
  }
}
