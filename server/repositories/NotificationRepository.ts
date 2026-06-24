import { NOTIFICATIONS, addNotification } from '../db';
import { Notification } from '../../src/types';

export class NotificationRepository {
  static getAll(): Notification[] {
    return NOTIFICATIONS;
  }

  static getByUserId(userId: string): Notification[] {
    return NOTIFICATIONS.filter(n => n.userId === userId);
  }

  static create(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', issueId?: string): void {
    addNotification(userId, title, message, type, issueId);
  }

  static markAllAsRead(userId: string): void {
    NOTIFICATIONS.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
  }
}
