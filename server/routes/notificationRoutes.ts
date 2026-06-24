import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

router.get('/', NotificationController.getAll);
router.get('/:userId', NotificationController.getByUserId);
router.post('/:userId/read-all', NotificationController.readAll);

export default router;
