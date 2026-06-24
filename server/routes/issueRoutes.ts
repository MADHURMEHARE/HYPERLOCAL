import { Router } from 'express';
import { IssueController } from '../controllers/IssueController';

const router = Router();

router.get('/', IssueController.getAll);
router.post('/', IssueController.create);
router.get('/:id', IssueController.getById);
router.post('/:id/vote', IssueController.vote);
router.post('/:id/verify', IssueController.verify);
router.post('/:id/comment', IssueController.comment);
router.put('/:id/status', IssueController.updateStatus);
router.post('/:id/status', IssueController.updateStatus);
router.post('/:id/delete', IssueController.delete);

export default router;
