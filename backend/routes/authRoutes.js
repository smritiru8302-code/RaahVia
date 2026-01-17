import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  addFavoritePlace,
  removeFavoritePlace,
  getNavigationHistory
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/favorites/add', protect, addFavoritePlace);
router.post('/favorites/remove', protect, removeFavoritePlace);
router.get('/history', protect, getNavigationHistory);

export default router;
