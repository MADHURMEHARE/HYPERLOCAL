import { prisma, runWithFallback } from '../../prisma/prisma-client';
import { Notification } from '../../src/types';
import { NOTIFICATIONS } from '../db';

export class NotificationRepository {
  static async getAll(): Promise<Notification[]> {
    return runWithFallback(
      async () => {
        const notifications = await prisma!.notification.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return notifications.map(n => ({
          ...n,
          type: n.type as 'info' | 'success' | 'warning' | 'alert',
          createdAt: n.createdAt.toISOString()
        }));
      },
      async () => {
        return NOTIFICATIONS;
      }
    );
  }

  static async getByUserId(userId: string): Promise<Notification[]> {
    return runWithFallback(
      async () => {
        const notifications = await prisma!.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        });
        return notifications.map(n => ({
          ...n,
          type: n.type as 'info' | 'success' | 'warning' | 'alert',
          createdAt: n.createdAt.toISOString()
        }));
      },
      async () => {
        return NOTIFICATIONS.filter(n => n.userId === userId);
      }
    );
  }

  static async create(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert', issueId?: string): Promise<void> {
    const notifId = 'notif_' + Math.random().toString(36).substring(2, 11);
    await runWithFallback(
      async () => {
        await prisma!.notification.create({
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
      },
      async () => {
        const newNotif: Notification = {
          id: notifId,
          userId,
          title,
          message,
          type,
          isRead: false,
          issueId,
          createdAt: new Date().toISOString()
        };
        NOTIFICATIONS.unshift(newNotif);
      }
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await runWithFallback(
      async () => {
        await prisma!.notification.updateMany({
          where: { userId },
          data: {
            isRead: true
          }
        });
      },
      async () => {
        NOTIFICATIONS.forEach(n => {
          if (n.userId === userId) {
            n.isRead = true;
          }
        });
      }
    );
  }
}
