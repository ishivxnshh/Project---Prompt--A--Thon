import express from 'express';
import { prioritizeTasks, analyzeTask } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.use(authMiddleware);

router.post('/prioritize', prioritizeTasks);
router.post('/analyze', analyzeTask);

export default router;
