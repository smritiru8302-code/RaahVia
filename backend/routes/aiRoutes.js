import express from 'express';
import {
  chatWithAI,
  getAILocationInfo,
  getNavigationAssistance
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// AI routes
router.post('/chat', optionalAuth, chatWithAI);
router.get('/location-info', optionalAuth, getAILocationInfo);
router.get('/navigation-assistance', optionalAuth, getNavigationAssistance);

export default router;
