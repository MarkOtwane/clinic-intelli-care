export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: any; // Additional data specific to notification type
  actionUrl?: string;
  priority: NotificationPriority;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  AI_ANALYSIS_COMPLETE = 'AI_ANALYSIS_COMPLETE',
  NEW_PRESCRIPTION = 'NEW_PRESCRIPTION',
  BLOG_POST_UPDATE = 'BLOG_POST_UPDATE',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  data?: any;
  actionUrl?: string;
  scheduledFor?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  appointmentReminders: boolean;
  prescriptionUpdates: boolean;
  blogUpdates: boolean;
  systemAlerts: boolean;
}