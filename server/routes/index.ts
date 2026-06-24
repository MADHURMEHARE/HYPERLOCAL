import { Router } from 'express';
import authRoutes from './authRoutes';
import issueRoutes from './issueRoutes';
import notificationRoutes from './notificationRoutes';
import aiRoutes from './aiRoutes';
import { AiController } from '../controllers/AiController';
import { IssueController } from '../controllers/IssueController';

const apiRouter = Router();

// Modular sub-routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/issues', issueRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/ai', aiRoutes);

// Miscellaneous root API mappings matching original endpoints
apiRouter.get('/predictions', AiController.getPredictions);
apiRouter.get('/leaderboard', AiController.getLeaderboard);

apiRouter.get('/users', IssueController.getUsers);
apiRouter.post('/users/:id/role', IssueController.changeUserRole);

apiRouter.get('/comments', IssueController.getComments);
apiRouter.post('/comments', IssueController.createCommentDirect);

export default apiRouter;
