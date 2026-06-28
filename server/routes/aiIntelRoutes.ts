import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { AiIntelController } from '../controllers/AiIntelController';
import { NewsController } from '../controllers/NewsController';

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authMiddleware as any);

// Incident Routes
router.get('/incidents', AiIntelController.getIncidents as any);
router.get('/incidents/:id', AiIntelController.getIncidentById as any);
router.post('/incidents/:id/verify', AiIntelController.verifyIncident as any);
router.delete('/incidents/:id', AiIntelController.deleteIncident as any);

// crawling/ingestion pipeline trigger
router.post('/crawl', AiIntelController.triggerCrawl as any);

// News Source Routes
router.get('/sources', NewsController.getSources as any);
router.post('/sources', NewsController.createSource as any);
router.put('/sources/:id', NewsController.toggleSource as any);

export default router;
