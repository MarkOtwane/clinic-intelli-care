import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  getCommentsByBlogPost(blogPostId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?blogPostId=${blogPostId}`, {
      withCredentials: true,
    });
  }

  createComment(comment: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment, {
      withCredentials: true,
    });
  }

  updateComment(id: string, comment: UpdateCommentDto): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}`, comment, {
      withCredentials: true,
    });
  }

  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
