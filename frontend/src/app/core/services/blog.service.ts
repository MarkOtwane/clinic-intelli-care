import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog, CreateBlogDto, UpdateBlogDto } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = '/api/blogs';

  constructor(private http: HttpClient) {}

  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  getBlogById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  getBlogsByAuthor(authorId: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/author/${authorId}`);
  }

  getPublishedBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/published`);
  }

  createBlog(blog: CreateBlogDto): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blog);
  }

  updateBlog(id: string, blog: UpdateBlogDto): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}`, blog);
  }

  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publishBlog(id: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishBlog(id: string): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}/unpublish`, {});
  }
}
