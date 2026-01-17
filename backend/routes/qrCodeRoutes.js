import express from 'express';
import {
  getQRCode,
  getQRCodeByLocation,
  scanQRCode,
  getQRCodeStats,
  getAllQRCodes
} from '../controllers/qrCodeController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/location/:locationId', getQRCodeByLocation);
router.get('/stats/:locationId', getQRCodeStats);
router.post('/scan', optionalAuth, scanQRCode);

// Protected routes
router.get('/', protect, authorize('admin'), getAllQRCodes);
router.get('/:id', getQRCode);

export default router;
