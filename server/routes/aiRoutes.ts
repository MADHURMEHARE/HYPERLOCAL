import { Router } from 'express';
import { AiController } from '../controllers/AiController';

const router = Router();

router.post('/analyze-image', AiController.analyzeImage);
router.post('/check-duplicate', AiController.checkDuplicate);
router.post('/reverse-geocode', AiController.reverseGeocode);
router.post('/chat', AiController.chat);

export default router;
