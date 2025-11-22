import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Notification, NotificationType, CreateNotificationRequest, NotificationPreferences } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = '/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all notifications for a user
   */
  getNotifications(userId: string, page = 1, limit = 20): Observable<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/read-all`, {});
  }

  /**
   * Create notification (admin only)
   */
  createNotification(notification: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  /**
   * Get notification preferences
   */
  getPreferences(userId: string): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/user/${userId}/preferences`);
  }

  /**
   * Update notification preferences
   */
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.patch<NotificationPreferences>(`${this.apiUrl}/user/${userId}/preferences`, preferences);
  }

  /**
   * Send notification to multiple users
   */
  sendBulkNotification(userIds: string[], notification: Omit<CreateNotificationRequest, 'userId'>): Observable<Notification[]> {
    return this.http.post<Notification[]>(`${this.apiUrl}/bulk`, {
      userIds,
      ...notification
    });
  }

  /**
   * Subscribe to real-time notifications (WebSocket/SSE)
   */
  subscribeToNotifications(userId: string): Observable<Notification> {
    // This would typically use WebSocket or Server-Sent Events
    return this.http.get<Notification>(`${this.apiUrl}/user/${userId}/stream`);
  }

  /**
   * Update unread count locally
   */
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  /**
   * Clear local unread count
   */
  clearUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }
}