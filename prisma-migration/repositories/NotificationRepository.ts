import { prisma } from '../../prisma/prisma-client';
import { Notification } from '../../src/types';

export class NotificationRepository {
  static async getAll(): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return notifications.map(n => ({
      ...n,
      type: n.type as 'info' | 'success' | 'warning' | 'alert',
      createdAt: n.createdAt.toISOString()
    }));
  }

  static async getByUserId(userId: string): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return notifications.map(n => ({
      ...n,
      type: n.type as 'info' | 'success' | 'warning' | 'alert',
      createdAt: n.createdAt.toISOString()
    }));
  }

  static async create(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', issueId?: string): Promise<void> {
    const notifId = 'notif_' + Math.random().toString(36).substring(2, 11);
    await prisma.notification.create({
      data: {
        id: notifId,
        userId,
        title,
        message,
        type,
        issueId,
        isRead: false
      }
    });
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId },
      data: {
        isRead: true
      }
    });
  }
}
