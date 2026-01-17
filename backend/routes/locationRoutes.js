import express from 'express';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationsByFloor,
  getLocationsByBlock,
  searchLocations
} from '../controllers/locationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllLocations);
router.get('/search', searchLocations);
router.get('/floor/:floor', getLocationsByFloor);
router.get('/block/:block', getLocationsByBlock);
router.get('/:id', getLocationById);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createLocation);
router.put('/:id', protect, authorize('admin'), updateLocation);
router.delete('/:id', protect, authorize('admin'), deleteLocation);

export default router;
