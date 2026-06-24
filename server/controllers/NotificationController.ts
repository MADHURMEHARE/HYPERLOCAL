import { Request, Response } from 'express';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationController {
  static getAll(req: Request, res: Response) {
    return res.json(NotificationRepository.getAll());
  }

  static getByUserId(req: Request, res: Response) {
    const notifications = NotificationRepository.getByUserId(req.params.userId);
    return res.json(notifications);
  }

  static readAll(req: Request, res: Response) {
    NotificationRepository.markAllAsRead(req.params.userId);
    return res.json({ success: true });
  }
}
