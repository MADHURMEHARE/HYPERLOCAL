import { Router } from 'express';
import { IssueController } from '../controllers/IssueController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', IssueController.getAll);
router.post('/', authMiddleware, IssueController.create);
router.get('/:id', IssueController.getById);
router.post('/:id/vote', authMiddleware, IssueController.vote);
router.post('/:id/verify', authMiddleware, IssueController.verify);
router.post('/:id/comment', authMiddleware, IssueController.comment);
router.put('/:id/status', authMiddleware, IssueController.updateStatus);
router.post('/:id/status', authMiddleware, IssueController.updateStatus);
router.post('/:id/delete', authMiddleware, IssueController.delete);

export default router;
