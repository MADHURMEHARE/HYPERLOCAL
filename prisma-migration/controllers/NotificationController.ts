import { Request, Response } from 'express';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationController {
  static async getAll(req: Request, res: Response) {
    try {
      const notifications = await NotificationRepository.getAll();
      return res.json(notifications);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve notifications.' });
    }
  }

  static async getByUserId(req: Request, res: Response) {
    try {
      const notifications = await NotificationRepository.getByUserId(req.params.userId);
      return res.json(notifications);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve user notifications.' });
    }
  }

  static async readAll(req: Request, res: Response) {
    try {
      await NotificationRepository.markAllAsRead(req.params.userId);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to mark notifications as read.' });
    }
  }
}
